"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, BrainCircuit, PenTool, MessageSquare, 
  CheckCircle, Copy, RotateCcw, Play, MapPin, 
  ChevronDown, ChevronUp, Sparkles, Loader2, Info, AlertCircle
} from "lucide-react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');`;

const CSS = `
${FONTS}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg-primary: #fdfbf7;
  --bg-secondary: #f4f1ea;
  --accent-primary: #2c4c3b;
  --accent-secondary: #c88242;
  --text-main: #1a1a1a;
  --text-muted: #6b6b6b;
  --border-color: rgba(44, 76, 59, 0.15);
  --glass-bg: rgba(255, 255, 255, 0.6);
  --glass-border: rgba(255, 255, 255, 0.8);
}
body {
  font-family: 'Outfit', sans-serif;
  background-color: var(--bg-primary);
  background-image: 
    radial-gradient(at 0% 0%, rgba(200, 130, 66, 0.04) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(44, 76, 59, 0.05) 0px, transparent 50%);
  color: var(--text-main);
  min-height: 100vh;
  overflow-x: hidden;
}

/* Utilities */
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.ml-4 { margin-left: 16px; }
.mt-4 { margin-top: 16px; }
.w-full { width: 100%; }
.w-3\\/4 { width: 75%; }
.text-sm { font-size: 0.875rem; }
.text-lg { font-size: 1.125rem; }
.font-medium { font-weight: 500; }
.flex-1 { flex: 1; }
.overflow-hidden { overflow: hidden; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

/* Glass Container */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
}

/* Header */
.header {
  position: sticky; top: 0; z-index: 50;
  padding: 16px 32px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(253, 251, 247, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
}
.header-brand {
  display: flex; align-items: center; gap: 12px;
}
.header-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem; font-weight: 600; color: var(--accent-primary);
}
.header-link {
  display: flex; align-items: center; gap: 8px;
  text-decoration: none; font-size: 0.9rem;
  color: var(--text-muted); transition: color 0.2s;
}
.header-link:hover { color: var(--accent-primary); }

/* Layout */
.main-container {
  max-width: 900px; margin: 0 auto; padding: 48px 24px;
}

/* Hero */
.hero {
  text-align: center; margin-bottom: 48px;
}
.hero h1 {
  font-family: 'Playfair Display', serif;
  font-size: 3rem; color: var(--text-main); line-height: 1.2;
  margin-bottom: 16px;
}
.hero p {
  font-size: 1.1rem; color: var(--text-muted); max-width: 600px; margin: 0 auto;
}

/* Input Form */
.input-section {
  padding: 32px; margin-bottom: 48px;
}
.input-group {
  display: flex; flex-direction: column; gap: 24px; margin-bottom: 32px;
}
.input-field {
  display: flex; flex-direction: column; gap: 8px;
}
.input-field label {
  font-weight: 500; color: var(--accent-primary); display: flex; align-items: center; gap: 6px;
}
.input-field input, .input-field textarea {
  width: 100%; padding: 16px; border-radius: 12px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.9);
  font-family: 'Outfit', sans-serif; font-size: 1rem;
  transition: all 0.2s ease;
  resize: none;
}
.input-field input:focus, .input-field textarea:focus {
  outline: none; border-color: var(--accent-secondary);
  box-shadow: 0 0 0 4px rgba(200, 130, 66, 0.1);
}
.run-btn {
  width: 100%; padding: 18px; border-radius: 12px;
  background: var(--accent-primary); color: white;
  font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 600;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: transform 0.2s, background 0.2s;
}
.run-btn:hover:not(:disabled) {
  background: #1e3629; transform: translateY(-2px);
}
.run-btn:disabled {
  opacity: 0.7; cursor: not-allowed;
}

/* Agents Pipeline */
.pipeline-container {
  display: flex; flex-direction: column; gap: 16px; position: relative;
}
.agent-card {
  padding: 24px; display: flex; flex-direction: column; gap: 16px;
  transition: box-shadow 0.3s ease;
  overflow: hidden;
  border-width: 2px;
  border-style: solid;
}
.agent-header {
  display: flex; align-items: center; justify-content: space-between;
}
.agent-info {
  display: flex; align-items: center; gap: 16px;
}
.agent-icon-wrap {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.3s, color 0.3s;
}
.agent-title {
  font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 600;
}
.agent-desc {
  font-size: 0.9rem; color: var(--text-muted);
}
.agent-status {
  display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 0.9rem;
}

/* Status Colors */
.status-idle { color: var(--text-muted); }
.status-running { color: var(--accent-secondary); }
.status-done { color: var(--accent-primary); }
.status-error { color: #e53e3e; }

.expand-btn {
  background: transparent; border: 1px solid var(--border-color);
  padding: 6px 12px; border-radius: 20px; font-size: 0.85rem;
  cursor: pointer; display: flex; align-items: center; gap: 6px;
  transition: all 0.2s;
}
.expand-btn:hover { background: var(--bg-secondary); }

/* Output & Animations */
.output-box {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--border-color);
  border-radius: 12px; padding: 20px;
  font-family: 'Outfit', sans-serif; font-size: 0.95rem; line-height: 1.6;
  white-space: pre-wrap; word-break: break-word;
  max-height: 500px; overflow-y: auto;
  color: var(--text-main);
}
.output-box::-webkit-scrollbar { width: 6px; }
.output-box::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }

/* Working Visualization */
.working-vis {
  display: flex; align-items: center; gap: 16px;
  padding: 16px; background: rgba(200, 130, 66, 0.05);
  border-radius: 12px; border: 1px dashed rgba(200, 130, 66, 0.3);
  color: var(--accent-secondary);
}
.shimmer-line {
  height: 8px; border-radius: 4px;
  background: linear-gradient(90deg, transparent, rgba(200,130,66,0.2), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

/* Done Bar */
.done-bar {
  margin-top: 32px; padding: 24px;
  display: flex; align-items: center; justify-content: space-between;
  background: var(--accent-primary); color: white;
}
.done-btns {
  display: flex; gap: 12px;
}
.done-btn {
  padding: 10px 20px; border-radius: 8px; font-weight: 500;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  border: none; transition: background 0.2s; font-family: 'Outfit', sans-serif;
}
.btn-primary { background: white; color: var(--accent-primary); }
.btn-primary:hover { background: #f0f0f0; }
.btn-secondary { background: rgba(255,255,255,0.1); color: white; }
.btn-secondary:hover { background: rgba(255,255,255,0.2); }
`;

/* ─── PROMPTS ─────────────────────────────────────────────────────── */
// Creator profile context injected into every agent
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

  if (agentId === 1) {
    const locSearch = loc
      ? `Run an additional search specifically for "${niche}" + "${loc}" to find local or regional content patterns.`
      : "";

    return `You are Agent 01 — Content Scout for @usknagpur (Urban Sketchers Nagpur).
${CREATOR_CONTEXT}
${locNote}

Using your knowledge of social media content trends for art and urban sketching creators, identify the TOP 10 highest-performing content patterns on YouTube and Instagram for this niche.
${locSearch}

Be specific and realistic. Reference real creator styles and formats you know work well.

Produce a Markdown table:
| # | Platform | Title / Caption Pattern | Est. Views | Engagement Rate | Hook Style | Format | Why It Works |

Hook Style: QUESTION | PAIN POINT | CURIOSITY GAP | BOLD CLAIM | BEFORE/AFTER | ASPIRATIONAL | NUMBER/LIST
Format: Reel | YouTube Short | YouTube Long-form | Tutorial | Time-lapse | POV | Carousel
List YouTube first, then Instagram, ordered by engagement rate descending.

CONTENT GAP ALERT:
Name ONE angle audiences want but very few creators are doing well.

NON-FOLLOWER REACH ANALYSIS:
Name the #1 format pulling non-follower reach in this niche and why.

VIRAL PICKS (top 3 to adapt for @usknagpur):
1. [pattern] — [why it works for a Nagpur community account]
2. [pattern] — [why it works for a Nagpur community account]
3. [pattern] — [why it works for a Nagpur community account]`;
  }

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
  { id: 1, name: "Content Scout",     desc: "Searching YouTube & Instagram trends", icon: Search },
  { id: 2, name: "Validation Engine", desc: "Scoring & clustering content data",   icon: BrainCircuit },
  { id: 3, name: "Script Writer",     desc: "Drafting your 60-second reel script",icon: PenTool },
  { id: 4, name: "Hook Generator",    desc: "Generating 5 scroll-stopping hooks", icon: MessageSquare },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const trimContext = (text, maxChars) =>
  text.length <= maxChars ? text : "[...trimmed for token efficiency...]\n" + text.slice(-maxChars);

async function runAgent({ agentId, niche, location, prevOutput, onRetry }) {
  const ctx = agentId === 3 ? trimContext(prevOutput, 1800) : prevOutput;
  const prompt = buildPrompt(agentId, niche, location, ctx);

  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: agentId === 1 ? 1800 : 1200,
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
      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n\n");

      if (!text) throw new Error("No content in response");
      return text;
    } catch (err) {
      if (attempt === 2) throw err;
      if (err.message.includes("401") || err.message.includes("400")) throw err;
    }
  }
}

/* ─── COMPONENT ───────────────────────────────────────────────────── */
export default function UrbanSketcher() {
  const [niche, setNiche] = useState("urban sketching");
  const [location, setLocation] = useState("");
  const [running, setRunning] = useState(false);
  const [agents, setAgents] = useState(
    AGENT_META.map((a) => ({ ...a, status: "idle", output: "", error: "", retry: 0, expanded: false }))
  );
  const [allDone, setAllDone] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const outputsRef = useRef([]);

  const setAgent = (id, patch) =>
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const runPipeline = useCallback(async () => {
    if (running || !niche.trim()) return;
    setRunning(true);
    setAllDone(false);
    setCopyMsg("");
    outputsRef.current = [];
    setAgents(AGENT_META.map((a) => ({ ...a, status: "idle", output: "", error: "", retry: 0, expanded: false })));

    let prevOutput = "";

    for (let i = 0; i < 4; i++) {
      const agentId = i + 1;
      if (i > 0) {
        await sleep(25000);
      }
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
        prevOutput = "";
      }
    }

    setRunning(false);
    setAllDone(true);
  }, [running, niche, location]);

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
    outputsRef.current = [];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <Sparkles className="text-[var(--accent-primary)]" size={24} color="var(--accent-primary)" />
          <span className="header-title">UrbanSketcher</span>
        </div>
        <a href="#" className="header-link">
          <Info size={16} /> How it works
        </a>
      </header>

      <main className="main-container">
        {/* Hero Section */}
        <motion.section 
          className="hero"
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <h1>Design Your Creative Workflow</h1>
          <p>Provide a topic and let our 4-agent AI system handle research, validation, scripting, and viral hooks automatically.</p>
        </motion.section>

        {/* Input Form */}
        <motion.div 
          className="input-section glass-panel"
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="input-group">
            <div className="input-field">
              <label htmlFor="niche-input">
                <Search size={18} /> What's the main topic or niche?
              </label>
              <input 
                id="niche-input" 
                value={niche} 
                onChange={(e) => setNiche(e.target.value)} 
                disabled={running} 
                placeholder="e.g. Urban sketching, ink wash, architecture..."
              />
            </div>
            <div className="input-field">
              <label htmlFor="location-input">
                <MapPin size={18} /> Location <span style={{ opacity: 0.6, fontSize: '0.85em' }}>(Optional)</span>
              </label>
              <input 
                id="location-input" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                disabled={running} 
                placeholder="e.g. Futala Lake, Nagpur"
              />
            </div>
          </div>
          
          <button onClick={runPipeline} disabled={running || !niche.trim()} className="run-btn">
            {running ? (
              <><Loader2 className="animate-spin" size={20} /> Pipeline Running...</>
            ) : (
              <><Play size={20} /> Generate Content System</>
            )}
          </button>
        </motion.div>

        {/* Agents Pipeline */}
        <motion.div 
          className="pipeline-container"
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
        >
          <AnimatePresence>
            {agents.map((agent) => {
              const Icon = agent.icon;
              const isRunning = agent.status === "running";
              const isDone = agent.status === "done";
              const isError = agent.status === "error";

              return (
                <motion.div 
                  key={agent.id} 
                  variants={itemVariants}
                  layout
                  className={`agent-card glass-panel ${isRunning ? "shadow-lg" : ""}`}
                  style={{
                    borderColor: isRunning ? 'var(--accent-secondary)' : isDone ? 'var(--accent-primary)' : 'var(--border-color)',
                  }}
                >
                  <motion.div layout className="agent-header">
                    <div className="agent-info">
                      <div className="agent-icon-wrap" style={{ 
                        background: isRunning ? 'var(--accent-secondary)' : isDone ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        color: isRunning || isDone ? 'white' : 'var(--accent-primary)'
                      }}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="agent-title">Agent 0{agent.id} — {agent.name}</h3>
                        <p className="agent-desc">{agent.desc}</p>
                      </div>
                    </div>

                    <div className="agent-status">
                      {agent.status === "idle" && <span className="status-idle">Waiting...</span>}
                      {isRunning && (
                        <span className="status-running flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" /> Processing
                        </span>
                      )}
                      {isDone && <span className="status-done flex items-center gap-2"><CheckCircle size={18} /> Complete</span>}
                      {isError && <span className="status-error flex items-center gap-2"><AlertCircle size={18} /> Failed</span>}

                      {isDone && (
                        <button className="expand-btn ml-4" onClick={() => setAgent(agent.id, { expanded: !agent.expanded })}>
                          {agent.expanded ? <><ChevronUp size={16} /> Hide</> : <><ChevronDown size={16} /> Show</>}
                        </button>
                      )}
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {isRunning && (
                      <motion.div 
                        key="working-vis"
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: "auto" }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="working-vis overflow-hidden mt-4"
                      >
                        <Sparkles size={20} className="animate-pulse" />
                        <div className="flex-1">
                          <div className="shimmer-line w-full mb-2" />
                          <div className="shimmer-line w-3/4" />
                        </div>
                      </motion.div>
                    )}
                    {isDone && agent.expanded && (
                      <motion.div 
                        key="output-vis"
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: "auto" }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4"
                      >
                        <div className="output-box">{agent.output}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Done Bar */}
        <AnimatePresence>
          {allDone && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="done-bar glass-panel"
            >
              <div className="font-medium text-lg flex items-center gap-3">
                <CheckCircle size={24} /> Pipeline Complete
              </div>
              <div className="done-btns">
                <button onClick={copyAll} className="done-btn btn-primary">
                  <Copy size={18} /> {copyMsg || "Copy All"}
                </button>
                <button onClick={resetPipeline} className="done-btn btn-secondary">
                  <RotateCcw size={18} /> Reset
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
