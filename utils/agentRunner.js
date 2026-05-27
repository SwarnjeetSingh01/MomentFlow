export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Run a single agent in the pipeline.
 * Sends agent parameters to the server-side route which builds the prompt.
 * Supports AbortController for cancellation.
 */
export async function runAgent({ agentId, niche, location, skillLevel, eventFocus, lore, outputs, onRetry, signal }) {
  const body = {
    agentId,
    niche,
    location,
    skillLevel,
    eventFocus,
    lore,
    outputs, // previous agent outputs for chaining
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (attempt > 0) { onRetry(attempt); await sleep(1200 * attempt); }
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n\n");
      if (!text) throw new Error("No content in response");
      return text;
    } catch (err) {
      if (err.name === "AbortError") throw err;
      if (attempt === 2) throw err;
    }
  }
}
