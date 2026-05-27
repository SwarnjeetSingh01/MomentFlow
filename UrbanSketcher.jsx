"use client";

import { useState, useCallback, useRef, useEffect, useMemo, Suspense } from "react";
import { useAuth } from "./context/AuthContext";
import { auth } from "./lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, BrainCircuit, PenTool, MessageSquare, Video,
  CheckCircle, Copy, RotateCcw, Play, MapPin, Download,
  ChevronDown, ChevronUp, Loader2, Info, AlertCircle, Sparkles,
  RotateCw, History, X, Clock, Users, Target, LogOut, Square
} from "lucide-react";
import styles from "./UrbanSketcher.module.css";
import Agent3DScene from "./Agent3D";

// Extracted utilities
import { AGENT_META, AGENT_3D_LABELS, AGENT_ICONS } from "./constants/agentMeta";
import { INSIGHT_TEMPLATES, extractInsightsFromOutput } from "./utils/insights";
import { runAgent, sleep } from "./utils/agentRunner";
import { renderMarkdown } from "./utils/markdown";

/* ─── INK SVG STROKE ──────────────────────────────────────────────── */
function InkUnderline() {
  return (
    <svg className={styles.inkUnderline} viewBox="0 0 200 10" preserveAspectRatio="none">
      <path className={styles.inkStroke} d="M0,6 C30,2 50,8 80,5 C110,2 140,9 170,4 C185,3 195,6 200,5" />
    </svg>
  );
}

/* ─── LIVE FEED COMPONENT ─────────────────────────────────────────── */
function LiveFeed({ agents, agentOutputs }) {
  const [visibleInsights, setVisibleInsights] = useState([]);
  const activeAgent = agents.find(a => a.status === "running");
  const isRunning = !!activeAgent;
  const allDone = agents.every(a => a.status === "done" || a.status === "error");

  // Memoize status string to avoid re-creating on every render
  const statusKey = useMemo(() => agents.map(a => a.status).join(','), [agents]);
  const activeId = activeAgent?.id || null;

  useEffect(() => {
    const collected = [];
    
    // Add insights from completed agents
    agents.forEach(a => {
      if (a.status === "done") {
        const agentInsights = extractInsightsFromOutput(a.id, agentOutputs[a.id - 1]);
        agentInsights.forEach(ins => collected.push({ ...ins, agentId: a.id }));
      }
    });

    // If an agent is running, progressively reveal template insights
    if (activeId) {
      const templates = INSIGHT_TEMPLATES[activeId] || [];
      let revealCount = 0;
      
      const interval = setInterval(() => {
        revealCount++;
        if (revealCount <= templates.length) {
          setVisibleInsights([...collected, ...templates.slice(0, revealCount).map(t => ({ ...t, agentId: activeId }))]);
        }
      }, 3000);

      // Initial state
      setVisibleInsights(collected);
      
      return () => clearInterval(interval);
    } else {
      setVisibleInsights(collected);
    }
  }, [statusKey, activeId, agentOutputs]);

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

/* ─── COUNTDOWN TIMER ─────────────────────────────────────────────── */
function CountdownTimer({ seconds, onComplete }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  if (remaining <= 0) return null;

  return (
    <span className={styles.countdown}>
      <span className={styles.countdownNumber}>{remaining}s</span> rate-limit cooldown
    </span>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────────────────────── */
export default function UrbanSketcher() {
  const [niche, setNiche] = useState("urban sketching");
  const [location, setLocation] = useState("");
  const [lore, setLore] = useState("");
  const [running, setRunning] = useState(false);
  const [agents, setAgents] = useState(
    AGENT_META.map((a) => ({ ...a, status: "idle", output: "", error: "", retry: 0, expanded: false }))
  );
  const [skillLevel, setSkillLevel] = useState("Mixed");
  const [eventFocus, setEventFocus] = useState("General Sketching");
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const [cooldownAgent, setCooldownAgent] = useState(null);
  const [agentOutputs, setAgentOutputs] = useState([]);
  const outputsRef = useRef([]);
  const abortRef = useRef(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("usk_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) { console.error("Failed to load history", e); }
  }, []);

  const setAgent = (id, patch) =>
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  // Re-run a single agent (P2 #8)
  const rerunAgent = useCallback(async (agentId) => {
    if (running) return;
    setRunning(true);
    setAgent(agentId, { status: "running", output: "", error: "", retry: 0 });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const text = await runAgent({
        agentId,
        niche,
        location,
        skillLevel,
        eventFocus,
        lore,
        outputs: outputsRef.current,
        onRetry: (n) => setAgent(agentId, { retry: n }),
        signal: controller.signal,
      });
      outputsRef.current[agentId - 1] = text;
      setAgentOutputs([...outputsRef.current]);
      setAgent(agentId, { status: "done", output: text, expanded: true });
    } catch (err) {
      if (err.name === "AbortError") {
        setAgent(agentId, { status: "idle", error: "" });
      } else {
        setAgent(agentId, { status: "error", error: err.message || "Unknown error" });
      }
    }
    setRunning(false);
    abortRef.current = null;
  }, [niche, location, skillLevel, eventFocus, lore, running]);

  const runPipeline = useCallback(async () => {
    if (running || !niche.trim()) return;
    setRunning(true); setAllDone(false); setCopyMsg("");
    outputsRef.current = [];
    setAgentOutputs([]);
    setAgents(AGENT_META.map((a) => ({ ...a, status: "idle", output: "", error: "", retry: 0, expanded: false })));

    const controller = new AbortController();
    abortRef.current = controller;

    for (let i = 0; i < 5; i++) {
      if (controller.signal.aborted) break;
      const agentId = i + 1;
      if (i > 0) {
        setCooldownAgent(agentId);
        await sleep(20000);
        setCooldownAgent(null);
        if (controller.signal.aborted) break;
      }
      setAgent(agentId, { status: "running", retry: 0 });
      try {
        const text = await runAgent({
          agentId,
          niche,
          location,
          skillLevel,
          eventFocus,
          lore,
          outputs: outputsRef.current,
          onRetry: (n) => setAgent(agentId, { retry: n }),
          signal: controller.signal,
        });
        outputsRef.current[i] = text;
        setAgentOutputs([...outputsRef.current]);
        setAgent(agentId, { status: "done", output: text, expanded: true });
      } catch (err) {
        if (err.name === "AbortError") {
          setAgent(agentId, { status: "idle" });
          break;
        }
        outputsRef.current[i] = "";
        setAgentOutputs([...outputsRef.current]);
        setAgent(agentId, { status: "error", error: err.message || "Unknown error" });
      }
    }
    setRunning(false); setCooldownAgent(null);
    abortRef.current = null;

    if (!controller.signal.aborted) {
      setAllDone(true);
      // Save to history
      const newItem = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        niche, location, skillLevel, eventFocus,
        outputs: [...outputsRef.current]
      };
      setHistory(prev => {
        const updated = [newItem, ...prev].slice(0, 50);
        localStorage.setItem("usk_history", JSON.stringify(updated));
        return updated;
      });
    }
  }, [running, niche, location, skillLevel, eventFocus, lore]);

  const cancelPipeline = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const loadHistoryItem = (item) => {
    setNiche(item.niche); setLocation(item.location || "");
    setSkillLevel(item.skillLevel || "Mixed"); setEventFocus(item.eventFocus || "General Sketching");
    outputsRef.current = [...item.outputs];
    setAgentOutputs([...item.outputs]);
    setAgents(AGENT_META.map((a, i) => ({ ...a, status: "done", output: item.outputs[i] || "", error: "", retry: 0, expanded: false })));
    setAllDone(true); setIsHistoryOpen(false);
  };

  const copyAll = () => {
    const all = outputsRef.current.map((o, i) => o ? `=== AGENT ${i + 1}: ${AGENT_META[i].name} ===\n\n${o}` : "").filter(Boolean).join("\n\n" + "─".repeat(60) + "\n\n");
    if (navigator.clipboard) navigator.clipboard.writeText(all).then(() => setCopyMsg("✓ Copied!")).catch(() => setCopyMsg("⚠ Failed"));
    setTimeout(() => setCopyMsg(""), 2500);
  };

  const downloadAll = () => {
    const all = outputsRef.current.map((o, i) => o ? `=== AGENT ${i + 1}: ${AGENT_META[i].name} ===\n\n${o}` : "").filter(Boolean).join("\n\n" + "─".repeat(60) + "\n\n");
    
    // Pre-render markdown to HTML so the file works offline
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>MomentFlows Plan</title>
<style>
  body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #222; background: #fdfdfd; }
  h1, h2, h3 { color: #111; margin-top: 1.5em; }
  table { border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 0.95em; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  th, td { border: 1px solid #e0e0e0; padding: 12px 16px; text-align: left; vertical-align: top; }
  th { background-color: #f4f4f5; font-weight: 600; color: #333; }
  tr:nth-child(even) { background-color: #fafafa; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
  pre { background: #222; color: #fff; padding: 16px; border-radius: 8px; overflow-x: auto; }
  hr { border: none; border-top: 1px solid #e0e0e0; margin: 2em 0; }
  ul, ol { padding-left: 1.5em; }
  li { margin: 4px 0; }
  strong { color: #111; }
</style>
</head>
<body>
  <div id="content"></div>
  <script>
    // Lightweight inline markdown renderer (no CDN dependency)
    function md(t) {
      return t
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^---+$/gm, '<hr>')
        .replace(/^\\*\\*\\*+$/gm, '<hr>')
        .replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*([^*]+)\\*/g, '<em>$1</em>')
        .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
        .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\\/li>)/gs, '<ul>$1</ul>')
        .replace(/(\\|.+\\|\\n?)+/g, function(table) {
          var rows = table.trim().split('\\n').filter(function(r) { return !/^[\\s|:-]+$/.test(r.replace(/\\|/g,'')); });
          if (rows.length === 0) return '';
          var html = '<table>';
          rows.forEach(function(row, i) {
            var cells = row.split('|').filter(function(c,j,a) { return j > 0 && j < a.length-1; });
            var tag = i === 0 ? 'th' : 'td';
            html += '<tr>' + cells.map(function(c) { return '<' + tag + '>' + c.trim() + '</' + tag + '>'; }).join('') + '</tr>';
          });
          return html + '</table>';
        })
        .replace(/^(?!<[huptlo]|$)(.+)$/gm, '<p>$1</p>');
    }
    document.getElementById('content').innerHTML = md(${JSON.stringify(all)});
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MomentFlows-Plan-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetPipeline = () => {
    setAgents(AGENT_META.map((a) => ({ ...a, status: "idle", output: "", error: "", retry: 0, expanded: false })));
    setAllDone(false); outputsRef.current = []; setAgentOutputs([]);
  };

  const activeAgentId = agents.find(a => a.status === "running")?.id || null;
  const activeLabel = activeAgentId ? AGENT_3D_LABELS[activeAgentId] : null;
  const ActiveIcon = activeAgentId ? AGENT_ICONS[activeAgentId] : null;

  const doneCount = agents.filter(a => a.status === 'done').length;
  const runningIdx = agents.findIndex(a => a.status === 'running');
  const progressFraction = runningIdx >= 0 ? (runningIdx + 0.5) / 5 : doneCount / 5;

  return (
    <div className={styles.container}>
      {/* Auth Header */}
      {!authLoading && (
        <div className={styles.authHeader}>
          {user ? (
            <>
              <span className={styles.userEmail}>{user.email}</span>
              <button className={styles.authBtn} onClick={async (e) => {
                e.preventDefault();
                try {
                  await signOut(auth);
                  router.push("/login");
                } catch (err) {
                  console.error("SignOut Error: ", err);
                  alert("Failed to sign out: " + err.message);
                }
              }}>Sign Out</button>
            </>
          ) : (
            <Link href="/login" className={styles.authBtn}>Sign In</Link>
          )}
        </div>
      )}

      {/* History Button & Sidebar */}
      <button className={styles.historyBtn} onClick={() => setIsHistoryOpen(true)} title="History">
        <History size={18} />
      </button>

      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.historyOverlay} onClick={() => setIsHistoryOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className={styles.historySidebar}>
              <div className={styles.historyHeader}>
                <h3>History</h3>
                <button className={styles.closeHistoryBtn} onClick={() => setIsHistoryOpen(false)}><X size={20} /></button>
              </div>
              <div className={styles.historyList}>
                {history.length === 0 ? (
                  <div className={styles.historyEmpty}>No history yet. Run your first pipeline!</div>
                ) : (
                  history.map(item => (
                    <div key={item.id} className={styles.historyItem} onClick={() => loadHistoryItem(item)}>
                      <div className={styles.historyItemTitle}>{item.location || item.niche}</div>
                      <div className={styles.historyItemMeta}>
                        <Clock size={12} /> {item.date} • {item.eventFocus}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={styles.splitScreen}>
        {/* ─── LEFT PANEL ─── */}
        <div className={styles.leftPanel}>
          <div className={styles.leftInner}>
            {/* 3D Orb — small, ambient */}
            <div className={styles.orbArea}>
              <Suspense fallback={<div className={styles.orbFallback}><Loader2 className={styles.animateSpin} size={24} /></div>}>
                <Agent3DScene agentId={activeAgentId} />
              </Suspense>
            </div>

            {/* Progress dots */}
            <div className={styles.progressRow}>
              {agents.map((a) => (
                <div key={a.id} className={`${styles.progressDot} ${a.status === 'running' ? styles.active : a.status === 'done' ? styles.done : ''}`} />
              ))}
            </div>

            {/* Live Feed — Progressive Insights */}
            <LiveFeed agents={agents} agentOutputs={agentOutputs} />

            {/* Status card */}
            <div className={styles.statusCard}>
              <div className={`${styles.statusIcon} ${activeAgentId ? styles.active : allDone ? styles.done : styles.idle}`}>
                {ActiveIcon ? <ActiveIcon size={18} /> : allDone ? <CheckCircle size={18} /> : <Sparkles size={18} />}
              </div>
              <div className={styles.statusText}>
                {activeLabel ? (
                  <><h3>{activeLabel.name}</h3><p>{activeLabel.desc}</p></>
                ) : cooldownAgent ? (
                  <><h3>Rate-Limit Pause</h3><p><CountdownTimer seconds={20} /></p></>
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
              <div className={styles.inputBarField}>
                <label>Skill Level</label>
                <div className={styles.inputBarWrapper}>
                  <Users size={15} className={styles.inputBarIcon} />
                  <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} disabled={running}>
                    <option value="Mixed">Mixed (All Levels)</option>
                    <option value="Beginner Friendly">Beginner Friendly</option>
                    <option value="Advanced Workshop">Advanced Workshop</option>
                  </select>
                </div>
              </div>
              <div className={styles.inputBarField}>
                <label>Event Focus</label>
                <div className={styles.inputBarWrapper}>
                  <Target size={15} className={styles.inputBarIcon} />
                  <select value={eventFocus} onChange={(e) => setEventFocus(e.target.value)} disabled={running}>
                    <option value="General Sketching">General Sketching</option>
                    <option value="Watercolor">Watercolor Focus</option>
                    <option value="Ink Wash">Ink Wash Focus</option>
                    <option value="Architecture">Architecture</option>
                    <option value="People & Crowds">People & Crowds</option>
                  </select>
                </div>
              </div>
              {running ? (
                <button onClick={cancelPipeline} className={`${styles.runBtn} ${styles.cancelBtn}`}>
                  <Square size={13} /> Cancel
                </button>
              ) : (
                <button onClick={runPipeline} disabled={!niche.trim()} className={styles.runBtn}>
                  <Play size={15} /> Generate
                </button>
              )}
            </div>

            {/* Dynamic Community Lore Input */}
            <div className={styles.loreContainer}>
              <label htmlFor="lore-input">Community Lore & Inside Jokes (Optional)</label>
              <textarea 
                id="lore-input" 
                value={lore} 
                onChange={(e) => setLore(e.target.value)} 
                disabled={running} 
                placeholder="e.g. 'The uncle who hates expensive coffee', 'Running joke about rulers', 'The chaos of finding a good chair'"
                className={styles.loreTextarea}
                rows={2}
              />
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
                              <button
                                className={styles.rerunBtn}
                                onClick={() => rerunAgent(agent.id)}
                                disabled={running}
                                title="Re-run this agent"
                              >
                                <RotateCw size={11} />
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
                              <button
                                className={styles.retryBtn}
                                onClick={() => rerunAgent(agent.id)}
                                disabled={running}
                              >
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
                    <button onClick={downloadAll} className={`${styles.doneBtn} ${styles.btnPrimary}`}><Download size={13} /> Download</button>
                    <button onClick={copyAll} className={`${styles.doneBtn} ${styles.btnSecondary}`}><Copy size={13} /> {copyMsg || "Copy All"}</button>
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
