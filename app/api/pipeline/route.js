// app/api/pipeline/route.js — Next.js App Router: builds prompt server-side → Anthropic
import { buildPrompt } from "../../../utils/prompts";

export const runtime = "nodejs";

// Server-side config — not exposed to clients
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
const MAX_TOKENS = parseInt(process.env.ANTHROPIC_MAX_TOKENS || "1500", 10);
const TEMPERATURE = parseFloat(process.env.ANTHROPIC_TEMPERATURE || "0.9");

export async function POST(request) {
  // --- Security: Validate API key is configured ---
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: "Server misconfiguration: API key not set" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();

    // --- Validate required fields ---
    const { agentId, niche, location, skillLevel, eventFocus, lore, outputs } = body;

    if (!agentId || agentId < 1 || agentId > 5) {
      return new Response(
        JSON.stringify({ error: { message: "Invalid agentId: must be 1-5" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!niche || typeof niche !== "string" || niche.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: { message: "niche is required" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- Input length guards (prevent abuse) ---
    if (niche.length > 500 || (location && location.length > 500) || (lore && lore.length > 2000)) {
      return new Response(
        JSON.stringify({ error: { message: "Input too long" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- Build prompt server-side ---
    const seed = Math.random().toString(36).substring(7);
    const prompt = buildPrompt(
      agentId,
      niche,
      location || "",
      skillLevel || "Mixed",
      eventFocus || "General Sketching",
      lore || "",
      outputs || []
    ) + `\n\n[SYSTEM SEED: ${seed} - Ensure you take uniquely different creative angles than standard generations.]`;

    const anthropicBody = {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [{ role: "user", content: prompt }],
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(anthropicBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: err.message || "Proxy error" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
