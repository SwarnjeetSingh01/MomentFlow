"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, BrainCircuit, PenTool, MessageSquare, Video,
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
.w-3/4 { width: 75%; }
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

const buildPrompt = (agentId, niche, location, outputs) => {
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

CONTENT GAP ALERT:
Name ONE angle audiences want but very few creators are doing well.

NON-FOLLOWER REACH ANALYSIS:
Name the #1 format pulling non-follower reach in this niche and why.`;
  }

  if (agentId === 2) {
    const prevOutput = outputs[0] || "";
    return `You are Agent 02 — Validation Engine. You analyze content data and produce a prioritized strategy brief for @usknagpur.

${CREATOR_CONTEXT}
${locNote}

RESEARCH DATA FROM AGENT 01:
${prevOutput}

SECTION 1 — SCORING
Score each post in the research data (Reach, Engagement, Save/Intent).

SECTION 2 — TOPIC CLUSTERS
Group posts into 4–6 clusters. Name each cluster: [TECHNIQUE or TOPIC] + [AUDIENCE EMOTION or OUTCOME].

SECTION 3 — RECOMMENDED TOPIC
Based on the clusters, select the #1 RECOMMENDED TOPIC for the creator to execute next. Provide:
- Topic Name
- Content Angle
- Why Now
- Estimated Reach Potential`;
  }

  if (agentId === 3) {
    const prevOutput = outputs[1] || "";
    const locGround = loc
      ? `LOCATION GROUNDING: Ensure at least one concept heavily features "${loc}" and specific sensory details from that place.`
      : "";

    return `You are Agent 03 — Script Writer for @usknagpur (Urban Sketchers Nagpur).

${CREATOR_CONTEXT}
${locNote}

VALIDATION DATA FROM AGENT 02:
${prevOutput}

TASK: Generate 3 DISTINCT, premium short-form script concepts based on the RECOMMENDED TOPIC.
To save tokens and be actionable, use the highly condensed "Beat Sheet" format. 

${locGround}

For EACH of the 3 scripts, output exactly this format:
### Script [1/2/3]: [Catchy Title]
- **Vibe:** [e.g. Fast-paced, Meditative, Educational]
- **Beat 1 (Value Open - 0-3s):** [Visual action] | Audio: [Core hook idea]
- **Beat 2 (The Technique - 3-15s):** [Visual action] | Audio: [Core insight/tip]
- **Beat 3 (The Payoff - 15-25s):** [Visual reveal] | Audio: [Emotional shift]
- **CTA (25-30s):** [Visual text] | Audio: [Save/Comment prompt]

Keep descriptions to 1 sentence per beat. Focus on premium quality, not fluff. Provide 3 completely different angles (e.g. one tutorial, one aesthetic vlog, one mistake-to-avoid).`;
  }

  if (agentId === 4) {
    const scriptsOutput = outputs[2] || "";
    const locHooks = loc
      ? `LOCATION RULE: At least 1 hook per script MUST reference "${loc}" by name OR use a specific sensory detail tied to that place.`
      : "";

    return `You are Agent 04 — Hook Generator for @usknagpur (Urban Sketchers Nagpur).

${CREATOR_CONTEXT}
${locNote}

SCRIPTS FROM AGENT 03:
${scriptsOutput}

${locHooks}

TASK: For EACH of the 3 scripts provided, generate exactly 2 scroll-stopping hooks.
CRITICAL RULE: The FIRST 3 WORDS of every hook are the most important. They must create immediate tension, curiosity, or recognition. Do NOT start with "I", "Are you", "Do you", "Hey".

OUTPUT FORMAT:
### Hooks for Script 1
1. **[Pattern Name]:** "[Full hook text - max 15 words]"
2. **[Pattern Name]:** "[Full hook text - max 15 words]"

### Hooks for Script 2
1. **[Pattern Name]:** "[Full hook text - max 15 words]"
2. **[Pattern Name]:** "[Full hook text - max 15 words]"

### Hooks for Script 3
1. **[Pattern Name]:** "[Full hook text - max 15 words]"
2. **[Pattern Name]:** "[Full hook text - max 15 words]"`;
  }

  if (agentId === 5) {
    const scriptsOutput = outputs[2] || "";
    
    return `You are Agent 05 — Production Director for @usknagpur (Urban Sketchers Nagpur).

${CREATOR_CONTEXT}

SCRIPTS FROM AGENT 03:
${scriptsOutput}

TASK: Provide a highly actionable, concise Recording Guide for the creator so they know exactly how to shoot these 3 scripts with their phone. Do NOT write fluff or long paragraphs. Use tight bullet points to save tokens.

OUTPUT FORMAT:
### Master Shot List (Applicable to all 3 scripts)
- [Shot Type 1]: [How to film it, e.g., "Over-the-shoulder macro using 2x zoom"]
- [Shot Type 2]: [How to film it]
- [Shot Type 3]: [How to film it]

### Script-Specific Needs
- **Script 1:** [Specific prop, lighting condition, or camera movement required]
- **Script 2:** [Specific prop, lighting condition, or camera movement required]
- **Script 3:** [Specific prop, lighting condition, or camera movement required]

### Common Filming Mistakes to Avoid
- [Mistake 1]
- [Mistake 2]`;
  }

  return "";
};

/* ─── AGENT RUNNER ────────────────────────────────────────────────── */
const AGENT_META = [
  { id: 1, name: "Content Scout",     desc: "Searching YouTube & Instagram trends", icon: Search },
  { id: 2, name: "Validation Engine", desc: "Scoring & clustering content data",    icon: BrainCircuit },
  { id: 3, name: "Script Writer",     desc: "Drafting 3 distinct premium scripts",  icon: PenTool },
  { id: 4, name: "Hook Generator",    desc: "Crafting viral hooks for each script", icon: MessageSquare },
  { id: 5, name: "Production Dir.",   desc: "Generating actionable recording guide",icon: Video },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const trimContext = (text, maxChars) =>
  text.length <= maxChars ? text : "[...trimmed...]\n" + text.slice(-maxChars);

async function runAgent({ agentId, niche, location, outputs, onRetry }) {
  const prompt = buildPrompt(agentId, niche, location, outputs);

  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
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

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n\n");

      if (!text) throw new Error("No content in response");
      return text;
    } catch (err) {
      if (attempt === 2) throw err;
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

    for (let i = 0; i < 5; i++) {
      const agentId = i + 1;
      if (i > 0) {
        await sleep(20000); // Wait 20s between calls to prevent rate limits
      }
      setAgent(agentId, { status: "running", retry: 0 });

      try {
        const text = await runAgent({
          agentId,
          niche,
          location,
          outputs: outputsRef.current,
          onRetry: (n) => setAgent(agentId, { retry: n }),
        });
        outputsRef.current[i] = text;
        setAgent(agentId, { status: "done", output: text, expanded: true });
      } catch (err) {
        const msg = err.message || "Unknown error";
        outputsRef.current[i] = "";
        setAgent(agentId, { status: "error", error: msg });
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

    if (navigator.clipboard) {
      navigator.clipboard.writeText(all).then(() => setCopyMsg("✓ Copied!")).catch(() => setCopyMsg("⚠ Failed"));
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
          <p>Provide a topic and let our 5-agent AI system handle research, validation, scripting, viral hooks, and production planning automatically.</p>
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
