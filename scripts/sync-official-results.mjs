import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API_URL = "https://api-prod.premierpadel.com/api/tournament/getTournamentMatches";
const TOURNAMENT_SLUG = "pretoria-p1";
const EVENT_START = "2026-07-26";
const EVENT_END = "2026-08-02";
const OUTPUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../data/official-results.json"
);
const MODULE_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../js/official-results-snapshot.js"
);

function tournamentDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function roundLabel(value = "") {
  const labels = {
    R128: "Round of 128",
    R64: "Round of 64",
    R32: "Round of 32",
    R16: "Round of 16",
    QF: "Quarter-final",
    SF: "Semi-final",
    F: "Final"
  };
  return labels[value.toUpperCase()] || value || "Tournament match";
}

function courtLabel(value = "") {
  return value
    .toLowerCase()
    .replace(/\b\w/g, character => character.toUpperCase())
    .replace("Centre Court", "Centre Court");
}

function teamName(team) {
  return team.players
    .map(player => `${player.first_name || ""} ${player.last_name || ""}`.trim())
    .filter(Boolean)
    .join(" / ");
}

const superscriptDigits = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"
};

function superscript(value) {
  return String(value).split("").map(digit => superscriptDigits[digit] || digit).join("");
}

function teamScore(team, opponent) {
  const scores = [];
  for (let set = 1; set <= 5; set += 1) {
    const games = team.score?.[`set${set}`];
    const opponentGames = opponent.score?.[`set${set}`];
    if (games === null || games === undefined || games === "") continue;
    const tiebreak = team.score?.[`tie${set}`];
    const lostTiebreak = Number(games) === 6 && Number(opponentGames) === 7 && Number(tiebreak) >= 0;
    scores.push(`${games}${lostTiebreak ? superscript(tiebreak) : ""}`);
  }
  return scores.join("  ");
}

function durationLabel(value = "") {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  if (!hours && !minutes) return "";
  return `${hours ? `${hours}h ` : ""}${String(minutes).padStart(hours ? 2 : 1, "0")}m`;
}

function timeLabel(match) {
  if (match.header) {
    return match.header.replace(
      /(\d{1,2}):(\d{2})\s*(AM|PM)/i,
      (_, rawHour, minutes, period) => {
        let hour = Number(rawHour) % 12;
        if (period.toUpperCase() === "PM") hour += 12;
        return `${String(hour).padStart(2, "0")}:${minutes}`;
      }
    );
  }
  return match.start_time || "Order of play";
}

function normaliseMatch(match, court, division) {
  const [teamA, teamB] = match.teams || [];
  if (!teamA || !teamB) return null;

  const completed = match.status === "F" || match.status_title?.toUpperCase() === "COMPLETED";
  const live = ["P", "LIVE"].includes(match.status) ||
    ["LIVE", "IN PROGRESS"].includes(match.status_title?.toUpperCase());
  if (live) return null;

  return {
    id: String(match.match_id),
    time: timeLabel(match),
    court: courtLabel(court),
    division,
    round: roundLabel(match.round_name || match.current_round),
    a: teamName(teamA),
    b: teamName(teamB),
    status: completed ? "Completed" : "Starting Soon",
    ...(completed ? {
      scoreA: teamScore(teamA, teamB),
      scoreB: teamScore(teamB, teamA),
      winner: String(match.winner_id) === String(teamA.team_no) ? "a" : "b",
      duration: durationLabel(match.duration)
    } : {})
  };
}

async function fetchDivision(division, date) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "language_code": "en"
    },
    body: JSON.stringify({
      slug: TOURNAMENT_SLUG,
      gender: division === "Men" ? "male" : "female",
      matchStatus: "All",
      date
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) throw new Error(`Official API returned ${response.status} for ${division}`);
  const payload = await response.json();
  if (!payload.status || !Array.isArray(payload.data?.courts)) {
    throw new Error(`Official API returned an invalid ${division} response`);
  }
  return payload;
}

function courtOrder(court) {
  if (court === "Centre Court") return 0;
  const number = Number(court.match(/\d+/)?.[0]);
  return Number.isFinite(number) ? number : 99;
}

async function existingSnapshot() {
  try {
    return JSON.parse(await readFile(OUTPUT_PATH, "utf8"));
  } catch {
    return null;
  }
}

async function fileExists(path) {
  try {
    await readFile(path, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const date = process.env.TOURNAMENT_DATE || tournamentDate();
  if (!process.env.TOURNAMENT_DATE && (date < EVENT_START || date > EVENT_END)) {
    console.log(`No sync needed outside the ${EVENT_START} to ${EVENT_END} tournament window.`);
    return;
  }
  const divisions = ["Men", "Women"];
  const payloads = await Promise.all(divisions.map(division => fetchDivision(division, date)));

  const fixtures = payloads.flatMap((payload, payloadIndex) =>
    payload.data.courts.flatMap(court =>
      court.matches
        .map(match => normaliseMatch(match, court.court_name, divisions[payloadIndex]))
        .filter(Boolean)
    )
  ).sort((left, right) => {
    const statusDifference = Number(left.status === "Completed") - Number(right.status === "Completed");
    return statusDifference || courtOrder(left.court) - courtOrder(right.court);
  });

  if (!fixtures.length) throw new Error(`Official API returned no fixtures for ${date}`);

  const day = payloads
    .flatMap(payload => payload.data.courts)
    .flatMap(court => court.matches)
    .find(match => match.day)?.day;

  const previous = await existingSnapshot();
  const comparable = { date, day: day ? Number(day) : null, fixtures };
  const previousComparable = previous ? {
    date: previous.date,
    day: previous.day,
    fixtures: previous.fixtures
  } : null;

  if (
    JSON.stringify(comparable) === JSON.stringify(previousComparable) &&
    await fileExists(MODULE_PATH)
  ) {
    console.log(`Official results are already current for ${date}.`);
    return;
  }

  const snapshot = {
    source: "https://premierpadel.com/en/tournaments-detail/pretoria-p1",
    generatedAt: new Date().toISOString(),
    ...comparable
  };
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
  await writeFile(MODULE_PATH, `// Generated by scripts/sync-official-results.mjs.\nexport default ${JSON.stringify(snapshot, null, 2)};\n`);
  console.log(`Updated ${fixtures.length} official fixtures for ${date}.`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
