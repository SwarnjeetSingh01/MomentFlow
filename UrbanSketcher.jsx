"use client";

import { useState, useCallback, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Caveat:wght@400;600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600&display=swap');`;

const CSS = `
${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --parchment:#f5f0e8;--green:#3a5f4a;--blue:#3a6a9a;
  --brown:#c8b89a;--brown-dark:#8a7060;--blue-light:#8aaccf;
  --green-light:#8aaa7a;--spiral:#b0a080;
}
body{
  font-family:'Inter',sans-serif;
  background-color:var(--parchment);
  background-image:
    repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(180,160,120,.18) 28px),
    repeating-linear-gradient(90deg,transparent,transparent 27px,rgba(180,160,120,.07) 28px);
  min-height:100vh;overflow-x:hidden;
  padding-left:48px;
}
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 420px 320px at 15% 25%,rgba(58,95,74,.07) 0%,transparent 70%),
    radial-gradient(ellipse 380px 280px at 85% 70%,rgba(58,106,154,.06) 0%,transparent 70%),
    radial-gradient(ellipse 300px 250px at 50% 50%,rgba(200,184,154,.08) 0%,transparent 70%);
}

/* SPIRAL */
.spiral{
  position:fixed;left:0;top:0;bottom:0;width:44px;z-index:50;
  display:flex;flex-direction:column;align-items:center;justify-content:space-around;
  padding:32px 0;background:linear-gradient(to right,rgba(176,160,128,.15),transparent);
}
.spiral-ring{
  width:18px;height:18px;border-radius:50%;
  border:2.5px solid var(--spiral);
  background:radial-gradient(circle at 40% 35%,rgba(255,255,255,.6),rgba(200,180,140,.2));
  box-shadow:0 1px 3px rgba(0,0,0,.12);
}
@media(max-width:640px){.spiral{display:none}}

/* HEADER */
.header{
  position:sticky;top:0;z-index:40;
  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  background:rgba(245,240,232,.82);
  border-bottom:1.5px solid rgba(200,184,154,.6);
  padding:12px 24px;
  display:flex;align-items:center;gap:14px;
}
.logo-svg{width:36px;height:36px;flex-shrink:0}
.header-title{font-family:'Special Elite',cursive;font-size:1.5rem;color:var(--green)}
.header-sub{font-family:'Caveat',cursive;font-size:1rem;color:var(--brown-dark);margin-left:6px}

/* HERO */
.hero{
  text-align:center;padding:44px 24px 28px;position:relative;z-index:1;
}
.hero h1{
  font-family:'Libre Baskerville',serif;font-size:clamp(1.6rem,4vw,2.6rem);
  color:var(--green);line-height:1.25;margin-bottom:10px;
}
.hero-highlight{
  font-family:'Caveat',cursive;font-size:clamp(1.2rem,3vw,1.8rem);
  color:var(--blue);font-style:italic;display:block;
}
.hero-sub{
  font-family:'Libre Baskerville',serif;font-style:italic;
  color:var(--brown-dark);margin-top:8px;font-size:.95rem;
}
.progress-bar-wrap{
  max-width:500px;margin:18px auto 0;height:8px;
  background:rgba(200,184,154,.35);border-radius:4px;overflow:hidden;
}
.progress-bar-fill{
  height:100%;background:linear-gradient(90deg,var(--green),var(--blue));
  border-radius:4px;transition:width .5s ease;
}
.progress-label{
  font-family:'Caveat',cursive;color:var(--brown-dark);font-size:.95rem;margin-top:6px;
}

/* INPUT CARD */
.input-card{
  position:relative;max-width:780px;margin:0 auto 36px;
  background:rgba(255,252,245,.85);border:1.5px solid var(--brown);
  border-radius:4px;padding:28px 28px 24px;
  box-shadow:2px 3px 12px rgba(0,0,0,.08);
}
.tape{
  position:absolute;top:-14px;left:50%;transform:translateX(-50%);
  width:120px;height:28px;
  background:rgba(200,184,154,.55);border-radius:2px;
  box-shadow:0 2px 6px rgba(0,0,0,.1);
}
.fields-row{
  display:flex;gap:16px;margin-top:8px;
  flex-wrap:wrap;
}
.field-wrap{flex:1;min-width:200px;display:flex;flex-direction:column;gap:6px}
.field-label{font-family:'Caveat',cursive;color:var(--brown-dark);font-size:1rem}
.field-input{
  font-family:'Inter',sans-serif;font-size:.95rem;
  background:rgba(245,240,232,.8);border:1.5px solid var(--brown);
  border-radius:3px;padding:10px 12px;color:#2a2015;
  transition:border-color .2s,box-shadow .2s;resize:none;
}
.field-input:focus{
  outline:none;border-color:var(--green);
  box-shadow:0 0 0 3px rgba(58,95,74,.12);
}
.loc-pill{
  margin-top:10px;display:inline-block;
  background:rgba(58,95,74,.12);border:1px solid rgba(58,95,74,.3);
  color:var(--green);font-family:'Caveat',cursive;font-size:.95rem;
  padding:5px 14px;border-radius:20px;
}
.run-btn{
  display:block;width:100%;margin-top:18px;padding:13px;
  font-family:'Special Elite',cursive;font-size:1.05rem;letter-spacing:.03em;
  background:var(--green);color:#f5f0e8;
  border:none;border-radius:3px;cursor:pointer;
  transition:background .2s,transform .1s;
  position:relative;overflow:hidden;
}
.run-btn:hover:not(:disabled){background:#2e4d3a;transform:translateY(-1px)}
.run-btn:disabled{opacity:.65;cursor:not-allowed}
.run-btn.running::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
  animation:shimmer 1.4s infinite;
}

/* AGENTS SECTION */
.agents-section{
  max-width:780px;margin:0 auto;
  padding-left:24px;padding-right:24px;
  display:flex;flex-direction:column;gap:12px;
}
.connector{
  width:2px;height:24px;background:var(--brown);
  margin:0 auto;border-style:dashed;
  transition:background .4s;
}
.connector.done{background:var(--green-light)}

/* AGENT CARD */
.agent-card{
  background:rgba(255,252,245,.88);border:1.5px solid var(--brown);
  border-radius:4px;padding:20px 22px;
  box-shadow:1px 2px 8px rgba(0,0,0,.06);
  transition:border-color .35s,box-shadow .35s;
}
.agent-card.running{
  border-color:var(--blue-light);
  box-shadow:0 0 0 3px rgba(138,172,207,.2),1px 2px 12px rgba(0,0,0,.1);
  animation:pulse-glow 2s ease-in-out infinite;
}
.agent-card.done{border-color:var(--green-light);box-shadow:1px 2px 10px rgba(0,0,0,.08)}
.agent-card.error{border-color:#d98080}
.card-top{display:flex;align-items:center;gap:12px;justify-content:space-between}
.card-left{display:flex;align-items:center;gap:12px}
.stamp{
  width:44px;height:44px;border-radius:50%;
  border:2px solid var(--brown);display:flex;align-items:center;
  justify-content:center;font-family:'Caveat',cursive;font-size:1.1rem;
  color:var(--brown-dark);flex-shrink:0;transition:all .35s;
}
.agent-card.done .stamp{
  border:2.5px solid var(--green);outline:1.5px dashed var(--green);
  outline-offset:3px;color:var(--green);font-size:1.3rem;
}
.card-name{font-family:'Libre Baskerville',serif;font-size:1rem;color:#2a2015;font-weight:700}
.card-desc{font-family:'Inter',sans-serif;font-size:.85rem;color:var(--brown-dark);margin-top:3px}
.card-right{display:flex;align-items:center;gap:8px}
.badge{
  font-family:'Inter',sans-serif;font-size:.78rem;font-weight:500;
  padding:3px 10px;border-radius:20px;border:1px solid currentColor;
}
.badge-idle{color:var(--brown-dark);border-color:var(--brown)}
.badge-running{color:var(--blue);border-color:var(--blue-light);animation:pen-bob .8s ease-in-out infinite}
.badge-done{color:var(--green);border-color:var(--green-light)}
.badge-error{color:#b84040;border-color:#d98080}
.badge-retry{color:#8a6020;border-color:#c8a060}
.expand-btn{
  font-family:'Inter',sans-serif;font-size:.8rem;font-weight:500;
  background:none;border:1px solid var(--brown);border-radius:20px;
  padding:4px 12px;color:var(--brown-dark);cursor:pointer;
  transition:background .2s;
}
.expand-btn:hover{background:rgba(200,184,154,.2)}
.progress-strip{
  height:3px;background:rgba(200,184,154,.35);border-radius:2px;
  margin-top:10px;overflow:hidden;
}
.strip-fill{
  height:100%;border-radius:2px;
  background:linear-gradient(90deg,var(--blue),var(--blue-light));
  animation:shimmer-bar 1.4s infinite;
}
.agent-card.done .strip-fill{
  background:var(--green-light);animation:none;width:100%!important;
}
.output-wrap{margin-top:14px;animation:fade-slide .3s ease}
.output-pre{
  font-family:'Inter',sans-serif;font-size:.84rem;
  background:rgba(245,240,232,.7);border:1px solid rgba(200,184,154,.5);
  border-radius:3px;padding:16px;white-space:pre-wrap;word-break:break-word;
  color:#2a2015;line-height:1.75;max-height:420px;overflow-y:auto;
}
.error-msg{
  font-family:'Caveat',cursive;font-size:.95rem;color:#b84040;
  margin-top:10px;padding:8px 12px;background:rgba(180,60,60,.07);
  border-radius:3px;border-left:3px solid #d98080;
}

/* DONE BAR */
.done-bar{
  max-width:780px;margin:24px auto;
  padding-left:24px;padding-right:24px;
  animation:paper-load .4s ease;
}
.done-bar-inner{
  background:rgba(138,170,122,.12);border:1.5px solid var(--green-light);
  border-radius:4px;padding:18px 22px;display:flex;
  align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;
}
.done-bar-title{font-family:'Libre Baskerville',serif;color:var(--green);font-size:1rem;font-weight:700}
.done-bar-btns{display:flex;gap:10px;flex-wrap:wrap}
.btn-copy,.btn-again{
  font-family:'Inter',sans-serif;font-size:.9rem;font-weight:500;
  padding:9px 18px;border-radius:3px;cursor:pointer;border:1.5px solid;
  transition:all .2s;
}
.btn-copy{background:var(--green);color:#f5f0e8;border-color:var(--green)}
.btn-copy:hover{background:#2e4d3a}
.btn-again{background:transparent;color:var(--green);border-color:var(--green)}
.btn-again:hover{background:rgba(58,95,74,.08)}

/* FOOTER */
.footer{
  text-align:center;padding:28px 24px;
  font-family:'Caveat',cursive;font-size:1.05rem;color:var(--brown-dark);
  border-top:1px dashed rgba(200,184,154,.5);margin-top:40px;
}

/* ANIMATIONS */
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
@keyframes shimmer-bar{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
@keyframes pulse-glow{0%,100%{box-shadow:0 0 0 3px rgba(138,172,207,.15)}50%{box-shadow:0 0 0 6px rgba(138,172,207,.28)}}
@keyframes pen-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes fade-slide{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes paper-load{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes stamp-in{0%{transform:scale(1.4);opacity:0}60%{transform:scale(.92)}100%{transform:scale(1);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}

@media(max-width:640px){
  body{padding-left:0}
  .spiral{display:none}
  .header{padding:10px 12px}
  .input-card{margin:0 12px 36px;padding:20px 16px}
  .agents-section{padding-left:12px;padding-right:12px}
  .done-bar{padding-left:12px;padding-right:12px}
  .done-bar-inner{flex-direction:column;align-items:stretch}
  .done-bar-btns{flex-direction:column}
  .hero{padding-left:12px;padding-right:12px}
  .footer{padding-left:12px;padding-right:12px}
}
`;


/* ─── PROMPTS ─────────────────────────────────────────────────────── */

// Creator profile context injected into every agent (kept short to stay under rate limits)
const CREATOR_CONTEXT = `
ACCOUNT: @usknagpur — Urban Sketchers Nagpur | 3,825 followers | ~3,500 avg reel views
GAP: Only event documentation posted — zero tutorials/tips/process reels.
GOAL: Break follower bubble, grow non-follower reach. City: Nagpur, India.
`;

const buildPrompt = (agentId, niche, location, prevOutput) => {
  const loc = location ? location.trim() : "";
  const locNote = loc
    ? `The sketching location is: "${loc}". All agents must weave this location into their output as instructed below.`
    : "";

  // ── AGENT 01 ────────────────────────────────────────────────────────
  if (agentId === 1) {
    const locSearch = loc
      ? `Run an additional search specifically for "${niche}" + "${loc}" to find local or regional content patterns.`
      : "";

    return `You are Agent 01 — Content Scout. Your job is to find real, trending content that @usknagpur can learn from and adapt.

${CREATOR_CONTEXT}
${locNote}

TASK: Use web search to find the TOP 10 highest-performing posts about "${niche}" on YouTube and Instagram from the last 7 days.
${locSearch}

CRITICAL DATA RULES:
- Report ONLY data found through your web search. Do not estimate or fabricate metrics.
- If a specific metric (e.g. exact view count) is unavailable, write "N/A" — never guess.
- If fewer than 10 results exist, report what you found and note the gap.

OUTPUT FORMAT — produce a Markdown table with these exact columns:
| # | Platform | Title / Caption | Est. Views | Engagement Rate | Hook Style | Format | Why It's Trending |

DEFINITIONS (use these exactly — do not invent new values):
- Platform: YouTube or Instagram
- Engagement Rate: (Likes + Comments + Saves) / Reach × 100. If unavailable, classify as: High (>5%), Medium (2–5%), Low (<2%)
- Hook Style: must be ONE of: QUESTION | PAIN POINT | CURIOSITY GAP | BOLD CLAIM | BEFORE/AFTER | ASPIRATIONAL | NUMBER/LIST
- Format: must be ONE of: Reel | YouTube Short | YouTube Long-form | Carousel | Tutorial | Time-lapse | POV | Vlog | Event Coverage

List all YouTube results first, then Instagram, ordered by engagement rate descending within each platform.

After the table, add these 3 sections:

CONTENT GAP ALERT:
Identify ONE angle or sub-topic in "${niche}" that appears in audience comments or search queries but has NO high-performing content in your results. This is the opportunity @usknagpur should move on first.

NON-FOLLOWER REACH ANALYSIS:
Based on what you found, name the #1 content format that is currently pulling in non-follower views for this niche, and explain why the algorithm is distributing it beyond existing audiences.

VIRAL PICKS (top 3 to adapt for @usknagpur):
1. [title] — [why this specific concept works for a Nagpur-based community account]
2. [title] — [why this specific concept works for a Nagpur-based community account]
3. [title] — [why this specific concept works for a Nagpur-based community account]`;
  }

  // ── AGENT 02 ────────────────────────────────────────────────────────
  if (agentId === 2) {
    const locSection = loc
      ? `\n\nLOCATION OPPORTUNITY — "${loc}":\nIn 4–5 sentences, describe exactly how @usknagpur could execute the RECOMMENDED TOPIC at "${loc}". Reference its specific visual qualities (light direction, architectural details, textures, crowds), the best time of day to shoot, and one logistical tip. Make it actionable, not generic.`
      : "";

    return `You are Agent 02 — Validation Engine. You analyze content data and produce a prioritized strategy brief for @usknagpur.

${CREATOR_CONTEXT}
${locNote}

RESEARCH DATA FROM AGENT 01:
${prevOutput}

─────────────────────────────────────────────
SECTION 1 — SCORING
Score each post in the research data using this formula:
  Score = (Reach Score × 30%) + (Engagement Rate Score × 40%) + (Save/Intent Signal × 30%)

  Scoring scales:
  - Reach Score: rank posts by view count, assign 10 (highest) down to 1 (lowest) within the dataset
  - Engagement Rate Score: High = 9–10, Medium = 5–8, Low = 1–4
  - Save/Intent Signal: 10 if tutorials/tips/how-to (high save intent), 6 if event/community, 3 if general vlog

If any Agent 01 data appears fabricated or inconsistent with real platform norms, flag it and apply a 50% weight penalty to that row.

SECTION 2 — TOPIC CLUSTERS
Group posts into 4–6 clusters. Name each cluster using this format:
  [TECHNIQUE or TOPIC] + [AUDIENCE EMOTION or OUTCOME]
  Examples: "Ink Wash + Meditative Flow", "Architecture + Local Pride", "Quick Sketch + Beginner Win"

Produce a ranking table:
| Rank | Topic Cluster | Avg Score | Post Count | Top Format | Non-Follower Reach Potential |

Non-Follower Reach Potential: rate High / Medium / Low based on searchability and shareability of the cluster topic.

SECTION 3 — TOP 3 FORMATS
Name the top 3 formats working right now in this niche with:
- Format name
- Why the algorithm is distributing it
- Specific execution note for @usknagpur (a community account with group events and 3,800 followers)

SECTION 4 — RECOMMENDED TOPIC
RECOMMENDED TOPIC: [cluster name]
Content Angle: [the specific creative angle — not just the topic, but HOW to approach it]
Optimal Format & Length: [e.g. "60-sec Reel with time-lapse B-roll"]
Why Now: [1 sentence on timing — why this week, this trend]
Estimated Reach: [range, split between follower and non-follower]
Hashtag Strategy: [3 categories of hashtags to use — e.g. "niche community tags + city tags + trending art tags"]
Content Gap Opportunity: [from Agent 01's gap alert — can @usknagpur own this angle?]${locSection}`;
  }

  // ── AGENT 03 ────────────────────────────────────────────────────────
  if (agentId === 3) {
    const locGround = loc
      ? `LOCATION GROUNDING: The script must be set at "${loc}". Reference at least 2 specific sensory details (e.g. the sound of water, the colour of the stone, the quality of morning light, the smell of the air, the texture of the pavement). Make it feel like the viewer is there.`
      : "";

    return `You are Agent 03 — Script Writer for @usknagpur (Urban Sketchers Nagpur).

${CREATOR_CONTEXT}
${locNote}

VALIDATION DATA FROM AGENT 02:
${prevOutput}

TASK: Write a 60-second reel script for the RECOMMENDED TOPIC from the validation data above.

VOICE DIRECTION:
Write as if you're showing your sketchbook to a close friend over chai. Conversational but thoughtful.
Tone reference: Austin Kleon meets a Studio Ghibli narrator — curious, warm, unhurried, never salesy.
Use "you" and "we" freely. No "Hey guys!" openers. No listicle energy. No hard sells.
First person throughout. Every line should feel like it could be spoken, not read.

${locGround}

─────────────────────────────────────────────
SCRIPT STRUCTURE — use exactly these 4 labeled beats:

[BEAT 1: THE VALUE OPEN] — 10 seconds
Open with a relatable observation or a quiet promise. No hook (Agent 04 handles that).
[VISUAL]: Describe what the camera shows — be specific and filmable.
[EMPHASIS]: Mark one word or phrase the speaker should stress.

[BEAT 2: THE TECHNIQUE] — 20 seconds
Share the core insight, tip, or process. Be specific and visual — name tools, name colours, describe the hand movement.
[VISUAL]: Describe B-roll or what's happening on screen (close-up of paper, ink bleeding, pen nib, etc.).
[PAUSE]: Mark one natural pause beat for the speaker.

[BEAT 3: THE TRANSFORMATION] — 20 seconds
Reveal the result, the before/after, or the emotional shift. Make the viewer feel the payoff.
[VISUAL]: Describe the reveal shot or comparison.
[SLOW DOWN]: Mark the moment where delivery should drop in pace for impact.

[CTA] — 10 seconds
Write TWO CTA options — pick the stronger one and mark it RECOMMENDED:
  Option A (Save-optimised): Ask them to save the reel for later reference.
  Option B (Comment-optimised): Ask one specific question with a one-word or emoji answer (drives comment velocity for the algorithm).
[VISUAL]: End frame description.

─────────────────────────────────────────────
PRODUCTION NOTES (add at end):
- Suggested background music mood: [1 descriptor]
- Best time to post for Nagpur audience: [day + time window]
- One prop or tool to make the sketch process more visually interesting on camera`;
  }

  // ── AGENT 04 ────────────────────────────────────────────────────────
  if (agentId === 4) {
    const locHooks = loc
      ? `LOCATION RULE: At least 2 of your 5 hooks MUST reference "${loc}" by name OR use a specific sensory detail tied to that place. Generic location references ("a beautiful lakeside") are not acceptable — be specific.`
      : "";

    return `You are Agent 04 — Hook Generator for @usknagpur (Urban Sketchers Nagpur).

${CREATOR_CONTEXT}
${locNote}

SCRIPT FROM AGENT 03:
${prevOutput}

${locHooks}

TASK: Generate exactly 5 scroll-stopping hooks for this reel. These hooks replace the opening 3 seconds.
Hooks must stop a cold audience — someone who has never heard of @usknagpur — from scrolling past.

CRITICAL RULE: The FIRST 3 WORDS of every hook are the most important. They must create immediate tension, curiosity, or recognition.
Do NOT start any hook with: "I", "Are you", "Do you", "Have you", "Hey", "This is".

HOOK TYPE DEFINITIONS (follow these exactly):
1. ASPIRATIONAL — Paints a picture of who the viewer becomes. Pattern: identity shift.
   Example structure: "[Surprising identity claim] + [the skill or place that creates it]"
2. PAIN POINT — Names a specific frustration the @usknagpur audience already feels.
   Pattern: name the failure before offering the fix. Be precise — not generic art frustration.
3. EXCLUSIVITY — Makes the viewer feel they're getting insider or local knowledge.
   Pattern: "What most people / outsiders / tourists don't know about [thing]"
4. SPECIFIC RESULT — Leads with a concrete, measurable outcome. No vague promises.
   Pattern: "[Number] + [specific skill/result] + [tight time frame]"
5. CURIOSITY GAP — Creates an information tension the brain must resolve.
   Pattern: "[I did X unexpected thing] and [surprising consequence]"

OUTPUT FORMAT for each hook:

Hook Type: [TYPE]
First 3 Words: [word1] [word2] [word3]
Hook: [full hook text — MAX 15 WORDS — must land in under 3 seconds when spoken]
Pattern: [the specific copywriting pattern used]
Why It Works: [1 sentence referencing a specific psychological mechanism: curiosity gap, identity signalling, loss aversion, social proof, FOMO, pattern interrupt]
Confidence Score: [X/10]

CONFIDENCE RUBRIC:
9–10: Proven hook pattern + directly matches top-scoring content cluster + specific to urban sketching niche
7–8: Strong pattern, works for the niche but could apply to adjacent niches too
5–6: Solid structure but needs the creator's unique delivery to land
Below 5: Do not include — rewrite until it scores 5+

─────────────────────────────────────────────
RECOMMENDED HOOK: [type] — [hook text]
Reason: [why this one wins — reference the validation data and the creator's specific situation]

PLATFORM OPTIMISATION:
Instagram Reels: [which hook performs best here and why — consider the scroll speed and audience intent on Instagram]
YouTube Shorts: [which hook performs best here and why — consider that YouTube Shorts viewers have slightly longer attention spans]

A/B TEST SUGGESTION: [recommend 2 hooks to split-test against each other and what metric to watch — saves, comments, or shares]`;
  }

  return "";
};

/* ─── AGENT RUNNER ────────────────────────────────────────────────── */
const AGENT_META = [
  { id: 1, name: "Content Scout",     desc: "Searching YouTube & Instagram trends" },
  { id: 2, name: "Validation Engine", desc: "Scoring & clustering content data"    },
  { id: 3, name: "Script Writer",     desc: "Drafting your 60-second reel script"  },
  { id: 4, name: "Hook Generator",    desc: "Generating 5 scroll-stopping hooks"   },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Trim previous-agent output to avoid inflating input tokens.
// Agent 03 only needs Agent 02's recommendation section (bottom of output).
const trimContext = (text, maxChars) =>
  text.length <= maxChars ? text : "[...trimmed for token efficiency...]\n" + text.slice(-maxChars);

async function runAgent({ agentId, niche, location, prevOutput, onRetry }) {
  // Smart context: pass full output to Agent 02 (needs all data),
  // trim to last 1800 chars for Agent 03 (recommendation section is at the bottom),
  // Agent 04 gets full script (it's short anyway).
  const ctx = agentId === 3 ? trimContext(prevOutput, 1800) : prevOutput;
  const prompt = buildPrompt(agentId, niche, location, ctx);

  // All agents use claude-sonnet-4-20250514 (Haiku not available on this plan)
  // Credit savings come from tiered max_tokens + trimmed context + inter-agent delays
  const useSearch = agentId === 1;
  const model = "claude-sonnet-4-20250514";
  const maxTokens = agentId === 1 ? 1800 : 1200;

  const body = {
    model,
    max_tokens: maxTokens,
    ...(useSearch ? { tools: [{ type: "web_search_20250305", name: "web_search" }] } : {}),
    messages: [{ role: "user", content: prompt }],
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      onRetry(attempt);
      await sleep(1200 * attempt);
    }
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 401 || res.status === 400) {
        const data = await res.json();
        throw new Error(data?.error?.message || `HTTP ${res.status}`);
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      // Anthropic Messages API — collect ALL text content blocks
      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n\n");

      if (!text) throw new Error("No text content in response");
      return text;
    } catch (err) {
      if (attempt === 2) throw err;
      if (err.message.includes("401") || err.message.includes("400")) throw err;
    }
  }
}


/* ─── COMPONENT ───────────────────────────────────────────────────── */
export default function UrbanSketcher() {
  const [niche, setNiche]       = useState("urban sketching");
  const [location, setLocation] = useState("");
  const [running, setRunning]   = useState(false);
  const [agents, setAgents]     = useState(
    AGENT_META.map((a) => ({ ...a, status: "idle", output: "", error: "", retry: 0, expanded: false }))
  );
  const [progress, setProgress]   = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [allDone, setAllDone]     = useState(false);
  const [copyMsg, setCopyMsg]     = useState("");
  const outputsRef = useRef([]);

  const setAgent = (id, patch) =>
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const runPipeline = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setAllDone(false);
    setCopyMsg("");
    outputsRef.current = [];
    setAgents(AGENT_META.map((a) => ({ ...a, status: "idle", output: "", error: "", retry: 0, expanded: false })));
    setProgress(0);
    setProgressLabel("");

    let prevOutput = "";

    for (let i = 0; i < 4; i++) {
      const agentId = i + 1;
      // 15s cooldown between agents to stay under 30k tokens/min rate limit
      if (i > 0) {
        setProgressLabel(`Agent ${agentId} of 4 starting in 15s…`);
        await sleep(15000);
      }
      const pct = Math.round((i / 4) * 100);
      setProgress(pct);
      setProgressLabel(`Agent ${agentId} of 4 running… ${pct}%`);
      setAgent(agentId, { status: "running", retry: 0 });

      try {
        const text = await runAgent({
          agentId,
          niche,
          location,
          prevOutput,
          onRetry: (n) => setAgent(agentId, { retry: n }),
        });
        outputsRef.current[i] = text;
        prevOutput = text;
        setAgent(agentId, { status: "done", output: text, expanded: true });
      } catch (err) {
        const msg = err.message || "Unknown error";
        outputsRef.current[i] = "";
        setAgent(agentId, { status: "error", error: msg });
        // Continue pipeline even on error — next agent gets empty prevOutput
        prevOutput = "";
      }
    }

    setProgress(100);
    setProgressLabel("Pipeline complete!");
    setRunning(false);
    setAllDone(true);
  }, [running, niche, location]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      runPipeline();
    }
  };

  const copyAll = () => {
    const all = outputsRef.current
      .map((o, i) => o ? `=== AGENT ${i + 1}: ${AGENT_META[i].name} ===\n\n${o}` : "")
      .filter(Boolean)
      .join("\n\n" + "─".repeat(60) + "\n\n");

    const tryFallback = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = all;
        ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopyMsg("✓ Copied!");
      } catch {
        setCopyMsg("⚠ Copy failed");
      }
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(all).then(() => setCopyMsg("✓ Copied!")).catch(tryFallback);
    } else {
      tryFallback();
    }
    setTimeout(() => setCopyMsg(""), 2500);
  };

  const resetPipeline = () => {
    setAgents(AGENT_META.map((a) => ({ ...a, status: "idle", output: "", error: "", retry: 0, expanded: false })));
    setAllDone(false);
    setProgress(0);
    setProgressLabel("");
    outputsRef.current = [];
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Spiral binding */}
      <div className="spiral" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="spiral-ring" />
        ))}
      </div>

      {/* Header */}
      <header className="header">
        <svg className="logo-svg" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <circle cx="18" cy="18" r="16" stroke="#3a5f4a" strokeWidth="2" fill="rgba(58,95,74,.08)" />
          <path d="M10 26 Q14 10 18 14 Q22 18 26 8" stroke="#3a5f4a" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="26" cy="8" r="2" fill="#3a6a9a" />
          <line x1="10" y1="27" x2="27" y2="27" stroke="#c8b89a" strokeWidth="1.5" strokeDasharray="3,3" />
        </svg>
        <span className="header-title">Urban Sketcher</span>
        <span className="header-sub">content intelligence</span>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1>
          Build Your AI Agent<br />
          <span className="hero-highlight">Content System</span>
        </h1>
        <p className="hero-sub">4 agents · web search · scripts · hooks · in one pipeline</p>
        {running && (
          <div>
            <div className="progress-bar-wrap" role="status" aria-live="polite">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-label">{progressLabel}</p>
          </div>
        )}
        {allDone && !running && (
          <p className="progress-label" role="status">✓ {progressLabel}</p>
        )}
      </section>

      {/* Input card */}
      <div className="input-card" role="form" aria-label="Pipeline configuration">
        <div className="tape" aria-hidden="true" />
        <div className="fields-row">
          <div className="field-wrap">
            <label className="field-label" htmlFor="niche-input">Niche / subject matter</label>
            <textarea
              id="niche-input"
              className="field-input"
              rows={1}
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={handleKey}
              disabled={running}
              aria-label="Niche or subject matter"
            />
          </div>
          <div className="field-wrap">
            <label className="field-label" htmlFor="location-input">
              Sketching location <span style={{ opacity: .65 }}>(optional)</span>
            </label>
            <textarea
              id="location-input"
              className="field-input"
              rows={1}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKey}
              placeholder="e.g. Futala Lake, Nagpur"
              disabled={running}
              aria-label="Sketching location (optional)"
            />
          </div>
        </div>
        {location.trim() && (
          <div className="loc-pill" role="status">
            📍 All 4 agents will be grounded in {location.trim()}
          </div>
        )}
        <button
          id="run-pipeline-btn"
          className={`run-btn${running ? " running" : ""}`}
          onClick={runPipeline}
          disabled={running || !niche.trim()}
          aria-label="Run the 4-agent pipeline"
        >
          {running ? "✍ Pipeline running…" : "▶ Run Pipeline"}
        </button>
      </div>

      {/* Agent cards */}
      <div className="agents-section" aria-label="Pipeline agents">
        {agents.map((agent, idx) => {
          const isLast = idx === agents.length - 1;
          const connDone = agent.status === "done";

          return (
            <div key={agent.id}>
              <div
                id={`agent-card-${agent.id}`}
                className={`agent-card ${agent.status}`}
                role="region"
                aria-label={`Agent ${agent.id}: ${agent.name}`}
              >
                <div className="card-top">
                  <div className="card-left">
                    <div
                      className="stamp"
                      aria-hidden="true"
                      style={agent.status === "done" ? { animation: "stamp-in .4s ease" } : {}}
                    >
                      {agent.status === "done" ? "✓" : `0${agent.id}`}
                    </div>
                    <div>
                      <div className="card-name">Agent {agent.id < 10 ? `0${agent.id}` : agent.id} — {agent.name}</div>
                      <div className="card-desc">{agent.desc}</div>
                    </div>
                  </div>
                  <div className="card-right">
                    {agent.status === "idle"    && <span className="badge badge-idle">○ idle</span>}
                    {agent.status === "running" && agent.retry === 0 && <span className="badge badge-running" role="status">✍ sketching…</span>}
                    {agent.status === "running" && agent.retry > 0  && <span className="badge badge-retry" role="status">↺ retry {agent.retry}/2</span>}
                    {agent.status === "done"    && <span className="badge badge-done">✓ inked</span>}
                    {agent.status === "error"   && <span className="badge badge-error" role="alert">✗ failed</span>}
                    {agent.status === "done" && (
                      <button
                        className="expand-btn"
                        onClick={() => setAgent(agent.id, { expanded: !agent.expanded })}
                        aria-expanded={agent.expanded}
                        aria-controls={`agent-output-${agent.id}`}
                      >
                        {agent.expanded ? "▲ hide" : "▼ show"}
                      </button>
                    )}
                  </div>
                </div>

                {agent.status === "running" && (
                  <div className="progress-strip" role="progressbar" aria-label="Processing">
                    <div className="strip-fill" />
                  </div>
                )}

                {agent.status === "done" && agent.expanded && (
                  <div className="output-wrap" id={`agent-output-${agent.id}`}>
                    <pre className="output-pre">{agent.output}</pre>
                  </div>
                )}

                {agent.status === "error" && (
                  <div className="error-msg" role="alert">
                    ✗ {agent.error}
                  </div>
                )}
              </div>

              {!isLast && (
                <div
                  className={`connector${connDone ? " done" : ""}`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Done bar */}
      {allDone && (
        <div className="done-bar">
          <div className="done-bar-inner" role="region" aria-label="Pipeline complete">
            <div className="done-bar-title">🎨 Pipeline complete — all agents inked</div>
            <div className="done-bar-btns">
              <button id="copy-output-btn" className="btn-copy" onClick={copyAll} aria-label="Copy all agent outputs">
                {copyMsg || "⎘ Copy All Output"}
              </button>
              <button id="run-again-btn" className="btn-again" onClick={resetPipeline} aria-label="Reset and run again">
                ↺ Run Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        draw the world · one sketch at a time
      </footer>
    </>
  );
}
