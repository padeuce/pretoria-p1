import bundledSnapshot from "./official-results-snapshot.js";

const REMOTE_SNAPSHOT =
  "https://raw.githubusercontent.com/padeuce/pretoria-p1/main/data/official-results.json";

function snapshotUrl() {
  const source = window.location.protocol === "file:"
    ? REMOTE_SNAPSHOT
    : new URL("data/official-results.json", window.location.href).href;
  const url = new URL(source);
  url.searchParams.set("refresh", Date.now());
  return url.href;
}

export async function loadOfficialResults() {
  try {
    const response = await fetch(snapshotUrl(), {
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
    if (!Array.isArray(bundledSnapshot.fixtures) || !bundledSnapshot.fixtures.length) throw error;
    console.warn("Using the bundled official results snapshot:", error);
    return { ...bundledSnapshot, isBundledSnapshot: true };
  }
}
