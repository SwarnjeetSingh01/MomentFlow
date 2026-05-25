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

═══════════════════════════════════════════════════════════
GLOBAL MASTER RULES (APPLY TO EVERYTHING YOU GENERATE)
═══════════════════════════════════════════════════════════

CORE SYSTEM SHIFT:
We are NOT creating beautiful content. We are creating RELATABLE SOCIAL INTERACTIONS people want to SHARE.
The goal is NOT to make viewers admire the content.
The goal is to make viewers: comment, share, tag friends, relate emotionally, imagine themselves participating.

SOCIAL-FIRST THINKING:
Think like an Instagram/TikTok-native creator, NOT a creative agency strategist.
Prioritize: comment bait, shareability, recognizable situations, identity-based humor, awkwardness, chaotic energy, replay value, human reactions, relatable failures.
Avoid: over-produced storytelling, cinematic motivational energy, artificial emotional depth, scripted inspirational moments.

AUTHENTICITY RULE:
Content should feel like: real people being filmed naturally, spontaneous interactions, authentic community moments.
NOT: a commercial, a brand campaign, a short film.

REAL HUMAN BEHAVIOR:
People should: interrupt themselves, laugh awkwardly, make mistakes, hesitate, react naturally, speak imperfectly.
Avoid: polished dialogue, motivational speech patterns, unrealistic emotional scripting.

SHAREABILITY PRIORITY:
Prioritize content people would: send to friends, tag others in, relate to instantly, comment on emotionally.
High-shareability = humor + identity + comparison + chaos + surprise + awkwardness + relatable failures.

CONTENT MIX: 40% Relatable/Fun | 30% Community/Emotional | 20% Artistic/Cinematic | 10% Educational.

HUMAN PERSONALITY: Build familiarity through recurring members, recognizable faces, inside jokes, community energy.

RECURRING COMMUNITY PERSONALITIES:
- The shy beginner — nervous but improving
- The funny uncle — always has commentary
- The engineer — surprisingly good or hilariously bad
- The perfectionist sketcher — takes forever, amazing result
- The fast sketcher — messy but confident
- The chaotic artist — unpredictable, entertaining
Viewers should begin recognizing these people from previous reels.

RECURRING VIRAL FORMATS:
- Same place different eyes
- Engineer vs Designer
- Guess who drew this
- Expectations vs reality
Avoid repeating recent formats unless: the twist is fresh, the personality changes, the humor changes, the interaction style changes.

FINAL PHILOSOPHY:
People share: PEOPLE, PERSONALITY, RELATABILITY, CHAOS, HUMAN MOMENTS — NOT production quality alone.
The audience should feel: "these people are real", "this looks fun", "I could join this", "this reminds me of my friends."
`;

const buildPrompt = (agentId, niche, location, skillLevel, eventFocus, outputs) => {
  const loc = location ? location.trim() : "";
  const locNote = loc ? `LOCATION CONTEXT: The chosen location is "${loc}". You must infer the atmosphere, visual traits, and cultural vibe of this specific place. Tailor all your ideas, script concepts, and shot lists directly to the unique characteristics of this location.` : "";
  const context = CREATOR_CONTEXT(skillLevel, eventFocus);

  if (agentId === 1) {
    const locSearch = loc ? `Since the location is "${loc}", suggest content angles that leverage the unique human interactions, cultural quirks, and spontaneous moments possible at this place — NOT just its visual beauty.` : "";
    return `You are Agent 01 — Content Scout for @usknagpur (Urban Sketchers Nagpur).
${context}
${locNote}

You are an Instagram/TikTok-native content strategist. You think like an internet culture observer, NOT a creative agency. Your job is to find SPECIFIC content ideas that people will SHARE, COMMENT on, and TAG their friends in.

CRITICAL RULES:
- Think like a creator scrolling Instagram, NOT a brand strategist in a meeting room.
- Every idea must pass the "would I send this to a friend?" test.
- Prioritize: comment bait, shareability, recognizable situations, identity-based humor, awkwardness, chaotic energy, replay value.
- NEVER suggest ideas that feel like: advertisements, brand campaigns, cinematic short films, or motivational content.

SIMPLICITY FILTER:
Every content idea must be instantly understandable. If someone cannot understand the reel concept in 1 second / one sentence — the idea is too complicated. Kill it.

CONTENT FATIGUE PREVENTION (CRITICAL):
Avoid generating the same emotional format repeatedly.
LIMIT these to MAXIMUM 1 idea each:
- "stranger challenge"
- "beginner transformation"
- "heartwarming reveal"
- "emotional growth story"
INSTEAD, prioritize: humor, chaos, awkwardness, comparison, identity, personality clashes, relatable failures, funny observations, public interactions.

INTERNET CULTURE AWARENESS:
Focus on: meme behavior, reel psychology, comment potential, replayability, "tag your friend" energy, highly recognizable situations.
Think: what would blow up on Instagram Explore, NOT what would win a film festival.

CONTENT MIX (MANDATORY):
- 40% RELATABLE / FUN: sketch fails, funny public reactions, chaotic moments, "guess who drew this", artist struggles, expectations vs reality, personality clashes
- 30% COMMUNITY / EMOTIONAL: beginner stories, first meetup experiences, community moments (but keep these RAW, not cinematic)
- 20% ARTISTIC / CINEMATIC: timelapses, sketch reveals, location aesthetics
- 10% EDUCATIONAL: beginner tips, supplies, how to start sketching
${locSearch}

Be specific — reference real creator styles, actual content formats, and concrete title patterns.

Produce a Markdown table (rank by shareability + comment potential, best first):
| # | Content Idea | Category | Platform | Format | Hook (Max 12 words, casual) | Why People Share/Comment | 1-Second Concept |

Format: Reel | YouTube Short | Carousel | Story Series

HIGH-SHAREABILITY IDEAS (PRIORITY SECTION):
List 5 specific content ideas designed purely for maximum shares + comments. Examples of the ENERGY to match:
- "Engineer vs Designer sketch styles"
- "What different professions notice first"
- "Sketch expectations vs reality"
- "Beginner confidence fails"
- "Public reactions to sketchbooks"
- "Guess who drew this"
- "Most chaotic sketch moment"
- "Fast sketch comparisons"
- "Funny artist struggles"

CONTENT PILLARS — VARIETY CHECK:
Confirm ideas cover ALL 5 pillars:
A. Public Interaction (strangers, challenges, reactions)
B. Community Stories (spotlights, professions, first meetups)
C. Fun/Relatable (fails, struggles, chaos, humor, comparisons)
D. Artistic/Cinematic (timelapses, reveals, aesthetics)
E. Educational (tips, materials, tutorials)

FOLLOWER GROWTH TACTICS:
List 3 specific tactics to convert viewers into followers. Be concrete — no generic advice.

NON-FOLLOWER REACH ANALYSIS:
The #1 format pulling non-follower reach, why it works algorithmically, and step-by-step optimization guide.`;
  }
  if (agentId === 2) {
    return `You are Agent 02 — Validation Engine for @usknagpur. You think like an Instagram algorithm + internet culture expert, NOT a brand strategist.
${context}
${locNote}

RESEARCH DATA FROM AGENT 01:
${outputs[0] || ""}

CRITICAL RULES:
- Score by SHAREABILITY and INTERNET BEHAVIOR first, reach second.
- Penalize anything that feels: over-produced, cinematic, advertisement-like, or emotionally forced.
- Reward: humor, chaos, awkwardness, comparison, identity, comment bait, tag energy, debate potential.
- Ensure the final recommendation is something people would SEND TO A FRIEND.

SECTION 1 — SCORING
Score each content idea (1-10 each):
| # | Content Idea | Shareability | Viral Simplicity | Comment Potential | Authenticity | Retention | TOTAL |

Scoring criteria:
- Shareability: Would someone send this to a friend?
- Viral Simplicity: Can you understand the concept in 1 second? If it needs explanation, score LOW.
- Comment Potential: Does this naturally create comments, tags, debates, identity reactions?
- Authenticity: Does it feel like real people, not a commercial?
- Retention: Will viewers watch till the end AND replay?

SECTION 2 — CONTENT FATIGUE CHECK
Penalize ideas that feel repetitive. If multiple concepts rely on:
- strangers sketching (max 1)
- emotional beginner transformation (max 1)
- cinematic reveals (max 1)
- heartwarming storytelling (max 1)
reduce their scores unless the angle is SIGNIFICANTLY fresh.
Flag which ideas feel repetitive and suggest fresher alternatives.

SECTION 3 — INTERNET BEHAVIOR CHECK
For each top idea, answer:
- What comment will people leave?
- Who will they tag?
- Will this create debate or comparison?
- Is there "identity reaction" ("this is SO me" / "this is my friend")?
Reward ideas that score high here. Example: "What would YOUR profession sketch first?" > "A cinematic sketching montage."

SECTION 4 — COMMUNITY MEMORY CHECK
Does this idea build recurring:
- personalities people recognize?
- formats people expect and look forward to?
- inside jokes that reward loyal viewers?
Communities grow through familiarity, not one-off viral hits.

SECTION 5 — CONTENT PILLAR MAPPING
Map all ideas into 5 pillars and flag gaps:
A. Public Interaction (strangers, challenges, reactions)
B. Community Stories (spotlights, professions, first meetups)
C. Fun/Relatable (fails, struggles, chaos, humor, comparisons)
D. Artistic/Cinematic (timelapses, reveals, aesthetics)
E. Educational (tips, materials, tutorials)
⚠ Flag any pillar with zero ideas.

SECTION 6 — RECOMMENDED TOPIC
Select the #1 RECOMMENDED TOPIC. It MUST:
- Score highest on Shareability + Viral Simplicity + Comment Potential
- Feel authentically raw, NOT produced
- Be instantly understandable in 1 sentence
- NOT be another "beginner transformation" or "strangers sketching" story (unless the twist is genuinely fresh)

Provide:
- Topic Name
- 1-Sentence Concept (the "elevator pitch" — if you can't say it simply, it's too complex)
- Content Pillar
- Why People Will Share It
- Expected Comment Types
- Recurring Personality to Feature
- Estimated Reach Potential`;
  }
  if (agentId === 3) {
    const locGround = loc ? `LOCATION: "${loc}" — describe real interactions that would happen HERE. What's the vibe? What awkward/funny/surprising things could happen at this specific place?` : "";
    return `You are Agent 03 — Script Writer for @usknagpur (Urban Sketchers Nagpur).
${context}
${locNote}

VALIDATION DATA FROM AGENT 02:
${outputs[1] || ""}

TASK: Generate 3 DISTINCT short-form reel concepts based on the RECOMMENDED TOPIC.

═══════════════════════════════════════════════════
CRITICAL: DO NOT USE BEAT-SHEET / SCREENPLAY FORMAT
═══════════════════════════════════════════════════
DO NOT write: "Beat 1", "Beat 2", "Beat 3" — this creates over-structured, cinematic, commercial energy.

INSTEAD USE: MOMENT FLOW FORMAT
Describe the reel like footage ALREADY CAPTURED — real moments unfolding naturally, casual social media clips.
Write like a creator describing what they filmed, NOT a director planning scenes.

DIALOGUE RULES:
- Dialogue should be: messy, interrupted, casual, human.
- People should: laugh awkwardly, hesitate, say simple things, react naturally.
- NEVER write: polished motivational dialogue, cinematic emotional narration, inspirational speeches.
- If any line sounds like it could be in a Nike ad — DELETE IT.

RETENTION RULES:
- The reel should feel: fast, reactive, internet-native. NOT slow cinematic storytelling.
- Include: reaction moments, awkward pauses, funny interruptions, zoom moments, quick comparisons, unexpected reactions.
- Pattern interrupts every 2-3 seconds.

RAWNESS RULES:
- Do NOT optimize every moment for beauty.
- Include: unfinished sketches, awkward camera movement, messy tables, funny mistakes, imperfect reactions.
- Imperfection builds authenticity. Shaky cam during excitement = GOOD.

SCRIPT VARIETY (each script = DIFFERENT content pillar):
- Script 1: Relatable/Fun (fails, chaos, comparisons, humor)
- Script 2: Community/Human (real person, genuine interaction, personality)
- Script 3: Choose from remaining (Public Interaction, Educational, or Artistic)

${locGround}

For EACH of the 3 scripts, output this MOMENT FLOW format:
### Script [1/2/3]: [Simple, Direct Title — like an Instagram caption]
- **Category:** [Fun/Community/Art/Edu/Public Interaction]
- **1-Second Concept:** [One sentence explaining the whole reel — if this is complicated, simplify]
- **Featured Person:** [Recurring personality — the uncle/engineer/shy beginner/perfectionist/chaotic artist]
- **Vibe:** [e.g. Chaotic-fun, Awkward-wholesome, Casually-educational — NOT "cinematic" or "inspiring"]

**Moment Flow:**
[Describe the reel as if narrating footage you already captured. Use present tense. Include the messy, awkward, real moments. Describe what people SAY (imperfectly), how they REACT (naturally), what goes WRONG (hilariously). Write 6-8 moments flowing naturally, each 2-4 seconds. Mark where reaction cuts, zoom cuts, text pops, and comparison frames should go.]

- **Opening Hook:** [Max 10 words, casual — like texting a friend about what just happened]
- **CTA:** [Engagement-driving question that creates comments/tags/debates — NOT "join us"]
- **Why People Share This:** [Specific reason — humor? identity? relatability? comparison?]
- **Expected Comments:** [List 3 types of comments this would generate]`;
  }
  if (agentId === 4) {
    const locHooks = loc ? `LOCATION: If it fits naturally, 1 hook can reference "${loc}" — but only if it sounds like something a real person would say, not a tourism ad.` : "";
    return `You are Agent 04 — Hook & CTA Generator for @usknagpur (Urban Sketchers Nagpur).
${context}
${locNote}

SCRIPTS FROM AGENT 03:
${outputs[2] || ""}
${locHooks}

TASK: For EACH of the 3 scripts, generate exactly 3 hooks + 3 engagement CTAs.

═══════════════════════════════════════════════════
HOOK RULES
═══════════════════════════════════════════════════

Hook style should feel like: Instagram captions, TikTok opening lines, real creator speech.
NOT like: campaign taglines, movie trailers, cinematic poetry.

Every hook must:
- Be instantly understandable
- Feel conversational — like texting a friend about something wild that just happened
- Create immediate curiosity
- Maximum 12 words
- Grab attention in 1 SECOND

Never start with: "I", "Are you", "Do you", "Hey", "What if", "Imagine"

BANNED PATTERNS (never generate hooks like these):
❌ "Five strangers, one sunset, different perspectives…"
❌ "What happens when creativity meets chaos…"
❌ "In a city where art lives on every corner…"
❌ "When [poetic setup] meets [dramatic payoff]…"
❌ Any hook that sounds like a movie trailer or ad campaign

GOOD HOOK ENERGY (match this vibe):
✅ "This uncle has never drawn before"
✅ "We stopped random people at Futala"
✅ "Everyone drew the same thing differently"
✅ "This engineer sketches VERY differently"
✅ "She thought she couldn't draw…"
✅ "Nobody expected THIS sketch"
✅ "His first drawing in 30 years"
✅ "The perfectionist vs the chaotic artist"
✅ "We gave strangers 5 minutes to sketch"

HOOK CATEGORY ROTATION (use DIFFERENT categories for each hook — no repeats):
- Shock: unexpected result or skill
- Humor: funny situation or reaction
- Identity: profession/personality-based
- Comparison: A vs B format
- Curiosity: what happens next?
- Chaos: unpredictable situation
- Unexpected Skill: someone surprises everyone
- Relatable Failure: common struggle
- Fast Confession: quick personal admission
- Public Reaction: strangers' responses

═══════════════════════════════════════════════════
CTA RULES
═══════════════════════════════════════════════════

BANNED CTAs:
❌ "Join us Sundays"
❌ "Come sketch with us"
❌ "Follow for more"
❌ Any CTA that sounds like a brand invitation

CTAs must trigger: comments, shares, tags, participation, identity reactions, debates.

GOOD CTA ENERGY:
✅ "Which one would YOU draw?"
✅ "Tag someone who sketches like this"
✅ "Which sketch wins honestly?"
✅ "Would your friends survive this challenge?"
✅ "What would YOU notice first?"
✅ "Rate these sketches 1-10"
✅ "POV: your friend drags you to this"
✅ "Which profession sketches best?"

### Script 1: [Title]
**Hooks (each DIFFERENT category):**
1. **[Category]:** "[Hook — max 12 words]"
2. **[Category]:** "[Hook — max 12 words]"
3. **[Category]:** "[Hook — max 12 words]"
**CTAs (each triggers DIFFERENT action):**
1. "[Comment trigger]" — expected response type: [what people will comment]
2. "[Share/tag trigger]" — expected action: [who they'll tag and why]
3. "[Debate/opinion trigger]" — expected reaction: [what debate this creates]

### Script 2: [Title]
**Hooks (each DIFFERENT category):**
1. **[Category]:** "[Hook — max 12 words]"
2. **[Category]:** "[Hook — max 12 words]"
3. **[Category]:** "[Hook — max 12 words]"
**CTAs (each triggers DIFFERENT action):**
1. "[Comment trigger]"
2. "[Share/tag trigger]"
3. "[Debate/opinion trigger]"

### Script 3: [Title]
**Hooks (each DIFFERENT category):**
1. **[Category]:** "[Hook — max 12 words]"
2. **[Category]:** "[Hook — max 12 words]"
3. **[Category]:** "[Hook — max 12 words]"
**CTAs (each triggers DIFFERENT action):**
1. "[Comment trigger]"
2. "[Share/tag trigger]"
3. "[Debate/opinion trigger]"`;
  }
  if (agentId === 5) {
    return `You are Agent 05 — Production Director for @usknagpur (Urban Sketchers Nagpur).
${context}

SCRIPTS FROM AGENT 03:
${outputs[2] || ""}

TASK: Social-first filming & content extraction guide. You are a documentary-style director who thinks like a social media creator, NOT a cinematographer.

═══════════════════════════════════════════════════
SOCIAL-FIRST FILMING PHILOSOPHY
═══════════════════════════════════════════════════
- Film for REACTIONS, EXPRESSIONS, AWKWARDNESS, CONVERSATIONS, COMPARISON MOMENTS — not just beautiful sketch shots.
- Capture the PERSON, not just the art. Faces > sketches. Expressions > aesthetics.
- Imperfection is a FEATURE: shaky cam during excitement = good. Overly smooth gimbal = feels fake.
- Raw footage of people laughing, confused, failing, reacting is often MORE VALUABLE than cinematic footage.

### Content Extraction Plan (From ONE Meetup)
From a single meetup session, generate content for:
- **5 Reel Ideas** — [brief concept for each]
- **3 Story Sequences** — [what to post as Instagram stories]
- **2 Carousel Concepts** — [before/after, comparison, or educational]
- **1 Community Post** — [text post that builds connection]
- **1 Funny Behind-the-Scenes Clip** — [the chaos, the mistakes, the real stuff]
- **1 Human Moment Clip** — [genuine interaction worth sharing]
- **1 Highly Shareable Clip** — [designed for maximum forwards]
- **1 Emotional Community Clip** — [authentic, not forced]

### Community Personality Capture Plan
Actively capture these recurring personalities (or find people who match):
- **The funny member** — always has commentary, capture their reactions to others' work
- **The shy beginner** — nervousness, first attempts, gradual warming up
- **The perfectionist** — taking forever, close-ups of detail work, others waiting
- **The engineer** — methodical approach, surprising results
- **The uncle** — unexpected skill or hilarious attempts
- **The chaotic sketcher** — fast, messy, entertaining process
Film each person for at least 30 seconds of raw footage — their reactions, conversations, and process.

### Raw Footage Priority List
Capture these BEFORE anything else (they disappear fast):
1. Shaky excitement moments when something unexpected happens
2. Messy tables and scattered art supplies
3. Unfinished work and in-progress sketches
4. People laughing at their own attempts
5. Confusion when given a challenge
6. Real conversations between strangers meeting for the first time
7. Accidental funny moments
8. The moment someone sees their neighbor's sketch for the first time

### Script-Specific Filming Needs
- **Script 1:** [People to capture, what spontaneous moments to watch for, what reactions to provoke naturally]
- **Script 2:** [People to capture, what spontaneous moments to watch for, what reactions to provoke naturally]
- **Script 3:** [People to capture, what spontaneous moments to watch for, what reactions to provoke naturally]

### Retention-First Editing Guide
Retention matters more than beauty. Every 2-3 seconds include ONE of:
- Reaction cut (someone's face reacting)
- Text pop (context or humor)
- Zoom cut (sudden focus shift)
- Comparison frame (side-by-side)
- Reveal moment (sketch flip or result)
- Humor beat (funny moment or caption)
- Interruption (someone says something unexpected)

For each script, specify the exact edit points:
- **Script 1 edits:** [Second-by-second retention plan]
- **Script 2 edits:** [Second-by-second retention plan]
- **Script 3 edits:** [Second-by-second retention plan]

### Authenticity Checklist (Pre-Publish)
Before posting, verify:
- [ ] Does this feel like real life or a staged ad?
- [ ] Are there at least 2-3 imperfect/raw/messy moments?
- [ ] Can you see real human expressions and natural reactions?
- [ ] Is the hook simple and direct (sounds like a friend telling you something)?
- [ ] Is the CTA engagement-driving (creates comments, NOT "join us")?
- [ ] Would someone share this with a specific friend? Which friend and why?
- [ ] Does this feature a recognizable community personality?
- [ ] Is there replay value (something you'd watch twice)?

### Common Mistakes to Avoid
- ❌ Spending all time on cinematic B-roll while missing authentic reactions
- ❌ Staging moments instead of capturing natural interactions
- ❌ Over-editing with smooth transitions when raw cuts feel more authentic
- ❌ Focusing on the sketch instead of the person sketching
- ❌ Using motivational background music instead of natural audio + trending sounds`;
  }
  return "";
};

/* ─── AGENT META ──────────────────────────────────────────────────── */
const AGENT_META = [
  { id: 1, name: "Content Scout",     desc: "Social-first ideas ranked by shareability",     icon: Search },
  { id: 2, name: "Validation Engine", desc: "Viral simplicity + internet behavior scoring",   icon: BrainCircuit },
  { id: 3, name: "Script Writer",     desc: "Moment Flow scripts — raw, not cinematic",      icon: PenTool },
  { id: 4, name: "Hook & CTA Gen",    desc: "Rotating hooks + comment-driving CTAs",         icon: MessageSquare },
  { id: 5, name: "Production Dir.",   desc: "Content extraction + personality capture",      icon: Video },
];

const AGENT_3D_LABELS = {
  1: { name: "Scanning Culture", desc: "Finding shareable, internet-native content patterns..." },
  2: { name: "Validating Ideas", desc: "Scoring viral simplicity, comment potential & shareability..." },
  3: { name: "Writing Moments", desc: "Drafting Moment Flow scripts with real human chaos..." },
  4: { name: "Generating Hooks", desc: "Rotating hook categories — shock, humor, identity, chaos..." },
  5: { name: "Planning Capture", desc: "Building content extraction plan + personality guide..." },
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
