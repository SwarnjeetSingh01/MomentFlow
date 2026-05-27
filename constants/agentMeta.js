import { Search, BrainCircuit, PenTool, MessageSquare, Video } from "lucide-react";

/* ─── ICON MAP ────────────────────────────────────────────────────── */
export const AGENT_ICONS = { 1: Search, 2: BrainCircuit, 3: PenTool, 4: MessageSquare, 5: Video };

/* ─── AGENT META ──────────────────────────────────────────────────── */
export const AGENT_META = [
  { id: 1, name: "Content Scout",     desc: "Social-first ideas ranked by shareability",     icon: Search },
  { id: 2, name: "Validation Engine", desc: "Viral simplicity + internet behavior scoring",   icon: BrainCircuit },
  { id: 3, name: "Script Writer",     desc: "Moment Flow scripts — raw, not cinematic",      icon: PenTool },
  { id: 4, name: "Hook & CTA Gen",    desc: "Rotating hooks + comment-driving CTAs",         icon: MessageSquare },
  { id: 5, name: "Production Dir.",   desc: "Content extraction + personality capture",      icon: Video },
];

export const AGENT_3D_LABELS = {
  1: { name: "Scanning Culture", desc: "Finding shareable, internet-native content patterns..." },
  2: { name: "Validating Ideas", desc: "Scoring viral simplicity, comment potential & shareability..." },
  3: { name: "Writing Moments", desc: "Drafting Moment Flow scripts with real human chaos..." },
  4: { name: "Generating Hooks", desc: "Rotating hook categories — shock, humor, identity, chaos..." },
  5: { name: "Planning Capture", desc: "Building content extraction plan + personality guide..." },
};
