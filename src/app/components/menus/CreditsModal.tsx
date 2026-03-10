"use client";
import React from "react";
import { X, ExternalLink, Github, Globe, Cpu, Zap, Palette, Box, Monitor } from "lucide-react";
import { OrnateFrame } from "../ui/OrnateFrame";
import { GOLD, OVERLAY, panelGradient } from "../ui/theme";

export interface CreditsModalProps {
  onClose: () => void;
}

const ARCH_LAYERS: {
  label: string;
  items: string[];
  color: string;
  borderColor: string;
  icon: React.ReactNode;
}[] = [
  {
    label: "Rendering Engine",
    items: ["Isometric Projection", "Sprite Animation System", "Z-Sorting Pipeline", "Shadow & Lighting", "Particle Effects"],
    color: "rgba(217, 119, 6, 0.15)",
    borderColor: "rgba(217, 119, 6, 0.4)",
    icon: <Palette size={14} className="text-amber-400" />,
  },
  {
    label: "Game Systems",
    items: ["Tower Targeting AI", "Pathfinding Engine", "Wave Orchestration", "Projectile Physics", "Hero & Spell Logic"],
    color: "rgba(234, 88, 12, 0.12)",
    borderColor: "rgba(234, 88, 12, 0.35)",
    icon: <Zap size={14} className="text-orange-400" />,
  },
  {
    label: "Performance Layer",
    items: ["Canvas State Batching", "Offscreen Pre-Rendering", "Adaptive Quality Scaling", "Object Pooling", "Frame Budget Allocation"],
    color: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    icon: <Cpu size={14} className="text-red-400" />,
  },
];

const TECH_STATS: { label: string; value: string }[] = [
  { label: "Towers", value: "7 Types" },
  { label: "Heroes", value: "7 Playable" },
  { label: "Levels", value: "23 Hand-Crafted" },
  { label: "Render Target", value: "60 FPS" },
  { label: "Engine", value: "Canvas 2D" },
  { label: "Framework", value: "Next.js + React" },
];

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: OVERLAY.black60 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: panelGradient,
          border: `2px solid ${GOLD.border35}`,
          boxShadow: `0 0 40px ${GOLD.glow07}, inset 0 0 30px ${GOLD.glow04}`,
        }}
      >
        <OrnateFrame className="relative w-full h-full overflow-hidden flex flex-col" cornerSize={48}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: GOLD.border25 }}
        >
          <div>
            <h2 className="text-xl font-bold text-amber-200 tracking-wide">About This Project</h2>
            <p className="text-xs text-amber-200/40 mt-0.5">A Canvas API Technical Showcase</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
          >
            <X size={20} className="text-amber-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Mission statement */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/30">
            <p className="text-sm text-amber-200/80 leading-relaxed">
              Princeton Tower Defense is a <strong className="text-amber-300">tech demo and personal experiment</strong> exploring
              how far the browser&apos;s native Canvas 2D API can be pushed &mdash; building a fully performant,
              isometric pseudo-3D game engine with zero WebGL, zero game framework dependencies, and
              zero external rendering libraries. Every pixel is drawn through <code className="text-amber-400/90 bg-amber-900/40 px-1.5 py-0.5 rounded text-xs">CanvasRenderingContext2D</code>.
            </p>
          </div>

          {/* Architecture Diagram */}
          <div className="space-y-3">
            <SectionLabel text="Architecture" />
            <div className="relative space-y-2">
              {/* Top: Canvas API foundation */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border"
                style={{ background: "rgba(251, 191, 36, 0.08)", borderColor: "rgba(251, 191, 36, 0.3)" }}
              >
                <Monitor size={14} className="text-yellow-400 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-300/80">HTML Canvas 2D API</span>
                <span className="ml-auto text-[10px] text-yellow-300/40">Single &lt;canvas&gt; element</span>
              </div>

              {/* Connector */}
              <div className="flex justify-center">
                <div className="w-px h-3 bg-gradient-to-b from-yellow-600/40 to-amber-600/40" />
              </div>

              {/* Layer stack */}
              {ARCH_LAYERS.map((layer, i) => (
                <React.Fragment key={layer.label}>
                  <div
                    className="rounded-lg border px-4 py-3"
                    style={{ background: layer.color, borderColor: layer.borderColor }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {layer.icon}
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-200/70">{layer.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {layer.items.map((item) => (
                        <span
                          key={item}
                          className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-black/20 text-amber-200/60 border border-white/5"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  {i < ARCH_LAYERS.length - 1 && (
                    <div className="flex justify-center">
                      <div className="w-px h-3 bg-gradient-to-b from-amber-600/30 to-amber-600/20" />
                    </div>
                  )}
                </React.Fragment>
              ))}

              {/* Connector */}
              <div className="flex justify-center">
                <div className="w-px h-3 bg-gradient-to-b from-amber-600/20 to-amber-800/20" />
              </div>

              {/* Bottom: React / Next.js shell */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border"
                style={{ background: "rgba(59, 130, 246, 0.08)", borderColor: "rgba(59, 130, 246, 0.25)" }}
              >
                <Box size={14} className="text-blue-400 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300/80">Next.js + React + TypeScript</span>
                <span className="ml-auto text-[10px] text-blue-300/40">UI shell &amp; state</span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="space-y-3">
            <SectionLabel text="By the Numbers" />
            <div className="grid grid-cols-3 gap-2">
              {TECH_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-3 rounded-lg bg-amber-950/20 border border-amber-800/20"
                >
                  <div className="text-sm font-bold text-amber-300/90">{stat.value}</div>
                  <div className="text-[10px] text-amber-200/40 uppercase tracking-wider mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Why */}
          <div className="space-y-3">
            <SectionLabel text="Why Canvas?" />
            <p className="text-sm text-amber-200/70 leading-relaxed">
              Most browser games default to WebGL or a framework like Phaser/PixiJS. I wanted to see
              if a complex isometric tower defense &mdash; with hundreds of animated sprites, real-time
              projectile physics, atmospheric effects, and smooth 60fps gameplay &mdash; could be
              achieved using only the 2D canvas context. No shaders, no GPU abstraction layers &mdash;
              just <code className="text-amber-400/90 bg-amber-900/40 px-1.5 py-0.5 rounded text-xs">ctx.drawImage()</code>,{" "}
              <code className="text-amber-400/90 bg-amber-900/40 px-1.5 py-0.5 rounded text-xs">ctx.fillRect()</code>, and
              careful frame budgeting.
            </p>
          </div>

          {/* Developer */}
          <div className="space-y-3">
            <SectionLabel text="Developer" />
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-950/30 border border-amber-800/30">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-amber-900 flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #fbbf24, #d97706)" }}
              >
                KL
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-amber-200 text-lg">Kevin Liu</div>
                <div className="text-xs text-amber-200/50">
                  Princeton University &apos;28, B.S.E. in Computer Science
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <SectionLabel text="Links" />
            <div className="flex flex-col gap-2">
              <LinkButton
                href="https://www.kevin-liu.tech/"
                icon={<Globe size={16} />}
                label="kevin-liu.tech"
                description="Portfolio"
              />
              <LinkButton
                href="https://github.com/Kevin-Liu-01/Princeton-Tower-Defense"
                icon={<Github size={16} />}
                label="Source Code"
                description="GitHub Repository"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 border-t text-center"
          style={{ borderColor: GOLD.border25 }}
        >
          <p className="text-xs text-amber-200/30">
            A Canvas 2D tech demo &mdash; built at Princeton University
          </p>
        </div>
      </OrnateFrame>
      </div>
    </div>
  );
};

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
      <span className="text-xs font-bold uppercase tracking-widest text-amber-500/60">{text}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
    </div>
  );
}

function LinkButton({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-950/20 border border-amber-800/20 hover:bg-amber-900/30 hover:border-amber-700/40 transition-colors group"
    >
      <div className="text-amber-400/70 group-hover:text-amber-300 transition-colors">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-amber-200/80 group-hover:text-amber-200 transition-colors">{label}</div>
        <div className="text-xs text-amber-200/40">{description}</div>
      </div>
      <ExternalLink size={14} className="text-amber-200/20 group-hover:text-amber-200/50 transition-colors flex-shrink-0" />
    </a>
  );
}
