import bundledSnapshot from "./behind-scenes-snapshot.js";

const REMOTE_SNAPSHOT =
  "https://raw.githubusercontent.com/padeuce/pretoria-p1/main/data/behind-scenes.json";

function snapshotUrls() {
  const sources = [REMOTE_SNAPSHOT];
  if (window.location.protocol !== "file:") {
    sources.push(new URL("data/behind-scenes.json", window.location.href).href);
  }
  return sources.map(source => {
    const url = new URL(source);
    url.searchParams.set("refresh", Date.now());
    return url.href;
  });
}

export async function loadBehindScenes() {
  let lastError;
  for (const url of snapshotUrls()) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`Behind-the-scenes snapshot returned ${response.status}`);
      const payload = await response.json();
      if (!payload || !Array.isArray(payload.posts) || payload.posts.length !== 10) {
        throw new Error("Behind-the-scenes snapshot is invalid");
      }
      return { ...payload, isBundledSnapshot: false };
    } catch (error) {
      lastError = error;
    }
  }

  if (!Array.isArray(bundledSnapshot.posts) || bundledSnapshot.posts.length !== 10) throw lastError;
  console.warn("Using the bundled behind-the-scenes snapshot:", lastError);
  return { ...bundledSnapshot, isBundledSnapshot: true };
}
