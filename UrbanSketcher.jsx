"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, BrainCircuit, PenTool, MessageSquare, Video,
  CheckCircle, Copy, RotateCcw, Play, MapPin, 
  ChevronDown, ChevronUp, Loader2, Info, AlertCircle, Sparkles, RotateCw
} from "lucide-react";
import styles from "./UrbanSketcher.module.css";
import Agent3DScene from "./Agent3D";

/* ─── ICON MAP ────────────────────────────────────────────────────── */
const AGENT_ICONS = { 1: Search, 2: BrainCircuit, 3: PenTool, 4: MessageSquare, 5: Video };

/* ─── INK SVG STROKE ──────────────────────────────────────────────── */
function InkUnderline() {
  return (
    <svg className={styles.inkUnderline} viewBox="0 0 200 10" preserveAspectRatio="none">
      <path className={styles.inkStroke} d="M0,6 C30,2 50,8 80,5 C110,2 140,9 170,4 C185,3 195,6 200,5" />
    </svg>
  );
}

/* ─── PROGRESSIVE INSIGHT SYSTEM ──────────────────────────────────── */
const INSIGHT_TEMPLATES = {
  1: [
    { label: "Scanning Platforms", value: "YouTube × Instagram", color: "" },
    { label: "Content Patterns", value: "Analyzing top 10 performers...", color: "" },
    { label: "Hook Styles Indexed", value: "7 pattern categories loaded", color: "amber" },
  ],
  2: [
    { label: "Scoring Method", value: "Reach × Engagement × Save Intent", color: "" },
    { label: "Cluster Detection", value: "Grouping into topic families...", color: "" },
    { label: "Strategy Signal", value: "Ranking topic recommendations", color: "amber" },
  ],
  3: [
    { label: "Script Format", value: "Beat Sheet (condensed)", color: "" },
    { label: "Angle Diversity", value: "Tutorial + Vlog + Mistake-Avoid", color: "" },
    { label: "Target Duration", value: "25–30s per script", color: "amber" },
  ],
  4: [
    { label: "Hook Constraint", value: "First 3 words = maximum tension", color: "" },
    { label: "Pattern Library", value: "6 hooks across 3 scripts", color: "" },
    { label: "Attention Metric", value: "Sub-2s scroll-stop trigger", color: "amber" },
  ],
  5: [
    { label: "Output Format", value: "Shot list + filming guide", color: "" },
    { label: "Camera Setup", value: "Phone-first production", color: "" },
    { label: "Quality Gate", value: "Mistake avoidance checklist", color: "amber" },
  ],
};

function extractInsightsFromOutput(agentId, output) {
  if (!output) return [];
  const insights = [];
  
  if (agentId === 1) {
    const tableMatch = output.match(/\|[^|]+\|[^|]+\|([^|]+)\|/g);
    if (tableMatch && tableMatch.length > 2) {
      insights.push({ label: "Trending Format Detected", value: tableMatch[1]?.replace(/\|/g, '').trim().slice(0, 40) || "POV Sketch Transitions", color: "" });
    }
    const gapMatch = output.match(/CONTENT GAP.*?\n(.+)/i);
    if (gapMatch) insights.push({ label: "Content Gap Alert", value: gapMatch[1].trim().slice(0, 50), color: "amber" });
    const reachMatch = output.match(/NON-FOLLOWER.*?\n(.+)/i);
    if (reachMatch) insights.push({ label: "Non-Follower Reach", value: reachMatch[1].trim().slice(0, 50), color: "green" });
  }
  if (agentId === 2) {
    const topicMatch = output.match(/Topic Name[:\s]*(.+)/i);
    if (topicMatch) insights.push({ label: "Recommended Topic", value: topicMatch[1].trim().slice(0, 40), color: "amber" });
    const angleMatch = output.match(/Content Angle[:\s]*(.+)/i);
    if (angleMatch) insights.push({ label: "Content Angle", value: angleMatch[1].trim().slice(0, 45), color: "" });
    const reachMatch = output.match(/Reach Potential[:\s]*(.+)/i);
    if (reachMatch) insights.push({ label: "Reach Potential", value: reachMatch[1].trim().slice(0, 30), color: "green" });
  }
  if (agentId === 3) {
    const scripts = output.match(/### Script \d[:/]?\s*(.+)/gi);
    if (scripts) {
      scripts.forEach((s, i) => {
        insights.push({ label: `Script ${i + 1}`, value: s.replace(/### Script \d[:/]?\s*/i, '').trim().slice(0, 40), color: i === 0 ? "amber" : "" });
      });
    }
  }
  if (agentId === 4) {
    const hooks = output.match(/"([^"]{10,60})"/g);
    if (hooks) {
      hooks.slice(0, 3).forEach((h, i) => {
        insights.push({ label: `Top Hook ${i + 1}`, value: h.replace(/"/g, '').slice(0, 45), color: i === 0 ? "amber" : "" });
      });
    }
  }
  if (agentId === 5) {
    insights.push({ label: "Production Guide", value: "Shot list + recording tips ready", color: "green" });
  }
  
  return insights.length > 0 ? insights : [{ label: "Agent Complete", value: "Output ready to review", color: "green" }];
}

/* ─── SIMPLE MARKDOWN RENDERER ────────────────────────────────────── */
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) { elements.push(<hr key={i} />); i++; continue; }
    if (line.startsWith('### ')) { elements.push(<h3 key={i}>{inlineFormat(line.slice(4))}</h3>); i++; continue; }
    if (line.startsWith('## ')) { elements.push(<h2 key={i}>{inlineFormat(line.slice(3))}</h2>); i++; continue; }
    if (line.startsWith('# ')) { elements.push(<h1 key={i}>{inlineFormat(line.slice(2))}</h1>); i++; continue; }

    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) { tableLines.push(lines[i]); i++; }
      elements.push(renderTable(tableLines, elements.length));
      continue;
    }

    if (/^\s*[-*]\s/.test(line) || /^\s*\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && (/^\s*[-*]\s/.test(lines[i]) || /^\s*\d+\.\s/.test(lines[i]))) {
        const content = lines[i].replace(/^\s*[-*]\s/, '').replace(/^\s*\d+\.\s/, '');
        items.push(<li key={i}>{inlineFormat(content)}</li>);
        i++;
      }
      elements.push(<ul key={`list-${i}`}>{items}</ul>);
      continue;
    }
    elements.push(<p key={i}>{inlineFormat(line)}</p>);
    i++;
  }
  return elements;
}

function renderTable(lines, key) {
  const dataLines = lines.filter(l => !/^\|[\s-:|]+\|$/.test(l.trim()));
  if (dataLines.length === 0) return null;
  const parse = (line) => line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim());
  const headers = parse(dataLines[0]);
  const rows = dataLines.slice(1).map(parse);
  return (
    <table key={`t-${key}`}>
      <thead><tr>{headers.map((h, j) => <th key={j}>{inlineFormat(h)}</th>)}</tr></thead>
      <tbody>{rows.map((row, ri) => <tr key={ri}>{row.map((c, ci) => <td key={ci}>{inlineFormat(c)}</td>)}</tr>)}</tbody>
    </table>
  );
}

function inlineFormat(text) {
  if (!text) return text;
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part.split(/(`[^`]+`)/g).map((cp, j) => {
      if (cp.startsWith('`') && cp.endsWith('`')) return <code key={`${i}-${j}`}>{cp.slice(1, -1)}</code>;
      return cp;
    });
  });
}

/* ─── PROMPTS ─────────────────────────────────────────────────────── */
const CREATOR_CONTEXT = `
ACCOUNT: @usknagpur — Urban Sketchers Nagpur | 3,825 followers | ~3,500 avg reel views
COMMUNITY CORE: A meetup community where people of all professions (not just professional artists) come together to sketch live on location using any medium.
MAIN IDEA: Live sketching, connecting with diverse people, and understanding different art styles and approaches. The only criterion is a willingness to sketch.
GOAL: Break the follower bubble, grow non-follower reach, and encourage more locals to join the meetups. City: Nagpur, India.
`;

const buildPrompt = (agentId, niche, location, outputs) => {
  const loc = location ? location.trim() : "";
  const locNote = loc ? `LOCATION CONTEXT: The chosen location is "${loc}". You must infer the atmosphere, visual traits, and cultural vibe of this specific place. Tailor all your ideas, script concepts, and shot lists directly to the unique characteristics of this location.` : "";

  if (agentId === 1) {
    const locSearch = loc ? `Since the location is "${loc}", suggest one content angle that specifically leverages the unique visual or cultural aspects of this place.` : "";
    return `You are Agent 01 — Content Scout for @usknagpur (Urban Sketchers Nagpur).
${CREATOR_CONTEXT}
${locNote}

Using your knowledge of social media content trends for art communities, creative meetups, and live sketching, identify the TOP 10 highest-performing content patterns on YouTube and Instagram for this niche.
Focus on formats that highlight community connection, diverse art styles, and lower the barrier to entry for beginners.
${locSearch}

Be specific and realistic. Reference real creator styles and formats you know work well.

Produce a Markdown table:
| # | Platform | Title / Caption Pattern | Est. Views | Engagement Rate | Hook Style | Format | Why It Works |

Hook Style: QUESTION | PAIN POINT | CURIOSITY GAP | BOLD CLAIM | BEFORE/AFTER | INCLUSIVE | BEHIND-THE-SCENES
Format: Reel | YouTube Short | YouTube Long-form | Mini-Doc | Time-lapse | POV | Carousel

CONTENT GAP ALERT:
Name ONE angle audiences want (e.g., showing beginners alongside pros, exploring different mediums) but very few creators are doing well.

NON-FOLLOWER REACH ANALYSIS:
Name the #1 format pulling non-follower reach in this niche and why.`;
  }
  if (agentId === 2) {
    return `You are Agent 02 — Validation Engine. You analyze content data and produce a prioritized strategy brief for @usknagpur.
${CREATOR_CONTEXT}
${locNote}

RESEARCH DATA FROM AGENT 01:
${outputs[0] || ""}

SECTION 1 — SCORING
Score each post in the research data based on Reach, Engagement, and Community-Building Potential (how likely it is to make someone attend a meetup).

SECTION 2 — TOPIC CLUSTERS
Group posts into 4–6 clusters. Name each cluster: [TECHNIQUE/VIBE] + [AUDIENCE EMOTION/OUTCOME].

SECTION 3 — RECOMMENDED TOPIC
Based on the clusters, select the #1 RECOMMENDED TOPIC for the creator to execute next. The topic must highlight the inclusive, multi-medium, live-sketching nature of the group. Provide:
- Topic Name
- Content Angle
- Why Now
- Estimated Reach Potential`;
  }
  if (agentId === 3) {
    const locGround = loc ? `LOCATION GROUNDING: Ensure the scripts feel authentic to "${loc}". Use its specific sensory details, landmarks, or atmosphere to drive the creative concepts.` : "";
    return `You are Agent 03 — Script Writer for @usknagpur (Urban Sketchers Nagpur).
${CREATOR_CONTEXT}
${locNote}

VALIDATION DATA FROM AGENT 02:
${outputs[1] || ""}

TASK: Generate 3 DISTINCT, premium short-form script concepts based on the RECOMMENDED TOPIC.
You know that great Urban Sketching content often involves:
- Cinematic B-roll (the environment)
- Time-lapses (sketch progression)
- Artist Voice/Interviews (explaining approach/medium)
- Masterpiece Reveals
However, YOU decide the absolute best structure and format for each specific concept. Be creative!

${locGround}

For EACH of the 3 scripts, output exactly this format:
### Script [1/2/3]: [Catchy Title]
- **Vibe:** [e.g. Community-focused, Inspiring, Educational, Fast-paced]
- **Beat 1 (0-3s):** [Visual action] | Audio: [Core hook idea/Voiceover]
- **Beat 2 (3-15s):** [Visual action] | Audio: [Insight/Action/Interview]
- **Beat 3 (15-25s):** [Visual action] | Audio: [Progression/Payoff]
- **CTA (25-30s):** [Visual text] | Audio: [Prompt to join/comment/share]`;
  }
  if (agentId === 4) {
    const locHooks = loc ? `LOCATION RULE: At least 1 hook per script MUST reference gathering at "${loc}".` : "";
    return `You are Agent 04 — Hook Generator for @usknagpur (Urban Sketchers Nagpur).
${CREATOR_CONTEXT}
${locNote}

SCRIPTS FROM AGENT 03:
${outputs[2] || ""}
${locHooks}

TASK: For EACH of the 3 scripts, generate exactly 2 scroll-stopping hooks.
CRITICAL: First 3 words must create tension, curiosity, or a sense of belonging. Never start with "I", "Are you", "Do you", "Hey". Focus on lowering the barrier to entry for beginners or highlighting the diverse community.

### Hooks for Script 1
1. **[Pattern Name]:** "[Hook - max 15 words]"
2. **[Pattern Name]:** "[Hook - max 15 words]"

### Hooks for Script 2
1. **[Pattern Name]:** "[Hook - max 15 words]"
2. **[Pattern Name]:** "[Hook - max 15 words]"

### Hooks for Script 3
1. **[Pattern Name]:** "[Hook - max 15 words]"
2. **[Pattern Name]:** "[Hook - max 15 words]"`;
  }
  if (agentId === 5) {
    return `You are Agent 05 — Production Director for @usknagpur (Urban Sketchers Nagpur).
${CREATOR_CONTEXT}

SCRIPTS FROM AGENT 03:
${outputs[2] || ""}

TASK: Concise Recording Guide. You are the expert director—decide exactly what shots and audio the creator needs to capture to make these scripts work perfectly.

### Master Shot List
- **[Shot/Element Type]:** [How to film it]
- **[Shot/Element Type]:** [How to film it]

### Script-Specific Needs
- **Script 1:** [Specific props/lighting/camera/people needed]
- **Script 2:** [Specific props/lighting/camera/people needed]
- **Script 3:** [Specific props/lighting/camera/people needed]

### Common Filming Mistakes to Avoid
- [Mistake 1]
- [Mistake 2]
- [Mistake 3]`;
  }
  return "";
};

/* ─── AGENT META ──────────────────────────────────────────────────── */
const AGENT_META = [
  { id: 1, name: "Content Scout",     desc: "Trend research across YouTube & Instagram", icon: Search },
  { id: 2, name: "Validation Engine", desc: "Scoring, clustering & topic selection",      icon: BrainCircuit },
  { id: 3, name: "Script Writer",     desc: "3 premium beat-sheet scripts",              icon: PenTool },
  { id: 4, name: "Hook Generator",    desc: "6 scroll-stopping hooks",                  icon: MessageSquare },
  { id: 5, name: "Production Dir.",   desc: "Shot list & recording guide",              icon: Video },
];

const AGENT_3D_LABELS = {
  1: { name: "Scanning Trends", desc: "Searching YouTube & Instagram for top-performing content..." },
  2: { name: "Validating Data", desc: "Scoring reach, engagement, and save-intent signals..." },
  3: { name: "Writing Scripts", desc: "Drafting 3 distinct premium beat-sheet concepts..." },
  4: { name: "Generating Hooks", desc: "Crafting scroll-stopping opening lines..." },
  5: { name: "Planning Production", desc: "Building your shot list and recording guide..." },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runAgent({ agentId, niche, location, outputs, onRetry }) {
  const prompt = buildPrompt(agentId, niche, location, outputs);
  const body = { model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] };

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) { onRetry(attempt); await sleep(1200 * attempt); }
    try {
      const res = await fetch("/api/pipeline", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n\n");
      if (!text) throw new Error("No content in response");
      return text;
    } catch (err) { if (attempt === 2) throw err; }
  }
}

/* ─── LIVE FEED COMPONENT ─────────────────────────────────────────── */
function LiveFeed({ agents, outputs }) {
  const [visibleInsights, setVisibleInsights] = useState([]);
  const activeAgent = agents.find(a => a.status === "running");
  const isRunning = !!activeAgent;
  const allDone = agents.every(a => a.status === "done" || a.status === "error");

  // Collect completed insights + progressive reveal for running agent
  useEffect(() => {
    const collected = [];
    
    // Add insights from completed agents
    agents.forEach(a => {
      if (a.status === "done") {
        const agentInsights = extractInsightsFromOutput(a.id, outputs[a.id - 1]);
        agentInsights.forEach(ins => collected.push({ ...ins, agentId: a.id }));
      }
    });

    // If an agent is running, progressively reveal template insights
    if (activeAgent) {
      const templates = INSIGHT_TEMPLATES[activeAgent.id] || [];
      let revealCount = 0;
      
      const interval = setInterval(() => {
        revealCount++;
        if (revealCount <= templates.length) {
          setVisibleInsights([...collected, ...templates.slice(0, revealCount).map(t => ({ ...t, agentId: activeAgent.id }))]);
        }
      }, 3000);

      // Initial state
      setVisibleInsights(collected);
      
      return () => clearInterval(interval);
    } else {
      setVisibleInsights(collected);
    }
  }, [agents.map(a => a.status).join(','), activeAgent?.id]);

  if (!isRunning && !allDone && visibleInsights.length === 0) {
    return (
      <div className={styles.liveFeed}>
        <div className={styles.feedHeader}>
          <span className={styles.feedDot} /> Live Feed
        </div>
        <div className={styles.idleMessage}>
          Insights will appear here as your agents work.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.liveFeed}>
      <div className={styles.feedHeader}>
        <span className={`${styles.feedDot} ${isRunning ? styles.live : ''}`} />
        {isRunning ? 'Live Feed' : 'Insights'}
      </div>
      <AnimatePresence>
        {visibleInsights.map((ins, i) => (
          <motion.div
            key={`${ins.agentId}-${ins.label}-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className={styles.insightItem}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={styles.insightLabel}>{ins.label}</div>
            <div className={`${styles.insightValue} ${ins.color === 'amber' ? styles.amber : ins.color === 'green' ? styles.green : ''}`}>
              → {ins.value}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────────────────────── */
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
    setRunning(true); setAllDone(false); setCopyMsg("");
    outputsRef.current = [];
    setAgents(AGENT_META.map((a) => ({ ...a, status: "idle", output: "", error: "", retry: 0, expanded: false })));

    for (let i = 0; i < 5; i++) {
      const agentId = i + 1;
      if (i > 0) await sleep(20000);
      setAgent(agentId, { status: "running", retry: 0 });
      try {
        const text = await runAgent({ agentId, niche, location, outputs: outputsRef.current, onRetry: (n) => setAgent(agentId, { retry: n }) });
        outputsRef.current[i] = text;
        setAgent(agentId, { status: "done", output: text, expanded: true });
      } catch (err) {
        outputsRef.current[i] = "";
        setAgent(agentId, { status: "error", error: err.message || "Unknown error" });
      }
    }
    setRunning(false); setAllDone(true);
  }, [running, niche, location]);

  const copyAll = () => {
    const all = outputsRef.current.map((o, i) => o ? `=== AGENT ${i + 1}: ${AGENT_META[i].name} ===\n\n${o}` : "").filter(Boolean).join("\n\n" + "─".repeat(60) + "\n\n");
    if (navigator.clipboard) navigator.clipboard.writeText(all).then(() => setCopyMsg("✓ Copied!")).catch(() => setCopyMsg("⚠ Failed"));
    setTimeout(() => setCopyMsg(""), 2500);
  };

  const resetPipeline = () => {
    setAgents(AGENT_META.map((a) => ({ ...a, status: "idle", output: "", error: "", retry: 0, expanded: false })));
    setAllDone(false); outputsRef.current = [];
  };

  const activeAgentId = agents.find(a => a.status === "running")?.id || null;
  const activeLabel = activeAgentId ? AGENT_3D_LABELS[activeAgentId] : null;
  const ActiveIcon = activeAgentId ? AGENT_ICONS[activeAgentId] : null;

  const doneCount = agents.filter(a => a.status === 'done').length;
  const runningIdx = agents.findIndex(a => a.status === 'running');
  const progressFraction = runningIdx >= 0 ? (runningIdx + 0.5) / 5 : doneCount / 5;

  return (
    <div className={styles.container}>
      <div className={styles.splitScreen}>
        {/* ─── LEFT PANEL ─── */}
        <div className={styles.leftPanel}>
          <div className={styles.leftInner}>
            {/* 3D Orb — small, ambient */}
            <div className={styles.orbArea}>
              <Agent3DScene agentId={activeAgentId} />
            </div>

            {/* Progress dots */}
            <div className={styles.progressRow}>
              {agents.map((a) => (
                <div key={a.id} className={`${styles.progressDot} ${a.status === 'running' ? styles.active : a.status === 'done' ? styles.done : ''}`} />
              ))}
            </div>

            {/* Live Feed — Progressive Insights */}
            <LiveFeed agents={agents} outputs={outputsRef.current} />

            {/* Status card */}
            <div className={styles.statusCard}>
              <div className={`${styles.statusIcon} ${activeAgentId ? styles.active : allDone ? styles.done : styles.idle}`}>
                {ActiveIcon ? <ActiveIcon size={18} /> : allDone ? <CheckCircle size={18} /> : <Sparkles size={18} />}
              </div>
              <div className={styles.statusText}>
                {activeLabel ? (
                  <><h3>{activeLabel.name}</h3><p>{activeLabel.desc}</p></>
                ) : allDone ? (
                  <><h3 style={{ color: '#10b981' }}>Complete</h3><p>All agents finished.</p></>
                ) : (
                  <><h3>Ready</h3><p>Enter a topic to start.</p></>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className={styles.rightPanel}>
          <div className={styles.rightContent}>
            {/* Input Bar */}
            <div className={styles.inputBar}>
              <div className={styles.inputBarField}>
                <label htmlFor="niche-input">Niche / Topic</label>
                <div className={styles.inputBarWrapper}>
                  <Search size={15} className={styles.inputBarIcon} />
                  <input id="niche-input" value={niche} onChange={(e) => setNiche(e.target.value)} disabled={running} placeholder="Urban sketching, ink wash..." />
                </div>
              </div>
              <div className={styles.inputBarField}>
                <label htmlFor="location-input">Location</label>
                <div className={styles.inputBarWrapper}>
                  <MapPin size={15} className={styles.inputBarIcon} />
                  <input id="location-input" value={location} onChange={(e) => setLocation(e.target.value)} disabled={running} placeholder="Futala Lake, Nagpur" />
                </div>
              </div>
              <button onClick={runPipeline} disabled={running || !niche.trim()} className={`${styles.runBtn} ${running ? styles.running : ''}`}>
                {running ? <><Loader2 className={styles.animateSpin} size={15} /> Running...</> : <><Play size={15} /> Generate</>}
              </button>
            </div>

            {/* Pipeline Timeline */}
            <div className={styles.timeline}>
              <div className={styles.timelineProgress} style={{ height: `calc(${progressFraction * 100}% - 40px)` }} />
              
              {agents.map((agent) => {
                const Icon = agent.icon;
                const isRunning = agent.status === "running";
                const isDone = agent.status === "done";
                const isError = agent.status === "error";

                return (
                  <div key={agent.id} className={styles.timelineNode}>
                    <div className={`${styles.timelineDot} ${styles[agent.status]}`} />

                    <motion.div
                      layout
                      className={`${styles.nodeCard} ${isRunning ? styles.running : ''} ${isDone ? styles.done : ''} ${isError ? styles.error : ''}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: agent.id * 0.08, type: "spring", stiffness: 300, damping: 24 }}
                    >
                      <div className={styles.nodeNumber}>0{agent.id}</div>

                      <div className={styles.nodeHeader}>
                        <div className={styles.nodeInfo}>
                          <div className={`${styles.nodeIconWrap} ${isRunning ? styles.running : ''} ${isDone ? styles.done : ''} ${isError ? styles.error : ''}`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <div className={styles.nodeTitle}>0{agent.id} — {agent.name}</div>
                            <div className={styles.nodeDesc}>{agent.desc}</div>
                          </div>
                        </div>
                        <div className={styles.nodeStatus}>
                          {agent.status === "idle" && <span className={styles.statusIdle}>Waiting</span>}
                          {isRunning && <span className={styles.statusRunning}><Loader2 size={13} className={styles.animateSpin} /> Processing</span>}
                          {isDone && (
                            <>
                              <span className={styles.statusDone}><CheckCircle size={13} /> Done</span>
                              <button className={styles.expandBtn} onClick={() => setAgent(agent.id, { expanded: !agent.expanded })}>
                                {agent.expanded ? <><ChevronUp size={11} /> Hide</> : <><ChevronDown size={11} /> Show</>}
                              </button>
                            </>
                          )}
                          {isError && <span className={styles.statusError}><AlertCircle size={13} /> Failed</span>}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isRunning && (
                          <motion.div key="shimmer" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={styles.shimmerBlock}>
                            <div className={styles.shimmerLine} style={{ width: '100%' }} />
                            <div className={styles.shimmerLine} style={{ width: '85%' }} />
                            <div className={styles.shimmerLine} style={{ width: '65%' }} />
                          </motion.div>
                        )}
                        {isError && (
                          <motion.div key="error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                            <div className={styles.errorBlock}>
                              <div className={styles.errorMsg}>
                                {agent.error.includes('429') ? 'Rate limited by API. Try again in a moment.' :
                                 agent.error.includes('500') ? 'API server error. The service may be temporarily down.' :
                                 agent.error.includes('timeout') ? 'Request timed out after 3 retries.' :
                                 `Agent failed: ${agent.error}`}
                              </div>
                              <button className={styles.retryBtn} onClick={() => { /* retry logic would go here */ }}>
                                <RotateCw size={12} /> Retry
                              </button>
                            </div>
                          </motion.div>
                        )}
                        {isDone && agent.expanded && (
                          <motion.div key="output" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                            <div className={styles.outputBlock}>
                              <div className={styles.markdownContent}>{renderMarkdown(agent.output)}</div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Done Bar */}
            <AnimatePresence>
              {allDone && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.doneBar}>
                  <div className={styles.doneLabel}><CheckCircle size={18} /> Pipeline Complete</div>
                  <div className={styles.doneBtns}>
                    <button onClick={copyAll} className={`${styles.doneBtn} ${styles.btnPrimary}`}><Copy size={13} /> {copyMsg || "Copy All"}</button>
                    <button onClick={resetPipeline} className={`${styles.doneBtn} ${styles.btnSecondary}`}><RotateCcw size={13} /> Reset</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
