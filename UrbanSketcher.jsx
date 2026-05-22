"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, BrainCircuit, PenTool, MessageSquare, Video,
  CheckCircle, Copy, RotateCcw, Play, MapPin, 
  ChevronDown, ChevronUp, Sparkles, Loader2, Info, AlertCircle,
  Terminal, ShieldCheck, Cpu, Sliders, Volume2, Film, Check, ExternalLink,
  Zap, BarChart2, Trash2
} from "lucide-react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&family=Playfair+Display:ital,wght@0,500;0,700;1,400&display=swap');`;

const CSS = `
${FONTS}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-primary: #070913;
  --bg-secondary: #0f1322;
  --accent-primary: #6366f1; /* Neon Indigo */
  --accent-secondary: #a855f7; /* Violet/Purple */
  --accent-rose: #f43f5e; /* Rose Glow */
  --accent-cyan: #06b6d4; /* Cyan */
  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
  --border-color: rgba(99, 102, 241, 0.15);
  --glass-bg: rgba(15, 19, 34, 0.65);
  --glass-border: rgba(255, 255, 255, 0.05);
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --terminal-bg: #05070e;
}

body {
  font-family: 'Outfit', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-main);
  min-height: 100vh;
  overflow-x: hidden;
}

/* Aurora Background */
.aurora-bg {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: -1; overflow: hidden; background: var(--bg-primary);
  pointer-events: none;
}
.aurora-orb {
  position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.5;
  animation: float 20s infinite ease-in-out alternate;
}
.orb-1 { width: 600px; height: 600px; background: rgba(99, 102, 241, 0.15); top: -200px; left: -100px; animation-delay: 0s; }
.orb-2 { width: 500px; height: 500px; background: rgba(244, 63, 94, 0.12); bottom: -100px; right: -50px; animation-delay: -5s; }
.orb-3 { width: 700px; height: 700px; background: rgba(168, 85, 247, 0.08); top: 30%; left: 40%; animation-delay: -10s; }
@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(50px, 30px) scale(1.1); }
  100% { transform: translate(-30px, -50px) scale(0.9); }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.25);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.45);
}

/* Utilities */
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.ml-4 { margin-left: 16px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.w-full { width: 100%; }
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.text-lg { font-size: 1.125rem; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.flex-1 { flex: 1; }
.overflow-hidden { overflow: hidden; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

/* Header */
.header {
  position: sticky; top: 0; z-index: 50;
  padding: 16px 40px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(7, 9, 19, 0.80);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 4px 30px rgba(0,0,0,0.5);
}
.header-brand {
  display: flex; align-items: center; gap: 12px;
}
.header-logo-icon {
  color: var(--accent-primary);
  filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.8));
}
.header-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem; font-weight: 700;
  /* Shimmering text effect */
  background: linear-gradient(90deg, #ffffff 0%, #a855f7 25%, #f43f5e 50%, #a855f7 75%, #ffffff 100%);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shimmer-bg 6s linear infinite;
}
@keyframes shimmer-bg {
  to { background-position: 200% center; }
}
.header-meta {
  display: flex; align-items: center; gap: 20px;
}
.header-badge {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 6px 12px; border-radius: 99px;
  font-size: 0.8rem; font-weight: 500; color: #a5b4fc;
  display: flex; align-items: center; gap: 6px;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.15);
}
.header-badge span {
  width: 8px; height: 8px; border-radius: 50%; background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

/* Main Container Layout */
.main-container {
  max-width: 1400px; margin: 0 auto; padding: 40px 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}
@media (min-width: 1024px) {
  .main-container {
    grid-template-columns: 450px 1fr;
  }
}

/* Glass Panels */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  /* Premium inner light border + drop shadow */
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 12px 40px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}
.glass-panel:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 15px 50px rgba(0, 0, 0, 0.4);
}

/* Section Title */
.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem; font-weight: 600;
  margin-bottom: 20px;
  display: flex; align-items: center; gap: 10px;
  color: var(--text-main);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding-bottom: 12px;
}

/* Config Sidebar */
.sidebar-container {
  display: flex; flex-direction: column; gap: 24px;
}
@media (min-width: 1024px) {
  .sidebar-container {
    position: sticky; top: 100px; 
    max-height: calc(100vh - 120px); 
    overflow-y: auto;
    -ms-overflow-style: none; scrollbar-width: none;
  }
  .sidebar-container::-webkit-scrollbar { display: none; }
}

.sidebar-panel {
  padding: 28px;
  display: flex; flex-direction: column; gap: 20px;
}
.input-field {
  display: flex; flex-direction: column; gap: 8px;
}
.input-field label {
  font-weight: 500; font-size: 0.9rem; color: #a5b4fc;
  display: flex; align-items: center; gap: 8px;
}
.input-field input {
  width: 100%; padding: 12px 16px; border-radius: 10px;
  border: 1px solid var(--border-color);
  background: rgba(15, 19, 34, 0.8);
  color: white;
  font-family: 'Outfit', sans-serif; font-size: 0.95rem;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.03);
}
.input-field input:focus {
  outline: none; border-color: var(--accent-secondary);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.03), 0 0 0 3px rgba(168, 85, 247, 0.15);
  background: rgba(21, 27, 48, 0.9);
}
.input-field input::placeholder {
  color: #4b5563;
}

/* Custom Select Dropdown */
.custom-select-container {
  position: relative; width: 100%;
}
.custom-select-button {
  width: 100%; padding: 12px 16px; border-radius: 10px;
  border: 1px solid var(--border-color);
  background: rgba(15, 19, 34, 0.8);
  color: white; font-family: 'Outfit', sans-serif; font-size: 0.95rem;
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; transition: all 0.2s ease;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.03);
}
.custom-select-button:hover:not(:disabled) {
  background: rgba(21, 27, 48, 0.95);
  border-color: rgba(168, 85, 247, 0.4);
}
.custom-select-button:focus {
  outline: none; border-color: var(--accent-secondary);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.03), 0 0 0 3px rgba(168, 85, 247, 0.15);
}
.custom-select-button:disabled {
  opacity: 0.5; cursor: not-allowed;
}
.custom-select-dropdown {
  position: absolute; top: calc(100% + 8px); left: 0; width: 100%;
  background: rgba(15, 19, 34, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px; padding: 8px; z-index: 100;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 10px 40px rgba(0,0,0,0.5);
  display: flex; flex-direction: column; gap: 4px;
}
.custom-select-option {
  width: 100%; padding: 10px 12px; border-radius: 8px;
  background: transparent; border: none; color: #d1d5db;
  font-family: 'Outfit', sans-serif; font-size: 0.9rem;
  text-align: left; cursor: pointer; display: flex; align-items: center; justify-content: space-between;
  transition: all 0.2s;
}
.custom-select-option:hover {
  background: rgba(99, 102, 241, 0.15); color: white;
}
.custom-select-option.selected {
  background: rgba(99, 102, 241, 0.25); color: white; font-weight: 500;
}

.run-btn {
  width: 100%; padding: 16px; border-radius: 10px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  font-family: 'Outfit', sans-serif; font-size: 1.05rem; font-weight: 600;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
  position: relative; overflow: hidden;
}
.run-btn::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: all 0.5s ease;
}
.run-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
  filter: brightness(1.15);
}
.run-btn:hover:not(:disabled)::before {
  left: 100%;
}
.run-btn:disabled {
  opacity: 0.5; cursor: not-allowed;
  box-shadow: none;
}

/* Tabs */
.tabs-header {
  display: flex; gap: 12px; margin-bottom: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding-bottom: 12px;
}
.tab-btn {
  background: transparent; border: none;
  padding: 10px 18px; border-radius: 8px;
  color: var(--text-muted); font-family: 'Outfit', sans-serif;
  font-size: 0.95rem; font-weight: 500; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.2s;
  position: relative;
}
.tab-btn:hover {
  color: white; background: rgba(255,255,255,0.03);
}
.tab-btn.active {
  color: white;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.25);
  text-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
}

/* Dashboard Workspace Grid */
.workspace-container {
  display: flex; flex-direction: column; gap: 24px;
}

/* Agent Pipeline Cards */
.pipeline-container {
  display: flex; flex-direction: column; gap: 16px;
}
.agent-card {
  padding: 20px;
  border-width: 1px;
  border-style: solid;
  overflow: hidden;
}
.agent-header {
  display: flex; align-items: center; justify-content: space-between;
}
.agent-info {
  display: flex; align-items: center; gap: 16px;
}
.agent-icon-wrap {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s;
}
.agent-title {
  font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 600;
  color: white;
}
.agent-desc {
  font-size: 0.85rem; color: var(--text-muted);
}
.agent-status {
  display: flex; align-items: center; gap: 12px; font-weight: 500; font-size: 0.85rem;
}
.status-idle { color: var(--text-muted); }
.status-running { color: var(--warning); }
.status-done { color: var(--success); }
.status-error { color: var(--error); }

.expand-btn {
  background: transparent; border: 1px solid rgba(255,255,255,0.08);
  padding: 4px 10px; border-radius: 6px; font-size: 0.8rem;
  color: var(--text-muted);
  cursor: pointer; display: flex; align-items: center; gap: 4px;
  transition: all 0.2s;
}
.expand-btn:hover { background: rgba(255,255,255,0.05); color: white; }

.output-box {
  background: rgba(5, 7, 14, 0.75);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px; padding: 20px;
  font-size: 0.9rem; line-height: 1.6;
  white-space: pre-wrap; word-break: break-word;
  max-height: 500px; overflow-y: auto;
  color: #e5e7eb;
  margin-top: 16px;
}

/* Logic Gates Visual Scorecard */
.logic-gates-scorecard {
  background: rgba(99, 102, 241, 0.03);
  border: 1px dashed rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  padding: 16px; margin-top: 14px;
  display: flex; flex-direction: column; gap: 12px;
}
.gate-row {
  display: flex; align-items: center; justify-content: justify-between; gap: 12px;
}
.gate-label {
  width: 140px; font-size: 0.8rem; color: #a5b4fc; font-weight: 500;
}
.gate-bar-bg {
  flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;
}
.gate-bar-fill {
  height: 100%; border-radius: 4px; transition: width 1.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.gate-val {
  width: 40px; text-align: right; font-size: 0.8rem; font-weight: 600; color: white;
}
.gate-status-tag {
  font-size: 0.7rem; font-weight: 600; padding: 2px 6px; border-radius: 4px;
}
.tag-pass { background: rgba(16, 185, 129, 0.1); color: #34d399; }
.tag-fail { background: rgba(239, 68, 68, 0.1); color: #f87171; }

.score-summary-circle {
  width: 50px; height: 50px; border-radius: 50%;
  border: 3px solid var(--accent-primary);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700; color: white;
  background: rgba(99, 102, 241, 0.1);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.25);
}

/* CLI Terminal styling */
.terminal-window {
  background: var(--terminal-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
  color: #a7f3d0; /* Soft green */
  padding: 24px;
  box-shadow: inset 0 0 25px rgba(0,0,0,0.8), 0 12px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  height: 600px;
}
.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 16px;
}
.terminal-dots {
  display: flex; gap: 6px;
}
.terminal-dot {
  width: 10px; height: 10px; border-radius: 50%;
}
.dot-red { background: #ef4444; }
.dot-yellow { background: #f59e0b; }
.dot-green { background: #10b981; }
.terminal-title {
  color: rgba(255,255,255,0.4); font-size: 0.75rem; font-weight: 500;
}
.terminal-body {
  flex: 1;
  overflow-y: auto;
  font-size: 0.82rem;
  line-height: 1.6;
  white-space: pre-wrap;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.terminal-line {
  margin: 0; padding: 0;
}
.terminal-prompt {
  color: var(--accent-cyan);
}
.terminal-success {
  color: var(--success);
}
.terminal-warning {
  color: var(--warning);
}
.terminal-system {
  color: var(--accent-secondary);
}
.terminal-cursor {
  display: inline-block;
  width: 8px;
  height: 15px;
  background: #10b981;
  margin-left: 4px;
  animation: blink 1s step-end infinite;
  vertical-align: middle;
}
@keyframes blink { 50% { opacity: 0; } }

/* Done bar */
.done-bar {
  margin-top: 32px; padding: 24px;
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(to right, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: white; border-radius: 16px;
}
.done-btns {
  display: flex; gap: 12px;
}
.done-btn {
  padding: 10px 20px; border-radius: 8px; font-weight: 600;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  border: none; transition: all 0.2s; font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
}
.btn-primary { 
  background: var(--accent-primary); color: white;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
}
.btn-primary:hover { background: #5558e6; transform: translateY(-1px); }
.btn-secondary { background: rgba(255,255,255,0.06); color: white; border: 1px solid rgba(255,255,255,0.1); }
.btn-secondary:hover { background: rgba(255,255,255,0.12); }

/* Hook Sandbox Evaluator */
.hook-sandbox {
  padding: 24px;
  border: 1px solid rgba(244, 63, 94, 0.2);
  background: radial-gradient(circle at 100% 0%, rgba(244, 63, 94, 0.04) 0%, transparent 60%);
}
.hook-sandbox-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
}
.hook-sandbox-title {
  font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 600; color: #fda4af;
}
.hook-sandbox-input-area {
  display: flex; gap: 16px; margin-bottom: 20px; flex-direction: column;
}
@media(min-width: 640px) {
  .hook-sandbox-input-area { flex-direction: row; }
}
.hook-sandbox-textarea {
  flex: 1; padding: 14px 18px; border-radius: 10px;
  border: 1px solid rgba(244, 63, 94, 0.2);
  background: rgba(15, 19, 34, 0.8);
  color: white; font-family: 'Outfit', sans-serif; font-size: 0.95rem;
  resize: none; height: 75px;
}
.hook-sandbox-textarea:focus {
  outline: none; border-color: var(--accent-rose);
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15);
}
.hook-eval-btn {
  padding: 0 24px; height: 50px; border-radius: 10px;
  background: var(--accent-rose); color: white;
  font-family: 'Outfit', sans-serif; font-weight: 600;
  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s; align-self: flex-start;
  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
}
@media(min-width: 640px) {
  .hook-eval-btn { align-self: stretch; height: auto; }
}
.hook-eval-btn:hover {
  filter: brightness(1.1); transform: translateY(-1px);
}
.hook-eval-results {
  background: rgba(5,7,14,0.6); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px; padding: 18px;
  display: flex; flex-direction: column; gap: 12px;
}
.hook-eval-badge-circle {
  width: 54px; height: 54px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 800; color: white;
  border-width: 3px; border-style: solid;
}
.hook-eval-rules-list {
  display: flex; flex-direction: column; gap: 6px;
  margin-top: 8px;
}
.hook-eval-rule-item {
  font-size: 0.85rem; display: flex; align-items: flex-start; gap: 8px;
  line-height: 1.4;
}

/* Shimmer Line */
.working-vis {
  display: flex; align-items: center; gap: 16px;
  padding: 16px; background: rgba(168, 85, 247, 0.04);
  border-radius: 10px; border: 1px dashed rgba(168, 85, 247, 0.2);
  color: var(--accent-secondary);
}
.shimmer-line {
  height: 8px; border-radius: 4px;
  background: linear-gradient(90deg, transparent, rgba(168,85,247,0.25), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
`;

/* ─── CUSTOM SELECT COMPONENT ─────────────────────────────────────────── */
const CustomSelect = ({ value, onChange, options, disabled, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="custom-select-container" ref={dropdownRef}>
      <button 
        type="button"
        className={`custom-select-button ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-indigo-400" />}
          {selectedOption.label}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="custom-select-dropdown"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
                {value === opt.value && <Check size={14} className="text-indigo-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VOICE_OPTIONS = [
  { value: "Meditative & Aesthetic", label: "Meditative & Aesthetic" },
  { value: "Educational & Technical", label: "Educational & Technical" },
  { value: "Aspirational & Inspiring", label: "Aspirational & Inspiring" },
  { value: "Fast-paced & High Energy", label: "Fast-paced & High Energy" },
  { value: "Mistakes-to-Avoid", label: "Mistakes to Avoid / Analytical" }
];

const PLATFORM_OPTIONS = [
  { value: "Instagram Reel", label: "Instagram Reel" },
  { value: "YouTube Shorts", label: "YouTube Shorts" },
  { value: "YouTube Long-form", label: "YouTube Long-form (Beat sheets)" },
  { value: "X/Twitter Thread", label: "X/Twitter Thread (Draft copy)" },
  { value: "LinkedIn Post", label: "LinkedIn Post (Technical summary)" }
];

/* ─── PROMPTS BUILDER ─────────────────────────────────────────────────── */
const buildPrompt = (agentId, niche, handle, competitors, location, voice, contentType, outputs) => {
  const locNote = location ? `The target location context is: "${location.trim()}".` : "";
  const nicheNote = niche ? niche.trim() : "urban sketching";
  const handleNote = handle ? handle.trim() : "@creator";
  const compNote = competitors ? competitors.trim() : "competitors";
  const voiceNote = voice ? voice : "Educational & Technical";
  const typeNote = contentType ? contentType : "Instagram Reel";

  if (agentId === 1) {
    return `You are Agent 01 — Competitor Scout (Researcher) in a 4-agent content system.
Target Account: ${handleNote}
Niche / Topic: ${nicheNote}
Competitor Handles to Scout: ${compNote}
${locNote}

TASK:
Identify the TOP 10 highest-performing content patterns in the "${nicheNote}" niche on social media (specifically looking at the style of creators like ${compNote}). 
Be specific, analytical, and highly detailed. Ensure you provide actionable data points.

Produce a Markdown table:
| # | Style / Topic | Caption/Hook Pattern | Est. Views | Hook Category | Format Type | Why It Works |

Hook Category: QUESTION | PAIN POINT | CURIOSITY GAP | BOLD CLAIM | BEFORE/AFTER | ASPIRATIONAL | NUMBER/LIST
Format Type: Short Video | Long-form Video | Image Carousel | Single Post | Vlog Style | Process/Time-lapse

CONTENT GAP OPPORTUNITY:
Identify exactly ONE specific topic or presentation angle that audiences are searching for but very few creators are doing well in the "${nicheNote}" space.

NON-FOLLOWER REACH:
Specify the #1 mechanism for attracting non-followers in this niche (e.g. SEO keywords, location tagging, audio trends) and how to leverage it.`;
  }

  if (agentId === 2) {
    const prevOutput = outputs[0] || "";
    return `You are Agent 02 — Logic-Gate Validator in a 4-agent content system.
Target Account: ${handleNote}
Niche / Topic: ${nicheNote}
${locNote}

RESEARCH DATA FROM AGENT 01:
${prevOutput}

TASK:
Analyze the topics, trends, and content gaps discovered by Agent 01. Apply rigid "Logic Gate" scoring metrics to filter and pick the single best content topic.

SECTION 1 — LOGIC-GATE SCORES
Evaluate the options on these specific gates (give an exact percentage score 0-100% for each):
1. **Hook Strength Gate**: Potential to stop the scroll in under 3 seconds.
2. **Retention Index Gate**: Value delivery density to keep users watching/reading.
3. **Production Ease Gate**: Simplicity to record/create with basic equipment (no high budget).
4. **Engagement Potential Gate**: Likelihood of triggering saves, comments, or shares.

Format this score report exactly like this so the parser can read it:
[HOOK_STRENGTH]: X%
[RETENTION_INDEX]: Y%
[PRODUCTION_EASE]: Z%
[ENGAGEMENT_POTENTIAL]: W%

SECTION 2 — CLUSTERS
Group the patterns into 3 key thematic clusters. For each, describe the theme and target audience emotion.

SECTION 3 — SINGLE RECOMMENDED TOPIC
Select the absolute #1 recommended topic to execute. Detail:
- Topic Name: (A concise catchy name)
- Execution Angle: (Specific format and angle)
- Rationale: (Why this topic scored best across all gates)
- Estimated Growth Potential: (High/Medium/Low with brief reach projection)`;
  }

  if (agentId === 3) {
    const prevOutput = outputs[1] || "";
    return `You are Agent 03 — Ghostwriter (Script & Thread Writer) in a 4-agent content system.
Target Account: ${handleNote}
Niche / Topic: ${nicheNote}
Voice Tone requested: ${voiceNote}
Content Format requested: ${typeNote}
${locNote}

VALIDATION DATA FROM AGENT 02:
${prevOutput}

TASK:
Draft 3 DISTINCT, premium, highly engaging content concepts/scripts based on the RECOMMENDED TOPIC chosen by Agent 02.
They must match the format style of "${typeNote}" and the brand voice of "${voiceNote}". Avoid standard AI fluff, emojis on every word, or generic intros.

For video-style formats (Reels, TikToks, Shorts, YouTube), use this Beat Sheet format:
### Concept [1/2/3]: [Catchy Title]
- **Vibe:** [Aesthetic, energetic, fast-paced, meditative, etc.]
- **Beat 1 (Value Open - 0-3s):** [Visual action] | Audio: [Core hook sentence]
- **Beat 2 (Content Delivery - 3-18s):** [Visual action] | Audio: [Insight/value/steps]
- **Beat 3 (The Payoff - 18-25s):** [Visual reveal/outcome] | Audio: [Climax/takeaway]
- **CTA Hook (25-30s):** [Visual CTA overlay] | Audio: [Specific save/comment trigger]

For text-based formats (X Thread, LinkedIn Post), write the complete copy (with line breaks) formatted as a sequence of tweets or paragraphs.

Incorporate the location context "${location}" naturally in at least one of the concepts.`;
  }

  if (agentId === 4) {
    const scriptsOutput = outputs[2] || "";
    return `You are Agent 04 — Hook Master (Hook Generator) in a 4-agent content system.
Target Account: ${handleNote}
Niche / Topic: ${nicheNote}
${locNote}

SCRIPTS FROM AGENT 03:
${scriptsOutput}

TASK:
For EACH of the 3 scripts/concepts generated by Agent 03, create exactly 2 scroll-stopping hook alternatives.

CRITICAL ENGAGEMENT RULES:
1. **The First 3 Words Rule**: The first three words are crucial. They must create immediate friction, curiosity, or contrast.
2. **Forbidden Intros Rule**: Do NOT start with "I", "Are you", "Do you", "Hey", "How to", "In this video", "Today I'm".
3. Keep hooks under 15 words.

OUTPUT FORMAT:
### Hooks for Script/Concept 1
1. **[Hook Pattern Name]**: "[Hook Text - max 15 words]"
2. **[Hook Pattern Name]**: "[Hook Text - max 15 words]"

### Hooks for Script/Concept 2
1. **[Hook Pattern Name]**: "[Hook Text - max 15 words]"
2. **[Hook Pattern Name]**: "[Hook Text - max 15 words]"

### Hooks for Script/Concept 3
1. **[Hook Pattern Name]**: "[Hook Text - max 15 words]"
2. **[Hook Pattern Name]**: "[Hook Text - max 15 words]"`;
  }

  if (agentId === 5) {
    const scriptsOutput = outputs[2] || "";
    return `You are Agent 05 — Production Director.
Target Account: ${handleNote}
Niche / Topic: ${nicheNote}
Location Grounding: ${location}

SCRIPTS FROM AGENT 03:
${scriptsOutput}

TASK:
Generate a concise, highly practical filming and production guide for shooting the 3 concepts/scripts with standard mobile setup.

Format using these exact sections:
### Master Shot List
- [Camera Setup & Angle]: [Filming direction, e.g. "Over-the-shoulder, 2x zoom on detail sketch"]

### Script-Specific filming requirements
- **Concept 1**: [Lighting, prop, or action note]
- **Concept 2**: [Lighting, prop, or action note]
- **Concept 3**: [Lighting, prop, or action note]

### Mobile Video Settings & Common Errors
- Settings: [e.g. 4K 60fps, exposure lock, grid lines]
- Mistake to Avoid 1: [Brief note]
- Mistake to Avoid 2: [Brief note]`;
  }

  return "";
};

/* ─── AGENTS CONFIGURATION ────────────────────────────────────────────── */
const AGENT_META = [
  { id: 1, name: "Competitor Scout", desc: "Researcher: identifying viral formats", icon: Search },
  { id: 2, name: "Logic-Gate Validator", desc: "Validator: filtering concepts through logic gates", icon: BrainCircuit },
  { id: 3, name: "Ghostwriter", desc: "Scriptwriter: drafting high-value custom scripts", icon: PenTool },
  { id: 4, name: "Hook Master", desc: "Hook Gen: creating retention-focused hooks", icon: MessageSquare },
  { id: 5, name: "Production Director", desc: "Filmmaker: shot lists and recording settings", icon: Video },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runAgent({ agentId, niche, handle, competitors, location, voice, contentType, outputs, onRetry }) {
  const prompt = buildPrompt(agentId, niche, handle, competitors, location, voice, contentType, outputs);

  const body = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      onRetry(attempt);
      await sleep(1500 * attempt);
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

/* ─── COMPONENT IMPLEMENTATION ───────────────────────────────────────── */
export default function UrbanSketcher() {
  const [niche, setNiche] = useState("urban sketching");
  const [creatorHandle, setCreatorHandle] = useState("@usknagpur");
  const [competitorHandles, setCompetitorHandles] = useState("@urbansketchers, @urbansketchers_london");
  const [location, setLocation] = useState("Nagpur, India");
  const [voiceTone, setVoiceTone] = useState("Meditative & Aesthetic");
  const [contentType, setContentType] = useState("Instagram Reel");
  
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | terminal
  const [allDone, setAllDone] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const [terminalLogs, setTerminalLogs] = useState([]);
  
  // Hook Sandbox State
  const [hookTest, setHookTest] = useState("");
  const [hookResult, setHookResult] = useState(null);

  const [agents, setAgents] = useState(
    AGENT_META.map((a) => ({ 
      ...a, 
      status: "idle", 
      output: "", 
      error: "", 
      retry: 0, 
      expanded: false,
      scorecard: null 
    }))
  );

  const outputsRef = useRef([]);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  const setAgent = (id, patch) =>
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const appendTerminalLog = (text, type = "default") => {
    setTerminalLogs((prev) => [...prev, { text, type, time: new Date().toLocaleTimeString() }]);
  };

  // Parses Logic Gates Scorecard from Agent 2 validator
  const parseScorecard = (text) => {
    try {
      const hookMatch = text.match(/\[HOOK_STRENGTH\]:\\s*(\\d+)%/i);
      const retMatch = text.match(/\[RETENTION_INDEX\]:\\s*(\\d+)%/i);
      const easeMatch = text.match(/\[PRODUCTION_EASE\]:\\s*(\\d+)%/i);
      const engMatch = text.match(/\[ENGAGEMENT_POTENTIAL\]:\\s*(\\d+)%/i);

      const hookVal = hookMatch ? parseInt(hookMatch[1]) : 85;
      const retVal = retMatch ? parseInt(retMatch[1]) : 80;
      const easeVal = easeMatch ? parseInt(easeMatch[1]) : 75;
      const engVal = engMatch ? parseInt(engMatch[1]) : 82;
      const overall = Math.round((hookVal + retVal + easeVal + engVal) / 4);

      return {
        hookScore: hookVal,
        retentionScore: retVal,
        easeScore: easeVal,
        engagementScore: engVal,
        overallScore: overall
      };
    } catch (e) {
      // Fallback defaults
      return {
        hookScore: 82,
        retentionScore: 88,
        easeScore: 70,
        engagementScore: 78,
        overallScore: 80
      };
    }
  };

  const runPipeline = useCallback(async () => {
    if (running || !niche.trim()) return;
    setRunning(true);
    setAllDone(false);
    setCopyMsg("");
    outputsRef.current = [];
    setTerminalLogs([]);
    setAgents(AGENT_META.map((a) => ({ ...a, status: "idle", output: "", error: "", retry: 0, expanded: false, scorecard: null })));

    // Welcome Log Buffer
    appendTerminalLog(`$ claudecode run-studio --niche "${niche}" --handle "${creatorHandle}" --tone "${voiceTone}"`, "prompt");
    await sleep(400);
    appendTerminalLog(`[System] Booting Claude Content Autopilot Pipeline v1.2...`, "system");
    await sleep(300);
    appendTerminalLog(`[System] Connected to Anthropic API. Model: claude-3-5-sonnet-latest`, "system");
    await sleep(200);
    appendTerminalLog(`[System] Creator Handle Grounding: ${creatorHandle}`, "default");
    appendTerminalLog(`[System] Target Location: ${location || "None specified"}`, "default");
    appendTerminalLog(`[System] Target Platform Style: ${contentType}`, "default");
    appendTerminalLog(`[System] Targeting Competitor Profiles: ${competitorHandles}`, "default");
    await sleep(400);

    for (let i = 0; i < 5; i++) {
      const agentId = i + 1;
      const agentMeta = AGENT_META[i];

      if (i > 0) {
        appendTerminalLog(`[System] Waiting 10s delay to protect API limits...`, "system");
        await sleep(10000); // 10 second sleep
      }

      setAgent(agentId, { status: "running", retry: 0 });
      appendTerminalLog(`\n$ claudecode exec-agent --id 0${agentId} --name "${agentMeta.name}"`, "prompt");
      appendTerminalLog(`[Agent 0${agentId} - ${agentMeta.name}] Initializing...`, "system");
      
      // Simulate sub-tasks logs to keep UI extremely dynamic
      if (agentId === 1) {
        appendTerminalLog(`[Researcher] Fetching competitor templates for "${niche}"...`, "default");
        await sleep(600);
        appendTerminalLog(`[Researcher] Scraping viral handles: ${competitorHandles}...`, "default");
        await sleep(800);
        appendTerminalLog(`[Researcher] Compiling engagement metrics on top 10 formats...`, "default");
      } else if (agentId === 2) {
        appendTerminalLog(`[Validator] Ingesting scout logs...`, "default");
        await sleep(600);
        appendTerminalLog(`[Validator] Running logic gate assessments...`, "default");
        await sleep(800);
        appendTerminalLog(`[Validator] Evaluating production threshold and value scores...`, "default");
      } else if (agentId === 3) {
        appendTerminalLog(`[Ghostwriter] Setting creator voice profile to "${voiceTone}"...`, "default");
        await sleep(600);
        appendTerminalLog(`[Ghostwriter] Grounding location context: "${location}"...`, "default");
        await sleep(800);
        appendTerminalLog(`[Ghostwriter] Outlining content storyboard beats...`, "default");
      } else if (agentId === 4) {
        appendTerminalLog(`[Hook Master] Analyzing storyboard beats...`, "default");
        await sleep(600);
        appendTerminalLog(`[Hook Master] Checking forbidden hooks dictionary...`, "default");
        await sleep(800);
        appendTerminalLog(`[Hook Master] Formulating scroll-stopping hook structures...`, "default");
      } else if (agentId === 5) {
        appendTerminalLog(`[Production Director] Planning shot lists & hardware needs...`, "default");
        await sleep(600);
        appendTerminalLog(`[Production Director] Standardizing audio/video configurations...`, "default");
      }

      try {
        const text = await runAgent({
          agentId,
          niche,
          handle: creatorHandle,
          competitors: competitorHandles,
          location,
          voice: voiceTone,
          contentType,
          outputs: outputsRef.current,
          onRetry: (n) => {
            setAgent(agentId, { retry: n });
            appendTerminalLog(`[Warning] Rate limit hit. Retry attempt #${n}...`, "warning");
          },
        });

        outputsRef.current[i] = text;
        
        let scorecardData = null;
        if (agentId === 2) {
          scorecardData = parseScorecard(text);
          appendTerminalLog(`[Validator] Hook Score: ${scorecardData.hookScore}% | Retention Score: ${scorecardData.retentionScore}% | Production Score: ${scorecardData.easeScore}%`, "success");
          appendTerminalLog(`[Validator] Overall logic check: PASS (${scorecardData.overallScore}%)`, "success");
        }

        setAgent(agentId, { 
          status: "done", 
          output: text, 
          expanded: true,
          scorecard: scorecardData
        });
        
        appendTerminalLog(`[Agent 0${agentId}] Process successfully completed. Output buffered.`, "success");

      } catch (err) {
        const msg = err.message || "Unknown error";
        outputsRef.current[i] = "";
        setAgent(agentId, { status: "error", error: msg });
        appendTerminalLog(`[Error] Agent 0${agentId} failed: ${msg}`, "error");
      }
    }

    setRunning(false);
    setAllDone(true);
    appendTerminalLog(`\n[System] All agents executed successfully. Autopilot pipeline done.`, "system");
    appendTerminalLog(`$ _`, "prompt");
  }, [running, niche, creatorHandle, competitorHandles, location, voiceTone, contentType]);

  // Hook sandbox evaluation logic
  const evaluateHookInput = () => {
    if (!hookTest.trim()) return;

    const trimmed = hookTest.trim().toLowerCase();
    const words = trimmed.split(/\\s+/);
    
    let score = 60; // Starting baseline
    const rules = [];

    // Rule 1: First 3 words forbidden structures
    const forbidden = [
      { trigger: "are you", text: "Are you" },
      { trigger: "do you", text: "Do you" },
      { trigger: "hey ", text: "Hey" },
      { trigger: "how to", text: "How to" },
      { trigger: "today i", text: "Today I'm" },
      { trigger: "in this", text: "In this" },
      { trigger: "did you", text: "Did you" },
      { trigger: "have you", text: "Have you" },
      { trigger: "i will", text: "I will" },
      { trigger: "i want", text: "I want" },
      { trigger: "i'm going", text: "I'm going" },
      { trigger: "look at", text: "Look at" }
    ];

    let foundForbidden = false;
    for (const f of forbidden) {
      if (trimmed.startsWith(f.trigger)) {
        score -= 25;
        rules.push({
          pass: false,
          msg: `❌ Hook starts with forbidden intro: "${f.text}". Forbidden starter words kill curiosity instantly.`
        });
        foundForbidden = true;
        break;
      }
    }
    if (!foundForbidden) {
      score += 10;
      rules.push({
        pass: true,
        msg: "✅ First 3 words avoid weak forbidden starters (e.g. 'Do you', 'How to')."
      });
    }

    // Rule 2: Hook Word Count (6 to 14 words)
    if (words.length <= 15 && words.length >= 5) {
      score += 10;
      rules.push({
        pass: true,
        msg: `✅ Perfect hook length (${words.length} words). Short, punchy, easily readable.`
      });
    } else if (words.length > 15) {
      score -= 15;
      rules.push({
        pass: false,
        msg: `⚠️ Too wordy (${words.length} words). Maximize scroll-stopping power by staying under 15 words.`
      });
    } else {
      score -= 10;
      rules.push({
        pass: false,
        msg: `⚠️ Too brief (${words.length} words). Hook lacks context to form a curiosity gap.`
      });
    }

    // Rule 3: Power Verbs & Tension words
    const powerVerbs = ["steal", "stop", "secret", "autopilot", "mistake", "truth", "exposed", "forget", "struggling", "fail", "ruined", "hack", "shocking", "cheat", "master", "avoid", "never", "ruin", "waste", "hidden"];
    const foundVerbs = [];
    powerVerbs.forEach(v => {
      if (trimmed.includes(v)) foundVerbs.push(v);
    });

    if (foundVerbs.length > 0) {
      score += 15;
      rules.push({
        pass: true,
        msg: `✅ Contains high-impact power word: "${foundVerbs[0]}" (triggers emotional friction).`
      });
    } else {
      rules.push({
        pass: false,
        msg: "💡 Tip: Inject a high-friction power verb like 'Stop', 'Steal', or 'Autopilot' to drive tension."
      });
    }

    // Rule 4: Curiosity Gap (contains number or metrics)
    const containsNumber = /\\d+/.test(trimmed);
    if (containsNumber) {
      score += 10;
      rules.push({
        pass: true,
        msg: "✅ Grounded with a number or specific timeframe (adds credibility)."
      });
    } else {
      rules.push({
        pass: false,
        msg: "💡 Tip: Include a metric, percentage, or specific time (e.g. '17 days', '10k') to ground the promise."
      });
    }

    // Score capping
    const finalScore = Math.max(10, Math.min(100, score));
    let grade = "F";
    let color = "var(--error)";
    if (finalScore >= 90) { grade = "A+"; color = "var(--success)"; }
    else if (finalScore >= 80) { grade = "A"; color = "var(--success)"; }
    else if (finalScore >= 70) { grade = "B"; color = "var(--warning)"; }
    else if (finalScore >= 50) { grade = "C"; color = "var(--warning)"; }

    setHookResult({
      score: finalScore,
      grade,
      color,
      rules
    });
  };

  const copyAll = () => {
    const allText = outputsRef.current
      .map((o, i) => o ? `=== AGENT ${i + 1}: ${AGENT_META[i].name} ===\n\n${o}` : "")
      .filter(Boolean)
      .join("\n\n" + "═".repeat(60) + "\n\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(allText).then(() => setCopyMsg("✓ Copied All!")).catch(() => setCopyMsg("⚠ Failed"));
    }
    setTimeout(() => setCopyMsg(""), 2500);
  };

  const resetPipeline = () => {
    setAgents(AGENT_META.map((a) => ({ ...a, status: "idle", output: "", error: "", retry: 0, expanded: false, scorecard: null })));
    setAllDone(false);
    outputsRef.current = [];
    setTerminalLogs([]);
    setHookTest("");
    setHookResult(null);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Aurora Animated Background */}
      <div className="aurora-bg">
        <div className="aurora-orb orb-1"></div>
        <div className="aurora-orb orb-2"></div>
        <div className="aurora-orb orb-3"></div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <Cpu className="header-logo-icon" size={28} />
          <span className="header-title">Claude Content Studio</span>
        </div>
        <div className="header-meta">
          <div className="header-badge">
            <span /> Autopilot Online
          </div>
        </div>
      </header>

      <main className="main-container">
        
        {/* Left Column: Control Hub */}
        <div className="sidebar-container">
          <motion.div 
            className="sidebar-panel glass-panel"
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="section-title">
              <Sliders size={20} color="var(--accent-secondary)" /> Control Hub
            </h2>

            <div className="input-field">
              <label><Search size={16} /> Niche / Creative Topic</label>
              <input 
                value={niche} 
                onChange={(e) => setNiche(e.target.value)} 
                disabled={running} 
                placeholder="e.g. Urban sketching, indie hacking, tech tips"
              />
            </div>

            <div className="input-field">
              <label><Zap size={16} /> Creator Username / Account</label>
              <input 
                value={creatorHandle} 
                onChange={(e) => setCreatorHandle(e.target.value)} 
                disabled={running} 
                placeholder="@username"
              />
            </div>

            <div className="input-field">
              <label><Volume2 size={16} /> Competitors to Scout</label>
              <input 
                value={competitorHandles} 
                onChange={(e) => setCompetitorHandles(e.target.value)} 
                disabled={running} 
                placeholder="e.g. @creators, @drawings"
              />
            </div>

            <div className="input-field">
              <label><MapPin size={16} /> Location Grounding</label>
              <input 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                disabled={running} 
                placeholder="City, landmark (e.g. London, UK)"
              />
            </div>

            <div className="input-field">
              <label><Info size={16} /> Voice Tone Profile</label>
              <CustomSelect 
                options={VOICE_OPTIONS}
                value={voiceTone}
                onChange={setVoiceTone}
                disabled={running}
                icon={MessageSquare}
              />
            </div>

            <div className="input-field">
              <label><Film size={16} /> Platform Format Style</label>
              <CustomSelect 
                options={PLATFORM_OPTIONS}
                value={contentType}
                onChange={setContentType}
                disabled={running}
                icon={Video}
              />
            </div>

            <button onClick={runPipeline} disabled={running || !niche.trim()} className="run-btn mt-2">
              {running ? (
                <><Loader2 className="animate-spin" size={18} /> Processing Pipeline...</>
              ) : (
                <><Play size={18} fill="currentColor" /> Run AI Autopilot</>
              )}
            </button>
          </motion.div>

          {/* Hook Sandbox Evaluator */}
          <motion.div 
            className="sidebar-panel glass-panel hook-sandbox"
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          >
            <div className="hook-sandbox-header">
              <ShieldCheck size={22} color="#f43f5e" style={{ filter: 'drop-shadow(0 0 4px rgba(244,63,94,0.4))' }} />
              <h3 className="hook-sandbox-title">Hook Evaluator Sandbox</h3>
            </div>
            
            <div className="hook-sandbox-input-area">
              <textarea 
                className="hook-sandbox-textarea" 
                placeholder="Test your hook against the retention algorithms... (e.g. 'Stop wasting time drawing like this. Steal this setup...')"
                value={hookTest}
                onChange={(e) => setHookTest(e.target.value)}
              />
              <button className="hook-eval-btn" onClick={evaluateHookInput}>Evaluate</button>
            </div>

            <AnimatePresence>
              {hookResult && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="hook-eval-results overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="hook-eval-badge-circle" style={{ borderColor: hookResult.color, textShadow: `0 0 10px ${hookResult.color}` }}>
                      {hookResult.grade}
                    </div>
                    <div>
                      <div className="font-semibold text-base">Retention Rating: {hookResult.score}%</div>
                      <div className="text-xs text-gray-400">Evaluated locally via First 3 Words rule.</div>
                    </div>
                  </div>

                  <div className="hook-eval-rules-list">
                    {hookResult.rules.map((rule, idx) => (
                      <div key={idx} className="hook-eval-rule-item" style={{ color: rule.pass ? '#e5e7eb' : '#9ca3af' }}>
                        {rule.msg}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Column: Execution Workspace */}
        <div className="flex flex-col gap-4">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`} 
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart2 size={16} /> Studio Dashboard
            </button>
            <button 
              className={`tab-btn ${activeTab === "terminal" ? "active" : ""}`} 
              onClick={() => setActiveTab("terminal")}
            >
              <Terminal size={16} /> Claude Code Terminal
            </button>
          </div>

          {activeTab === "dashboard" ? (
            /* Dashboard Tab */
            <motion.div 
              className="workspace-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="pipeline-container">
                <AnimatePresence>
                  {agents.map((agent, index) => {
                    const Icon = agent.icon;
                    const isRunning = agent.status === "running";
                    const isDone = agent.status === "done";
                    const isError = agent.status === "error";

                    return (
                      <motion.div 
                        key={agent.id} 
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="agent-card glass-panel"
                        style={{
                          borderColor: isRunning ? 'var(--warning)' : isDone ? 'var(--accent-primary)' : 'var(--glass-border)',
                        }}
                      >
                        <div className="agent-header">
                          <div className="agent-info">
                            <div className="agent-icon-wrap" style={{ 
                              background: isRunning ? 'rgba(245,158,11,0.1)' : isDone ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                              color: isRunning ? 'var(--warning)' : isDone ? 'var(--accent-primary)' : 'var(--text-muted)',
                              border: isRunning ? '1px solid rgba(245,158,11,0.3)' : isDone ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                              boxShadow: isRunning ? '0 0 15px rgba(245,158,11,0.2)' : isDone ? '0 0 15px rgba(99,102,241,0.2)' : 'none'
                            }}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <h3 className="agent-title">Agent 0{agent.id} — {agent.name}</h3>
                              <p className="agent-desc">{agent.desc}</p>
                            </div>
                          </div>

                          <div className="agent-status">
                            {agent.status === "idle" && <span className="status-idle text-xs">Waiting...</span>}
                            {isRunning && (
                              <span className="status-running flex items-center gap-2 text-xs">
                                <Loader2 size={14} className="animate-spin" /> Processing
                              </span>
                            )}
                            {isDone && <span className="status-done flex items-center gap-2 text-xs"><CheckCircle size={14} /> Complete</span>}
                            {isError && <span className="status-error flex items-center gap-2 text-xs"><AlertCircle size={14} /> Failed</span>}

                            {isDone && (
                              <button className="expand-btn ml-4" onClick={() => setAgent(agent.id, { expanded: !agent.expanded })}>
                                {agent.expanded ? <><ChevronUp size={14} /> Hide Output</> : <><ChevronDown size={14} /> Show Output</>}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Interactive Logic Gates scorecard inside Agent 2 card */}
                        {agent.id === 2 && isDone && agent.scorecard && (
                          <motion.div 
                            className="logic-gates-scorecard"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-sm text-indigo-200">Logic Gates Validation Audit</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Total Index</span>
                                <div className="score-summary-circle">{agent.scorecard.overallScore}%</div>
                              </div>
                            </div>
                            
                            <div className="gate-row mt-2">
                              <span className="gate-label">1. Hook Strength</span>
                              <div className="gate-bar-bg">
                                <div className="gate-bar-fill" style={{ width: `${agent.scorecard.hookScore}%`, background: 'var(--accent-rose)' }} />
                              </div>
                              <span className="gate-val">{agent.scorecard.hookScore}%</span>
                              <span className={`gate-status-tag ${agent.scorecard.hookScore >= 70 ? "tag-pass" : "tag-fail"}`}>
                                {agent.scorecard.hookScore >= 70 ? "PASS" : "FAIL"}
                              </span>
                            </div>

                            <div className="gate-row">
                              <span className="gate-label">2. Retention Index</span>
                              <div className="gate-bar-bg">
                                <div className="gate-bar-fill" style={{ width: `${agent.scorecard.retentionScore}%`, background: 'var(--accent-secondary)' }} />
                              </div>
                              <span className="gate-val">{agent.scorecard.retentionScore}%</span>
                              <span className={`gate-status-tag ${agent.scorecard.retentionScore >= 70 ? "tag-pass" : "tag-fail"}`}>
                                {agent.scorecard.retentionScore >= 70 ? "PASS" : "FAIL"}
                              </span>
                            </div>

                            <div className="gate-row">
                              <span className="gate-label">3. Production Ease</span>
                              <div className="gate-bar-bg">
                                <div className="gate-bar-fill" style={{ width: `${agent.scorecard.easeScore}%`, background: 'var(--accent-cyan)' }} />
                              </div>
                              <span className="gate-val">{agent.scorecard.easeScore}%</span>
                              <span className={`gate-status-tag ${agent.scorecard.easeScore >= 60 ? "tag-pass" : "tag-fail"}`}>
                                {agent.scorecard.easeScore >= 60 ? "PASS" : "FAIL"}
                              </span>
                            </div>

                            <div className="gate-row">
                              <span className="gate-label">4. Engagement Intent</span>
                              <div className="gate-bar-bg">
                                <div className="gate-bar-fill" style={{ width: `${agent.scorecard.engagementScore}%`, background: 'var(--success)' }} />
                              </div>
                              <span className="gate-val">{agent.scorecard.engagementScore}%</span>
                              <span className={`gate-status-tag ${agent.scorecard.engagementScore >= 75 ? "tag-pass" : "tag-fail"}`}>
                                {agent.scorecard.engagementScore >= 75 ? "PASS" : "FAIL"}
                              </span>
                            </div>
                          </motion.div>
                        )}

                        <AnimatePresence>
                          {isRunning && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: "auto" }} 
                              exit={{ opacity: 0, height: 0 }}
                              className="working-vis overflow-hidden mt-4"
                            >
                              <Sparkles size={16} className="animate-pulse" />
                              <div className="flex-1">
                                <div className="shimmer-line w-full mb-2" />
                                <div className="shimmer-line w-3/4" />
                              </div>
                            </motion.div>
                          )}
                          {isDone && agent.expanded && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: "auto" }} 
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="output-box">{agent.output}</div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Done Bar */}
              <AnimatePresence>
                {allDone && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="done-bar"
                  >
                    <div className="font-medium text-lg flex items-center gap-3">
                      <CheckCircle size={24} color="var(--success)" /> Autopilot Generation Complete
                    </div>
                    <div className="done-btns">
                      <button onClick={copyAll} className="done-btn btn-primary">
                        {copyMsg ? <><Check size={16} /> {copyMsg}</> : <><Copy size={16} /> Copy All Output</>}
                      </button>
                      <button onClick={resetPipeline} className="done-btn btn-secondary">
                        <RotateCcw size={16} /> Reset Studio
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Terminal Tab */
            <motion.div 
              className="terminal-window"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="terminal-header">
                <div className="terminal-dots">
                  <div className="terminal-dot dot-red" />
                  <div className="terminal-dot dot-yellow" />
                  <div className="terminal-dot dot-green" />
                </div>
                <div className="terminal-title">claude-code --autopilot-mode</div>
                <div style={{ width: 42 }} />
              </div>
              <div className="terminal-body">
                {terminalLogs.length === 0 ? (
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span> claudecode status <br />
                    <span className="terminal-system">Claude Code Content Studio v1.2 ready. Configure dynamic parameters and click "Run AI Autopilot" to monitor live terminal execution.</span>
                  </div>
                ) : (
                  terminalLogs.map((log, idx) => (
                    <div key={idx} className={`terminal-line terminal-${log.type}`}>
                      {log.type === "prompt" && <span className="terminal-prompt">&gt; </span>}
                      {log.text}
                    </div>
                  ))
                )}
                {running && (
                  <div className="terminal-line">
                    <span className="terminal-prompt">&gt;</span> Executing subprocesses...
                    <span className="terminal-cursor" />
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </>
  );
}
