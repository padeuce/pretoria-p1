import { eventData, fixtures, seededPairs, behindScenes } from "./data.js";
import { initialiseNavigation } from "./navigation.js";
import { initialiseFixtureFilters } from "./filters.js";
import { initialiseSharing } from "./share.js";

const imagePath = "assets/images/pretoria-match-night.png";
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));
const countryNames = { ARG: "Argentina", BRA: "Brazil", ESP: "Spain", POR: "Portugal" };

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
        <span>${escapeHTML(name)}${fixture.winner === side ? ' <span class="winner">Winner</span>' : ""}</span>
        ${score ? `<strong class="fixture-card__score">${escapeHTML(score)}</strong>` : ""}
      </span>`;
    article.innerHTML = `
      <div class="fixture-card__top">
        <div><span class="fixture-card__time">${escapeHTML(fixture.time)}</span><br>${escapeHTML(fixture.court)}</div>
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
              <img src="https://cdn.premierpadel.com/fleg/${escapeHTML(player.country.toLowerCase())}.png" width="20" height="14" loading="lazy" alt="${escapeHTML(countryNames[player.country] || player.country)} flag">
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

function mediaImage(alt, position = "center") {
  return `<img src="${imagePath}" width="1732" height="907" loading="lazy" decoding="async" alt="${escapeHTML(alt)}" style="object-position:${position}">`;
}

function renderStories() {
  const track = document.querySelector("#story-track");
  if (!track) return;
  behindScenes.forEach((story, index) => {
    const article = document.createElement("article");
    article.className = "story-card";
    article.innerHTML = `
      <div class="story-card__image">${mediaImage(`${story.category} at Pretoria P1`, `${55 + index * 5}% center`)}</div>
      <div class="story-card__body">
        <div class="social-meta"><span>${escapeHTML(story.category)}</span><time>${escapeHTML(story.time)}</time></div>
        <h3>${escapeHTML(story.caption)}</h3>
        <a class="text-link" href="${story.url}" target="_blank" rel="noopener noreferrer">Open story ↗</a>
      </div>`;
    track.append(article);
  });
  document.querySelector("[data-carousel-prev]")?.addEventListener("click", () => track.scrollBy({ left: -320, behavior: "smooth" }));
  document.querySelector("[data-carousel-next]")?.addEventListener("click", () => track.scrollBy({ left: 320, behavior: "smooth" }));
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
  renderStories();
  initialiseFixtureFilters(fixtures, renderFixtures);
  initialiseNavigation();
  initialiseSharing();
  initialiseEnvironment();
}

initialise();
