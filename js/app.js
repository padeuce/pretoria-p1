import { eventData, fixtures, seededPairs, behindScenes } from "./data.js";
import { initialiseNavigation } from "./navigation.js";
import { initialiseFixtureFilters } from "./filters.js";
import { initialiseSharing } from "./share.js";
import { loadOfficialResults } from "./official-results.js";
import { loadBehindScenes } from "./behind-scenes.js";

const OFFICIAL_RESULTS_REFRESH_INTERVAL = 5 * 60 * 1000;
const BEHIND_SCENES_REFRESH_INTERVAL = 15 * 60 * 1000;
let officialResultsRefreshActive = false;
let behindScenesRefreshActive = false;

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));
const countryNames = {
  ARG: "Argentina",
  BRA: "Brazil",
  ESP: "Spain",
  ITA: "Italy",
  POR: "Portugal",
  UAE: "United Arab Emirates"
};
const flagUrl = country => `https://cdn.premierpadel.com/fleg/${String(country).toLowerCase()}.png`;

function renderFixturePlayers(players, fallbackName) {
  if (!Array.isArray(players) || !players.length) {
    return `<span class="fixture-card__players">${escapeHTML(fallbackName)}</span>`;
  }
  return `<span class="fixture-card__players">
    ${players.map(player => {
      const country = String(player.country || "").toUpperCase();
      const flag = /^[A-Z]{2,3}$/.test(country)
        ? `<img src="${flagUrl(country)}" width="20" height="14" loading="lazy" alt="${escapeHTML(countryNames[country] || country)} flag">`
        : "";
      return `<span class="fixture-card__player">${flag}<span>${escapeHTML(player.name)}</span></span>`;
    }).join("")}
  </span>`;
}

function statusClass(status) {
  if (status === "Live") return "status-pill--live";
  if (status === "Completed") return "status-pill--completed";
  if (status === "Starting Soon") return "status-pill--soon";
  if (["Cancelled", "Postponed"].includes(status)) return "status-pill--cancelled";
  return "";
}

function renderFixtures(items) {
  const grid = document.querySelector("#fixture-grid");
  const empty = document.querySelector("#fixture-empty");
  if (!grid || !empty) return;
  grid.replaceChildren();
  empty.hidden = items.length > 0;
  items.forEach(fixture => {
    const article = document.createElement("article");
    article.className = "fixture-card";
    const team = (side, name, score) => `
      <span class="fixture-card__team${fixture.winner === side ? " is-winner" : ""}">
        <span>
          ${renderFixturePlayers(fixture[`${side}Players`], name)}
          ${fixture.winner === side ? '<span class="winner">Winner</span>' : ""}
        </span>
        ${score ? `<strong class="fixture-card__score">${escapeHTML(score)}</strong>` : ""}
      </span>`;
    article.innerHTML = `
      <div class="fixture-card__top">
        <div>${escapeHTML(fixture.court)}</div>
        <span class="status-pill ${statusClass(fixture.status)}">${escapeHTML(fixture.status)}</span>
      </div>
      <p class="eyebrow">${escapeHTML(fixture.division)} · ${escapeHTML(fixture.round)}</p>
      <h3 class="fixture-card__match">
        ${team("a", fixture.a, fixture.scoreA)}
        <small class="versus">${fixture.status === "Completed" ? "Final" : "versus"}</small>
        ${team("b", fixture.b, fixture.scoreB)}
      </h3>
      <div class="card-actions">
        ${fixture.duration ? `<span class="result-card__duration">${escapeHTML(fixture.duration)}</span>` : `<a class="text-link external-link" href="${eventData.officialUrl}" target="_blank" rel="noopener noreferrer">Official fixture ↗<span class="sr-only">(opens in a new tab)</span></a>`}
        <button class="button button--ghost button--small" type="button" data-share data-share-title="${escapeHTML(fixture.a)} vs ${escapeHTML(fixture.b)}">Share</button>
      </div>`;
    grid.append(article);
  });
}

function fixtureDateLabel(date, day) {
  const [year, month, dateOfMonth] = date.split("-").map(Number);
  const label = new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Johannesburg"
  }).format(new Date(Date.UTC(year, month - 1, dateOfMonth, 12)));
  return `${label}${day ? ` · Day ${day}` : ""}`;
}

async function refreshOfficialResults(filters) {
  if (officialResultsRefreshActive) return;
  officialResultsRefreshActive = true;
  const status = document.querySelector("#fixture-sync-status");
  const date = document.querySelector("#fixture-date");
  const eventDay = document.querySelector("[data-event-day]");
  try {
    const snapshot = await loadOfficialResults();
    filters.update(snapshot.fixtures);
    if (date) date.textContent = fixtureDateLabel(snapshot.date, snapshot.day);
    if (eventDay && snapshot.day) eventDay.textContent = `Day ${snapshot.day}`;
    if (status) {
      const syncedAt = new Intl.DateTimeFormat("en-ZA", {
        timeZone: "Africa/Johannesburg",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(new Date(snapshot.generatedAt));
      status.textContent = snapshot.isBundledSnapshot
        ? `Saved official schedule from ${syncedAt} SAST`
        : `Official schedule synced ${syncedAt} SAST`;
      status.dataset.state = snapshot.isBundledSnapshot ? "fallback" : "success";
    }
  } catch (error) {
    console.warn("Could not refresh official results:", error);
    if (status) {
      status.textContent = "Showing the last saved schedule";
      status.dataset.state = "fallback";
    }
  } finally {
    officialResultsRefreshActive = false;
  }
}

function initialiseOfficialResults(filters) {
  refreshOfficialResults(filters);
  window.setInterval(() => {
    if (!document.hidden) refreshOfficialResults(filters);
  }, OFFICIAL_RESULTS_REFRESH_INTERVAL);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshOfficialResults(filters);
  });
}

function renderSeededPlayers() {
  const grid = document.querySelector("#seed-lists");
  if (!grid) return;
  grid.replaceChildren();
  seededPairs.forEach(group => {
    const article = document.createElement("article");
    article.className = "seed-list";
    const divisionLabel = group.division === "Ladies" ? "Ladies’" : `${group.division}’s`;
    const rows = group.pairs.map(pair => `
      <li>
        <span class="seed-list__rank" aria-label="Seed ${pair.seed}">${String(pair.seed).padStart(2, "0")}</span>
        <span class="seed-list__players">
          ${pair.players.map(player => `
            <span class="seed-list__player">
              <img src="${flagUrl(player.country)}" width="20" height="14" loading="lazy" alt="${escapeHTML(countryNames[player.country] || player.country)} flag">
              <small title="${escapeHTML(countryNames[player.country] || player.country)}">${escapeHTML(player.country)}</small>
              <strong>${escapeHTML(player.name)}</strong>
            </span>`).join("")}
        </span>
        <span class="seed-list__points">${pair.points.toLocaleString("en-ZA")} <small>PTS</small></span>
      </li>`).join("");
    article.innerHTML = `
      <div class="seed-list__heading">
        <p class="eyebrow">${escapeHTML(divisionLabel)} draw</p>
        <h3>${escapeHTML(divisionLabel)} Seeds</h3>
      </div>
      <ol>${rows}</ol>`;
    grid.append(article);
  });
}

function renderStories(items = behindScenes) {
  const track = document.querySelector("#story-track");
  if (!track) return;
  track.replaceChildren();
  items.forEach(story => {
    const article = document.createElement("article");
    article.className = "story-card";
    article.innerHTML = `
      <a class="story-card__image" href="${escapeHTML(story.url)}" target="_blank" rel="noopener noreferrer" aria-label="View this post on Instagram">
        <img src="${escapeHTML(story.image)}" width="640" height="640" loading="lazy" decoding="async" alt="${escapeHTML(story.alt)}">
      </a>
      <div class="story-card__body">
        <div class="social-meta"><span>${escapeHTML(story.category)}</span><time>${escapeHTML(story.time)}</time></div>
        <h3>${escapeHTML(story.caption)}</h3>
        <a class="text-link external-link" href="${escapeHTML(story.url)}" target="_blank" rel="noopener noreferrer">View on Instagram ↗<span class="sr-only">(opens in a new tab)</span></a>
      </div>`;
    track.append(article);
  });
}

async function refreshBehindScenes() {
  if (behindScenesRefreshActive) return;
  behindScenesRefreshActive = true;
  try {
    const snapshot = await loadBehindScenes();
    renderStories(snapshot.posts);
  } catch (error) {
    console.warn("Could not refresh behind-the-scenes feed:", error);
  } finally {
    behindScenesRefreshActive = false;
  }
}

function initialiseBehindScenes() {
  const track = document.querySelector("#story-track");
  if (!track) return;
  renderStories();
  document.querySelector("[data-carousel-prev]")?.addEventListener("click", () => track.scrollBy({ left: -320, behavior: "smooth" }));
  document.querySelector("[data-carousel-next]")?.addEventListener("click", () => track.scrollBy({ left: 320, behavior: "smooth" }));
  refreshBehindScenes();
  window.setInterval(() => {
    if (!document.hidden) refreshBehindScenes();
  }, BEHIND_SCENES_REFRESH_INTERVAL);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshBehindScenes();
  });
}

function initialiseEnvironment() {
  const time = document.querySelector("[data-local-time]");
  const updateTime = () => {
    if (time) time.textContent = `${new Intl.DateTimeFormat("en-ZA", { timeZone: "Africa/Johannesburg", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())} SAST`;
  };
  updateTime(); window.setInterval(updateTime, 30000);
  const banner = document.querySelector(".offline-banner");
  const sync = () => { if (banner) banner.hidden = navigator.onLine; };
  window.addEventListener("online", sync); window.addEventListener("offline", sync); sync();
}

function initialise() {
  renderFixtures(fixtures);
  renderSeededPlayers();
  initialiseBehindScenes();
  const fixtureFilters = initialiseFixtureFilters(fixtures, renderFixtures);
  initialiseOfficialResults(fixtureFilters);
  initialiseNavigation();
  initialiseSharing();
  initialiseEnvironment();
}

initialise();
