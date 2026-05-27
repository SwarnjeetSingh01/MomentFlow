/* ─── PROGRESSIVE INSIGHT SYSTEM ──────────────────────────────────── */

export const INSIGHT_TEMPLATES = {
  1: [
    { label: "Social-First Scan", value: "Instagram × TikTok native patterns", color: "" },
    { label: "Fatigue Filter", value: "Max 1 stranger/beginner/reveal idea", color: "" },
    { label: "Shareability Gate", value: "Humor · chaos · identity · comparison", color: "amber" },
  ],
  2: [
    { label: "Scoring", value: "Shareability × Simplicity × Authenticity", color: "" },
    { label: "Fatigue Check", value: "Penalizing repetitive emotional formats", color: "" },
    { label: "Internet Behavior", value: "Comment bait · tag energy · debate", color: "amber" },
  ],
  3: [
    { label: "Format", value: "Moment Flow — not screenplay beats", color: "" },
    { label: "Dialogue Style", value: "Messy · interrupted · casual · real", color: "" },
    { label: "Rawness Gate", value: "Imperfection = authenticity", color: "amber" },
  ],
  4: [
    { label: "Hook Rotation", value: "Shock · Humor · Identity · Chaos", color: "" },
    { label: "Style Check", value: "Instagram caption energy, not film trailer", color: "" },
    { label: "CTA Engine", value: "Comment bait · tag triggers · debates", color: "amber" },
  ],
  5: [
    { label: "Content Plan", value: "5 Reels · 3 Stories · 2 Carousels from 1 meetup", color: "" },
    { label: "Personality Capture", value: "The uncle · the engineer · the shy one", color: "" },
    { label: "Retention Edit", value: "Cuts every 2-3s · reactions > beauty", color: "amber" },
  ],
};

export function extractInsightsFromOutput(agentId, output) {
  if (!output) return [];
  const insights = [];
  
  const clean = (str) => str ? str.replace(/\*\*/g, '').replace(/"/g, '').trim() : '';

  if (agentId === 1) {
    const tableMatch = output.match(/\|[^|]+\|[^|]+\|([^|]+)\|/g);
    if (tableMatch && tableMatch.length > 2) {
      insights.push({ label: "Trending Format Detected", value: clean(tableMatch[1].replace(/\|/g, '')).slice(0, 40) || "POV Sketch Transitions", color: "" });
    }
    const gapMatch = output.match(/CONTENT GAP.*?\n(.+)/i);
    if (gapMatch) insights.push({ label: "Content Gap Alert", value: clean(gapMatch[1]).slice(0, 50), color: "amber" });
    const reachMatch = output.match(/NON-FOLLOWER.*?\n(.+)/i);
    if (reachMatch) insights.push({ label: "Non-Follower Reach", value: clean(reachMatch[1]).slice(0, 50), color: "green" });
  }
  if (agentId === 2) {
    const topicMatch = output.match(/Topic Name[:\s]*(.+)/i);
    if (topicMatch) insights.push({ label: "Recommended Topic", value: clean(topicMatch[1]).slice(0, 40), color: "amber" });
    const angleMatch = output.match(/Content Angle[:\s]*(.+)/i);
    if (angleMatch) insights.push({ label: "Content Angle", value: clean(angleMatch[1]).slice(0, 45), color: "" });
    const reachMatch = output.match(/Reach Potential[:\s]*(.+)/i);
    if (reachMatch) insights.push({ label: "Reach Potential", value: clean(reachMatch[1]).slice(0, 30), color: "green" });
  }
  if (agentId === 3) {
    const scripts = output.match(/### Script \d[:/]?\s*(.+)/gi);
    if (scripts) {
      scripts.forEach((s, i) => {
        insights.push({ label: `Script ${i + 1}`, value: clean(s.replace(/### Script \d[:/]?\s*/i, '')).slice(0, 40), color: i === 0 ? "amber" : "" });
      });
    }
  }
  if (agentId === 4) {
    const hooks = output.match(/"([^"]{10,60})"/g);
    if (hooks) {
      hooks.slice(0, 3).forEach((h, i) => {
        insights.push({ label: `Top Hook ${i + 1}`, value: clean(h).slice(0, 45), color: i === 0 ? "amber" : "" });
      });
    }
  }
  if (agentId === 5) {
    insights.push({ label: "Production Guide", value: "Shot list + recording tips ready", color: "green" });
  }
  
  return insights.length > 0 ? insights : [{ label: "Agent Complete", value: "Output ready to review", color: "green" }];
}
