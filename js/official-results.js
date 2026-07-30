import bundledSnapshot from "./official-results-snapshot.js";

const REMOTE_SNAPSHOT =
  "https://raw.githubusercontent.com/padeuce/pretoria-p1/main/data/official-results.json";

function snapshotUrls() {
  const sources = [REMOTE_SNAPSHOT];
  if (window.location.protocol !== "file:") {
    sources.push(new URL("data/official-results.json", window.location.href).href);
  }
  return sources.map(source => {
    const url = new URL(source);
    url.searchParams.set("refresh", Date.now());
    return url.href;
  });
}

export async function loadOfficialResults() {
  let lastError;
  for (const url of snapshotUrls()) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`Official results snapshot returned ${response.status}`);

      const payload = await response.json();
      if (!payload || !Array.isArray(payload.fixtures) || !payload.fixtures.length) {
        throw new Error("Official results snapshot is invalid");
      }
      return { ...payload, isBundledSnapshot: false };
    } catch (error) {
      lastError = error;
    }
  }

  if (!Array.isArray(bundledSnapshot.fixtures) || !bundledSnapshot.fixtures.length) throw lastError;
  console.warn("Using the bundled official results snapshot:", lastError);
  return { ...bundledSnapshot, isBundledSnapshot: true };
}
