import { access, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ACCOUNTS = [
  { username: "premierpadel", label: "Premier Padel" },
  { username: "ohpadel_club", label: "OH! Padel" }
];
const POSTS_PER_ACCOUNT = 5;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_PATH = resolve(ROOT, "data/behind-scenes.json");
const MODULE_PATH = resolve(ROOT, "js/behind-scenes-snapshot.js");
const IMAGE_DIRECTORY = resolve(ROOT, "assets/images");
const RETRY_DELAYS_MS = [0, 2000];
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0 Safari/537.36";

function wait(milliseconds) {
  return new Promise(resolveWait => setTimeout(resolveWait, milliseconds));
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

async function retry(label, operation) {
  let lastError;
  for (const [index, delay] of RETRY_DELAYS_MS.entries()) {
    if (delay) await wait(delay);
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(
        `${label} attempt ${index + 1}/${RETRY_DELAYS_MS.length} failed: ${errorMessage(error)}`
      );
    }
  }
  throw lastError;
}

function serverPayloads(html) {
  return [...html.matchAll(/s\.handle\((\{[\s\S]*?\})\);/g)]
    .map(match => {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function profileContext(value, username) {
  if (!value || typeof value !== "object") return null;
  if (typeof value.contextJSON === "string") {
    try {
      const payload = JSON.parse(value.contextJSON);
      if (payload.context?.username === username && Array.isArray(payload.context.graphql_media)) {
        return payload.context;
      }
    } catch {
      // Continue searching other payload branches.
    }
  }
  for (const child of Object.values(value)) {
    const match = profileContext(child, username);
    if (match) return match;
  }
  return null;
}

function shortcodeMedia(value, shortcode) {
  if (!value || typeof value !== "object") return null;
  if (value.shortcode_media?.shortcode === shortcode) return value.shortcode_media;
  if (typeof value.contextJSON === "string") {
    try {
      const match = shortcodeMedia(JSON.parse(value.contextJSON), shortcode);
      if (match) return match;
    } catch {
      // Continue searching other payload branches.
    }
  }
  for (const child of Object.values(value)) {
    const match = shortcodeMedia(child, shortcode);
    if (match) return match;
  }
  return null;
}

function postType(media) {
  if (media.__typename === "GraphSidecar") return "Carousel";
  if (media.is_video) return "Reel";
  return "Post";
}

function coverImage(media) {
  return media.display_url || media.edge_sidecar_to_children?.edges?.[0]?.node?.display_url || "";
}

function decodeHtml(value = "") {
  const named = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (_, entity) => {
    if (entity.toLowerCase().startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return named[entity.toLowerCase()] || _;
  });
}

function metaContent(html, property) {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(
    `<meta\\s+property="${escapedProperty}"\\s+content="([^"]*)"`,
    "i"
  ));
  return decodeHtml(match?.[1] || "");
}

function captionText(media) {
  const caption = media.edge_media_to_caption?.edges?.[0]?.node?.text
    ?.replace(/\s+/g, " ")
    .trim();
  if (!caption) return "A fresh update from the padel community.";
  const characters = [...caption];
  if (characters.length <= 180) return caption;
  return `${characters.slice(0, 177).join("").trimEnd()}…`;
}

function dateLabel(timestamp) {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "numeric",
    month: "short"
  }).format(new Date(Number(timestamp) * 1000));
}

function imagePath(username, index) {
  return `assets/images/instagram-${username.replaceAll("_", "-")}-${index + 1}.jpg`;
}

async function fetchInstagramHtml(url, userAgent = USER_AGENT) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": userAgent
    },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error(`Instagram returned ${response.status} for ${url}`);
  return response.text();
}

async function chromeExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next supported Chrome location.
    }
  }
  throw new Error("Chrome is required to discover posts for this Instagram account");
}

async function discoverShortcodes(account) {
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({
    executablePath: await chromeExecutable(),
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-sandbox"]
  });
  try {
    const page = await browser.newPage({ userAgent: USER_AGENT });
    await page.goto(`https://www.instagram.com/${account.username}/`, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });
    const selector =
      `a[href^="/${account.username}/p/"], a[href^="/${account.username}/reel/"]`;
    await page.waitForSelector(selector, { timeout: 20000 });
    const shortcodes = await page.locator(selector).evaluateAll((links, limit) => {
      const values = links
        .map(link => link.getAttribute("href")?.split("/").filter(Boolean).at(-1))
        .filter(Boolean);
      return [...new Set(values)].slice(0, limit);
    }, POSTS_PER_ACCOUNT);
    if (shortcodes.length < POSTS_PER_ACCOUNT) {
      throw new Error(`Instagram exposed only ${shortcodes.length} posts for @${account.username}`);
    }
    return shortcodes;
  } finally {
    await browser.close();
  }
}

async function fetchPost(account, shortcode) {
  for (const route of ["p", "reel"]) {
    try {
      const html = await fetchInstagramHtml(
        `https://www.instagram.com/${account.username}/${route}/${shortcode}/embed/`,
        "Mozilla/5.0"
      );
      const media = serverPayloads(html)
        .map(payload => shortcodeMedia(payload, shortcode))
        .find(Boolean);
      if (media) return media;

      const description = metaContent(html, "og:description");
      const displayUrl = metaContent(html, "og:image");
      const captionStart = description.indexOf(': "');
      const captionEnd = description.lastIndexOf('"');
      const published = description.match(/\son\s([A-Z][a-z]+ \d{1,2}, \d{4}):/i)?.[1];
      if (!displayUrl) continue;
      const caption = captionStart >= 0 && captionEnd > captionStart + 2
        ? description.slice(captionStart + 3, captionEnd)
        : "";
      return {
        __typename: route === "reel" ? "GraphVideo" : "GraphImage",
        shortcode,
        is_video: route === "reel",
        display_url: displayUrl,
        taken_at_timestamp: Math.floor(
          new Date(`${published || "January 1, 2026"} UTC`).getTime() / 1000
        ),
        edge_media_to_caption: {
          edges: caption ? [{ node: { text: caption } }] : []
        }
      };
    } catch {
      // Try the alternate Instagram permalink type.
    }
  }
  throw new Error(`Could not read Instagram post ${shortcode}`);
}

async function fetchAccount(account) {
  const html = await fetchInstagramHtml(`https://www.instagram.com/${account.username}/embed/`);

  const context = serverPayloads(html)
    .map(payload => profileContext(payload, account.username))
    .find(Boolean);
  const embeddedMedia = context?.graphql_media
    ?.map(item => item.shortcode_media)
    .map(media => media ? { ...media, display_url: coverImage(media) } : null)
    .filter(media => media?.shortcode && media.display_url)
    .slice(0, POSTS_PER_ACCOUNT);
  const mediaItems = embeddedMedia?.length === POSTS_PER_ACCOUNT
    ? embeddedMedia
    : await Promise.all((await discoverShortcodes(account)).map(shortcode => fetchPost(account, shortcode)));
  if (mediaItems.length < POSTS_PER_ACCOUNT) {
    throw new Error(`Instagram returned only ${mediaItems.length} posts for @${account.username}`);
  }

  return mediaItems.map((media, index) => ({
    category: `${account.label} · ${postType(media)}`,
    caption: captionText(media),
    time: dateLabel(media.taken_at_timestamp),
    url: `https://www.instagram.com/${account.username}/${media.is_video ? "reel" : "p"}/${media.shortcode}/`,
    image: imagePath(account.username, index),
    imageSource: media.display_url,
    alt: `Cover image from @${account.username}, published ${dateLabel(media.taken_at_timestamp)}.`
  }));
}

function interleave(groups) {
  return Array.from({ length: POSTS_PER_ACCOUNT }, (_, index) =>
    groups.map(group => group[index])
  ).flat();
}

async function existingSnapshot() {
  try {
    return JSON.parse(await readFile(OUTPUT_PATH, "utf8"));
  } catch {
    return null;
  }
}

function savedPostsForAccount(snapshot, username) {
  const accountPath = `instagram.com/${username}/`;
  return (snapshot?.posts || [])
    .filter(post => post.url?.includes(accountPath))
    .slice(0, POSTS_PER_ACCOUNT);
}

async function fileExists(path) {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

async function validSavedPosts(snapshot, account) {
  const posts = savedPostsForAccount(snapshot, account.username);
  if (posts.length !== POSTS_PER_ACCOUNT) return [];
  const imagesExist = await Promise.all(
    posts.map(post => fileExists(resolve(ROOT, post.image)))
  );
  return imagesExist.every(Boolean) ? posts : [];
}

async function fetchAccountWithFallback(account, previous) {
  try {
    return {
      fresh: true,
      posts: await retry(`@${account.username}`, () => fetchAccount(account))
    };
  } catch (error) {
    const savedPosts = await validSavedPosts(previous, account);
    if (savedPosts.length !== POSTS_PER_ACCOUNT) throw error;
    console.warn(
      `::warning title=Instagram temporarily unavailable::` +
      `Could not refresh @${account.username} (${errorMessage(error)}). ` +
      "The last valid posts and images remain published."
    );
    return { fresh: false, posts: savedPosts };
  }
}

async function downloadImages(posts) {
  const temporaryFiles = [];
  try {
    const downloadablePosts = posts.filter(post => post.imageSource);
    await Promise.all(downloadablePosts.map(async (post, index) => {
      await retry(`Image for ${post.url}`, async () => {
        const response = await fetch(post.imageSource, {
          headers: { "User-Agent": USER_AGENT },
          signal: AbortSignal.timeout(20000)
        });
        if (!response.ok) throw new Error(`Instagram image returned ${response.status}`);
        if (!response.headers.get("content-type")?.startsWith("image/")) {
          throw new Error("Instagram returned a non-image asset");
        }
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (bytes.length < 1000) throw new Error("Instagram returned an incomplete image");
        const destination = resolve(ROOT, post.image);
        const temporary = `${destination}.tmp-${Date.now()}-${index}`;
        temporaryFiles.push({ temporary, destination });
        await writeFile(temporary, bytes);
      });
    }));
    await Promise.all(temporaryFiles.map(file => rename(file.temporary, file.destination)));
  } catch (error) {
    await Promise.all(temporaryFiles.map(file => unlink(file.temporary).catch(() => {})));
    throw error;
  }
}

async function main() {
  const previous = await existingSnapshot();
  const results = await Promise.all(
    ACCOUNTS.map(account => fetchAccountWithFallback(account, previous))
  );
  const postsWithSources = interleave(results.map(result => result.posts));
  const posts = postsWithSources.map(({ imageSource, ...post }) => post);
  const imagesExist = await Promise.all(posts.map(post => fileExists(resolve(ROOT, post.image))));

  if (
    JSON.stringify(previous?.posts) === JSON.stringify(posts) &&
    imagesExist.every(Boolean) &&
    await fileExists(MODULE_PATH)
  ) {
    console.log(
      results.every(result => result.fresh)
        ? "Instagram feeds are already current."
        : "Instagram was temporarily unavailable; the last valid feeds remain published."
    );
    return;
  }

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await mkdir(IMAGE_DIRECTORY, { recursive: true });
  await downloadImages(postsWithSources);

  const snapshot = {
    sourceAccounts: ACCOUNTS.map(account => `https://www.instagram.com/${account.username}/`),
    generatedAt: new Date().toISOString(),
    posts
  };
  await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
  await writeFile(
    MODULE_PATH,
    `// Generated by scripts/sync-instagram-feeds.mjs.\nexport default ${JSON.stringify(snapshot, null, 2)};\n`
  );
  console.log(`Updated ${posts.length} alternating Instagram posts.`);
}

main().catch(async error => {
  const previous = await existingSnapshot();
  const savedGroups = await Promise.all(
    ACCOUNTS.map(account => validSavedPosts(previous, account))
  );
  if (
    savedGroups.every(posts => posts.length === POSTS_PER_ACCOUNT) &&
    await fileExists(MODULE_PATH)
  ) {
    console.warn(
      `::warning title=Instagram sync deferred::${errorMessage(error)} ` +
      "The last valid feed snapshot remains published and the next scheduled run will retry."
    );
    return;
  }
  console.error(errorMessage(error));
  process.exitCode = 1;
});
