"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useAuth } from "./context/AuthContext";
import { auth } from "./lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, BrainCircuit, PenTool, MessageSquare, Video,
  CheckCircle, Copy, RotateCcw, Play, MapPin, 
  ChevronDown, ChevronUp, Loader2, Info, AlertCircle, Sparkles, RotateCw, History, X, Clock, Users, Target, LogOut
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
    { label: "Scanning Platforms", value: "YouTube × Instagram — real content patterns", color: "" },
    { label: "Content Mix", value: "40% Fun · 30% Community · 20% Art · 10% Edu", color: "" },
    { label: "Shareability Filter", value: "Humor, identity, relatability, surprise", color: "amber" },
  ],
  2: [
    { label: "Scoring Method", value: "Shareability × Authenticity × Growth", color: "" },
    { label: "Content Pillars", value: "Mapping to 5 content pillars...", color: "" },
    { label: "Strategy Signal", value: "Balancing raw + polished content", color: "amber" },
  ],
  3: [
    { label: "Script Style", value: "Documentary · Raw · Authentic", color: "" },
    { label: "Personality Focus", value: "Recurring faces + real reactions", color: "" },
    { label: "Retention Plan", value: "Pattern interrupts every 2-3s", color: "amber" },
  ],
  4: [
    { label: "Hook Rule", value: "Direct, human, 1-second grab", color: "" },
    { label: "Anti-Pattern", value: "No poetic/agency-style hooks", color: "" },
    { label: "CTA Strategy", value: "Engagement-driving, not generic", color: "amber" },
  ],
  5: [
    { label: "Filming Style", value: "Phone-first, raw moments priority", color: "" },
    { label: "Capture Focus", value: "Reactions, fails, real conversations", color: "" },
    { label: "Authenticity Gate", value: "Real > Perfect checklist", color: "amber" },
  ],
};

function extractInsightsFromOutput(agentId, output) {
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
  const dataLines = lines.filter(l => !/^[\s-:|]+$/.test(l.replace(/\|/g, '').trim()));
  if (dataLines.length === 0) return null;
  const parse = (line) => line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim());
  const headers = parse(dataLines[0]);
  const rows = dataLines.slice(1).map(parse);
  return (
    <div key={`tw-${key}`} className={styles.tableWrapper}>
      <table key={`t-${key}`}>
        <thead><tr>{headers.map((h, j) => <th key={j}>{inlineFormat(h)}</th>)}</tr></thead>
        <tbody>{rows.map((row, ri) => <tr key={ri}>{row.map((c, ci) => <td key={ci}>{inlineFormat(c)}</td>)}</tr>)}</tbody>
      </table>
    </div>
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
const CREATOR_CONTEXT = (skill, focus) => `
ACCOUNT: @usknagpur — Urban Sketchers Nagpur | 3,825 followers | ~3,500 avg reel views
COMMUNITY CORE: A meetup community where people of all professions (not just professional artists) come together to sketch live on location using any medium.
EVENT FOCUS: ${focus}.
TARGET SKILL LEVEL: ${skill}.
MAIN IDEA: Live sketching, connecting with diverse people, and understanding different art styles and approaches. The only criterion is a willingness to sketch.
GOAL: Break the follower bubble, grow non-follower reach, and encourage more locals to join the meetups. City: Nagpur, India.

BRAND IDENTITY: "Nagpur's most welcoming creative community" — Anyone can sketch. Art for everyone. Creativity without intimidation.
This identity must reflect in every caption, narration, editing choice, music selection, and community interaction.

CONTENT PHILOSOPHY (CRITICAL — FOLLOW STRICTLY):
- AUTHENTICITY > POLISH. Documentary-style, natural reactions, imperfect moments, raw human behavior. Never over-produced or advertisement-like.
- REQUIRED CONTENT MIX: 40% Relatable/Fun (sketch fails, funny reactions, chaos, expectations vs reality) | 30% Community/Emotional (beginner stories, first meetup, strangers sketching) | 20% Artistic/Cinematic (timelapses, reveals, location aesthetics) | 10% Educational (beginner tips, supplies, how to start).
- HUMAN PERSONALITY: Build familiarity through recurring members, recognizable faces, inside jokes, community energy. Audience should recognize people from previous reels.
- RAW > PERFECT: Include messy sketches, funny failures, unfinished work, spontaneous moments, awkward laughs, hesitation, nervousness, real conversations.
- SHAREABILITY: Prioritize humor, identity, relatability, surprise, comparison, personality. High-share examples: "Engineer vs Designer sketch styles", "Beginner vs Experienced", "Expectations vs Reality".
`;

const buildPrompt = (agentId, niche, location, skillLevel, eventFocus, outputs) => {
  const loc = location ? location.trim() : "";
  const locNote = loc ? `LOCATION CONTEXT: The chosen location is "${loc}". You must infer the atmosphere, visual traits, and cultural vibe of this specific place. Tailor all your ideas, script concepts, and shot lists directly to the unique characteristics of this location.` : "";
  const context = CREATOR_CONTEXT(skillLevel, eventFocus);

  if (agentId === 1) {
    const locSearch = loc ? `Since the location is "${loc}", suggest content angles that specifically leverage the unique visual, cultural, or human aspects of this place — focus on what real, spontaneous interactions could happen there.` : "";
    return `You are Agent 01 — Content Scout for @usknagpur (Urban Sketchers Nagpur).
${context}
${locNote}

You are a content strategist who finds SPECIFIC, PROVEN content ideas and ranks them by their ability to grow followers, expand reach, and maximize shareability.

CRITICAL RULES:
- Prioritize AUTHENTIC, RAW, RELATABLE content over polished/cinematic content.
- Every idea must feel like something real people would share with friends, NOT like an advertisement.
- Hooks must be SIMPLE and DIRECT — like talking to a friend. NEVER poetic, agency-style, or overly dramatic.
  GOOD hooks: "This uncle has never drawn before", "We stopped random people at Futala", "Everyone drew the same thing differently"
  BAD hooks: "Five strangers, one sunset, different perspectives…"

STEP 1 — COMPETITIVE SCAN:
Analyze what's actually working on YouTube and Instagram for art communities, creative meetups, and live sketching creators. Focus on content that feels raw and human, not over-produced.

STEP 2 — CONTENT MIX FILTER:
Your ideas MUST follow this balance:
- 40% RELATABLE / FUN: sketch fails, funny public reactions, chaotic moments, "guess who drew this", artist struggles, expectations vs reality
- 30% COMMUNITY / EMOTIONAL: beginner stories, first meetup experiences, strangers sketching, community moments
- 20% ARTISTIC / CINEMATIC: beautiful timelapses, sketch reveals, location aesthetics
- 10% EDUCATIONAL: beginner tips, supplies, how to start sketching

STEP 3 — SHAREABILITY & GROWTH FILTER:
From your ideas, prioritize content that:
1. People will SHARE (humor, identity, relatability, surprise, comparison)
2. Pulls in non-followers (break the bubble)
3. Drives profile visits → follows conversion
4. Encourages saves & shares (algorithmic boost)
5. Features HUMAN PERSONALITY — recurring faces, real reactions, recognizable community members
${locSearch}

Be specific — reference real creator styles, actual content formats, and concrete title patterns.

Produce a Markdown table (rank by shareability + growth potential, best first):
| # | Content Idea | Category (Fun/Community/Art/Edu) | Platform | Format | Hook (Simple & Direct) | Why It Gets Shared | How to Execute |

Format: Reel | YouTube Short | YouTube Long-form | Mini-Doc | Time-lapse | POV | Carousel

CONTENT PILLARS — VARIETY CHECK:
Confirm your ideas cover ALL 5 pillars (mark which ideas fall under each):
A. Public Interaction (strangers sketching, public challenges, reactions)
B. Community Stories (member spotlights, profession-based sketching, first meetup)
C. Fun/Relatable (sketch fails, artist struggles, funny moments, chaos)
D. Artistic/Cinematic (timelapses, aesthetic visuals, sketch reveals)
E. Educational (beginner tips, materials, tutorials)

FOLLOWER GROWTH TACTICS:
List the top 3 specific, actionable tactics to convert viewers into followers. Be concrete (e.g., "Pin a 'What is Urban Sketching?' reel as your intro video") — no generic advice.

HIGH-SHAREABILITY IDEAS:
List 3 specific content ideas designed purely for maximum shares. Examples: "Engineer vs Designer sketch styles", "What your profession notices first", "Sketch expectations vs reality".

NON-FOLLOWER REACH ANALYSIS:
Name the #1 format pulling non-follower reach in this niche, why it works algorithmically, and give a step-by-step guide to optimize for it.`;
  }
  if (agentId === 2) {
    return `You are Agent 02 — Validation Engine. You analyze content data and produce a prioritized strategy brief for @usknagpur.
${context}
${locNote}

RESEARCH DATA FROM AGENT 01:
${outputs[0] || ""}

CRITICAL RULES:
- Score content ideas by AUTHENTICITY and SHAREABILITY, not just reach.
- Penalize ideas that feel over-produced, overly cinematic, or advertisement-like.
- Reward ideas that feature: real human reactions, humor, relatable moments, personality, spontaneity.
- Ensure the final recommendation maintains the 40/30/20/10 content mix.

SECTION 1 — SCORING
Score each content idea on these criteria (1-10 each):
| # | Content Idea | Shareability | Authenticity | Growth Potential | Retention Power | Community Building | TOTAL |
- Shareability: Would someone send this to a friend?
- Authenticity: Does it feel real and raw, not scripted?
- Growth Potential: Will non-followers discover and follow?
- Retention Power: Will viewers watch till the end?
- Community Building: Will it make someone want to attend a meetup?

SECTION 2 — CONTENT PILLAR MAPPING
Map all ideas into the 5 content pillars and flag any gaps:
A. Public Interaction Content (strangers, challenges, reactions)
B. Community Stories (spotlights, professions, first meetups)
C. Fun/Relatable Content (fails, struggles, chaos, humor)
D. Artistic/Cinematic Content (timelapses, reveals, aesthetics)
E. Educational Content (tips, materials, tutorials)
⚠ Flag if any pillar has zero ideas — suggest additions.

SECTION 3 — RECOMMENDED TOPIC
Select the #1 RECOMMENDED TOPIC that scores highest AND feels authentically raw (not over-produced). Provide:
- Topic Name
- Content Angle
- Content Pillar (which of the 5)
- Why It Feels Authentic
- Shareability Factor (why people will share it)
- Estimated Reach Potential
- Repetition Check: Confirm this is NOT just another "beginner transformation" or "strangers sketching" story. If it is, suggest a fresh twist.`;
  }
  if (agentId === 3) {
    const locGround = loc ? `LOCATION GROUNDING: Ensure the scripts feel authentic to "${loc}". Use its specific sensory details, real people interactions, and atmosphere — but keep it RAW, not cinematic.` : "";
    return `You are Agent 03 — Script Writer for @usknagpur (Urban Sketchers Nagpur).
${context}
${locNote}

VALIDATION DATA FROM AGENT 02:
${outputs[1] || ""}

TASK: Generate 3 DISTINCT short-form script concepts based on the RECOMMENDED TOPIC.

CRITICAL SCRIPT RULES:
1. DOCUMENTARY STYLE — Scripts should feel like capturing real moments, NOT producing a commercial. Think "we happened to be filming" energy.
2. HUMAN PERSONALITY — Every script MUST feature at least one recognizable person with a name, profession, or personality trait. Build recurring characters.
3. RAW MOMENTS — Include: awkward laughs, unfinished sketches, hesitation, nervousness, real conversations, genuine reactions. These are FEATURES, not flaws.
4. NO OVER-DRAMATIC NARRATION — Avoid overly emotional scripting, forced inspirational lines, or "creative agency" voiceover. Keep it conversational.
5. RETENTION EDITING — Build in pattern interrupts every 2-3 seconds: reaction cuts, zoom cuts, text overlays, timer countdowns, split screens, reveal moments.
6. AUTHENTICITY TEST — Ask yourself: "Would this feel fake if someone was watching over the creator's shoulder?" If yes, rewrite it.

SCRIPT VARIETY (each script must be a DIFFERENT content pillar):
- Script 1: Relatable/Fun (sketch fails, funny reactions, chaos, comparisons)
- Script 2: Community/Human (real person story, genuine interaction, personality)
- Script 3: Choose from remaining pillars (Artistic, Educational, or Public Interaction)

${locGround}

For EACH of the 3 scripts, output exactly this format:
### Script [1/2/3]: [Simple, Direct Title — NOT poetic]
- **Category:** [Fun/Community/Art/Edu/Public Interaction]
- **Vibe:** [e.g. Chaotic-fun, Wholesome-raw, Casually-educational]
- **Featured Person:** [Who appears — name/profession/trait. Build recurring faces.]
- **Beat 1 (0-3s):** [Raw opening visual] | Audio: [Simple, direct hook — like talking to a friend]
- **Beat 2 (3-8s):** [Real moment/reaction] | Audio: [Natural conversation or observation]
- **Beat 3 (8-18s):** [Genuine progression — include imperfect moments] | Audio: [Real dialogue, not voiceover]
- **Beat 4 (18-25s):** [Payoff/reveal/surprise] | Audio: [Authentic reaction]
- **CTA (25-30s):** [Text overlay] | Audio: [Engagement-driving question, NOT "join us"]
- **Retention Interrupts:** [List 3-4 specific pattern interrupts: zoom cuts, text pops, reaction inserts, split screens]
- **Shareability Factor:** [Why someone would send this to a friend]`;
  }
  if (agentId === 4) {
    const locHooks = loc ? `LOCATION RULE: At least 1 hook per script should naturally reference "${loc}" — but keep it casual, not forced.` : "";
    return `You are Agent 04 — Hook & CTA Generator for @usknagpur (Urban Sketchers Nagpur).
${context}
${locNote}

SCRIPTS FROM AGENT 03:
${outputs[2] || ""}
${locHooks}

TASK: For EACH of the 3 scripts, generate exactly 3 scroll-stopping hooks + 2 engagement CTAs.

HOOK RULES (CRITICAL — READ CAREFULLY):
- Hooks must be SIMPLE, DIRECT, and HUMAN — like something you'd say to a friend.
- Must grab attention within 1 SECOND. No buildup.
- Never start with "I", "Are you", "Do you", "Hey".
- ABSOLUTELY NO poetic, dramatic, or "creative agency" style hooks.

BANNED HOOK STYLES (never use these patterns):
❌ "Five strangers, one sunset, different perspectives…"
❌ "What happens when creativity meets chaos…"
❌ "In a city where art lives on every corner…"
❌ Any hook that sounds like a movie trailer

GOOD HOOK EXAMPLES (match this energy):
✅ "This uncle has never drawn before"
✅ "We stopped random people at Futala"
✅ "Everyone drew the same thing differently"
✅ "This engineer sketches VERY differently"
✅ "She thought she couldn't draw…"
✅ "Nobody expected THIS sketch"
✅ "His first drawing in 30 years"

CTA RULES:
- NEVER use generic CTAs like "Join us Sundays" or "Come sketch with us"
- CTAs must drive comments, shares, saves, and participation.

GOOD CTA EXAMPLES:
✅ "Would you try this?"
✅ "Tag someone who says they can't draw"
✅ "Which sketch is your favorite?"
✅ "What would YOUR profession sketch first?"
✅ "Should we invite more strangers?"

### Script 1: [Title]
**Hooks:**
1. **[Pattern]:** "[Hook - max 12 words, simple and direct]"
2. **[Pattern]:** "[Hook - max 12 words, simple and direct]"
3. **[Pattern]:** "[Hook - max 12 words, simple and direct]"
**CTAs:**
1. "[Engagement-driving CTA]"
2. "[Engagement-driving CTA]"

### Script 2: [Title]
**Hooks:**
1. **[Pattern]:** "[Hook - max 12 words, simple and direct]"
2. **[Pattern]:** "[Hook - max 12 words, simple and direct]"
3. **[Pattern]:** "[Hook - max 12 words, simple and direct]"
**CTAs:**
1. "[Engagement-driving CTA]"
2. "[Engagement-driving CTA]"

### Script 3: [Title]
**Hooks:**
1. **[Pattern]:** "[Hook - max 12 words, simple and direct]"
2. **[Pattern]:** "[Hook - max 12 words, simple and direct]"
3. **[Pattern]:** "[Hook - max 12 words, simple and direct]"
**CTAs:**
1. "[Engagement-driving CTA]"
2. "[Engagement-driving CTA]"`;
  }
  if (agentId === 5) {
    return `You are Agent 05 — Production Director for @usknagpur (Urban Sketchers Nagpur).
${context}

SCRIPTS FROM AGENT 03:
${outputs[2] || ""}

TASK: RAW-FIRST Recording Guide. You are a documentary-style director — your job is to capture AUTHENTIC moments, not produce a commercial.

CRITICAL FILMING PHILOSOPHY:
- Film like a DOCUMENTARY, not a commercial. Capture what's happening, don't stage it.
- Prioritize REACTIONS, CONVERSATIONS, and REAL MOMENTS over perfect B-roll.
- Imperfection is a feature: shaky cam during excitement = good. Overly smooth gimbal = feels fake.
- Always capture the PERSON, not just the art. Faces, expressions, body language > sketch close-ups.

### Master Shot List
For each shot, specify: what to capture, how to film it, and what AUTHENTIC MOMENT to look for.
- **[Shot Type]:** [How to film] — [What real moment to watch for]

### Raw Moments to Capture (DON'T MISS THESE)
List 5-6 specific spontaneous moments the filmer should watch for and capture:
- Awkward first attempts
- Genuine reactions when seeing others' work
- Real conversations between strangers
- Funny fails or unexpected moments
- Nervous beginners warming up
- Inside jokes or community banter

### Script-Specific Needs
- **Script 1:** [People needed, location setup, what genuine moments to provoke/capture]
- **Script 2:** [People needed, location setup, what genuine moments to provoke/capture]
- **Script 3:** [People needed, location setup, what genuine moments to provoke/capture]

### Retention Editing Guide
Specify exact pattern interrupts for each script to maintain viewer attention:
- When to cut (every 2-3 seconds)
- Where to add: reaction cuts, zoom cuts, text overlays, timer countdowns, split screens, reveal moments
- Music/sound effect cues for energy shifts

### Authenticity Checklist (Pre-Publish Review)
Before posting, verify:
- [ ] Does this feel like a real moment or a staged ad?
- [ ] Are there at least 2 imperfect/raw moments visible?
- [ ] Can you see real human expressions and reactions?
- [ ] Is the hook simple and direct (not poetic)?
- [ ] Is the CTA engagement-driving (not generic "join us")?
- [ ] Would someone share this with a friend? Why?

### Common Filming Mistakes to Avoid
- [Mistake 1 — related to over-production]
- [Mistake 2 — related to missing authentic moments]
- [Mistake 3 — related to retention/editing]`;
  }
  return "";
};

/* ─── AGENT META ──────────────────────────────────────────────────── */
const AGENT_META = [
  { id: 1, name: "Content Scout",     desc: "Authentic content ideas ranked by shareability", icon: Search },
  { id: 2, name: "Validation Engine", desc: "Scoring authenticity, shareability & growth",     icon: BrainCircuit },
  { id: 3, name: "Script Writer",     desc: "3 raw, documentary-style scripts",              icon: PenTool },
  { id: 4, name: "Hook & CTA Gen",    desc: "Simple hooks + engagement CTAs",                icon: MessageSquare },
  { id: 5, name: "Production Dir.",   desc: "Raw-first filming & retention guide",           icon: Video },
];

const AGENT_3D_LABELS = {
  1: { name: "Scanning Trends", desc: "Finding authentic, shareable content patterns..." },
  2: { name: "Validating Ideas", desc: "Scoring by authenticity, shareability & growth..." },
  3: { name: "Writing Scripts", desc: "Drafting raw, documentary-style scripts with real moments..." },
  4: { name: "Generating Hooks", desc: "Crafting simple, direct hooks that grab in 1 second..." },
  5: { name: "Planning Production", desc: "Building raw-first filming guide with retention edits..." },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runAgent({ agentId, niche, location, skillLevel, eventFocus, outputs, onRetry }) {
  const prompt = buildPrompt(agentId, niche, location, skillLevel, eventFocus, outputs);
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
  const [skillLevel, setSkillLevel] = useState("Mixed");
  const [eventFocus, setEventFocus] = useState("General Sketching");
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const outputsRef = useRef([]);
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
        const text = await runAgent({ agentId, niche, location, skillLevel, eventFocus, outputs: outputsRef.current, onRetry: (n) => setAgent(agentId, { retry: n }) });
        outputsRef.current[i] = text;
        setAgent(agentId, { status: "done", output: text, expanded: true });
      } catch (err) {
        outputsRef.current[i] = "";
        setAgent(agentId, { status: "error", error: err.message || "Unknown error" });
      }
    }
    setRunning(false); setAllDone(true);

    // Save to history
    const newItem = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      niche, location, skillLevel, eventFocus,
      outputs: [...outputsRef.current]
    };
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 50); // keep last 50
      localStorage.setItem("usk_history", JSON.stringify(updated));
      return updated;
    });
  }, [running, niche, location, skillLevel, eventFocus]);

  const loadHistoryItem = (item) => {
    setNiche(item.niche); setLocation(item.location || "");
    setSkillLevel(item.skillLevel || "Mixed"); setEventFocus(item.eventFocus || "General Sketching");
    outputsRef.current = [...item.outputs];
    setAgents(AGENT_META.map((a, i) => ({ ...a, status: "done", output: item.outputs[i] || "", error: "", retry: 0, expanded: false })));
    setAllDone(true); setIsHistoryOpen(false);
  };

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
      {/* Auth Header */}
      {!authLoading && (
        <div className={styles.authHeader}>
          {user ? (
            <>
              <span className={styles.userEmail}>{user.email}</span>
              <button className={styles.authBtn} onClick={async (e) => {
                e.preventDefault();
                try {
                  console.log("Signing out...");
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
