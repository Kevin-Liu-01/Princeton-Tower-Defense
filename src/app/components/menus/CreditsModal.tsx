"use client";
import React from "react";
import { X, ExternalLink, Github, Globe, Cpu, Zap, Palette, Box, Monitor, ChevronDown } from "lucide-react";
import { OrnateFrame } from "../ui/OrnateFrame";
import { GOLD, OVERLAY, panelGradient } from "../ui/theme";

export interface CreditsModalProps {
  onClose: () => void;
}

const ARCH_LAYERS: {
  label: string;
  items: string[];
  bg: string;
  border: string;
  accentColor: string;
  accentGlow: string;
  iconClass: string;
  icon: React.ReactNode;
}[] = [
    {
      label: "Rendering Engine",
      items: ["Isometric Projection", "Sprite Animation System", "Z-Sorting Pipeline", "Shadow & Lighting", "Particle Effects"],
      bg: "linear-gradient(135deg, rgba(217,119,6,0.18) 0%, rgba(180,83,9,0.10) 100%)",
      border: "rgba(217,119,6,0.35)",
      accentColor: "rgba(251,191,36,0.9)",
      accentGlow: "rgba(251,191,36,0.25)",
      iconClass: "text-amber-400",
      icon: <Palette size={15} />,
    },
    {
      label: "Game Systems",
      items: ["Tower Targeting AI", "Pathfinding Engine", "Wave Orchestration", "Projectile Physics", "Hero & Spell Logic"],
      bg: "linear-gradient(135deg, rgba(234,88,12,0.15) 0%, rgba(180,60,9,0.08) 100%)",
      border: "rgba(234,88,12,0.30)",
      accentColor: "rgba(251,146,60,0.9)",
      accentGlow: "rgba(251,146,60,0.20)",
      iconClass: "text-orange-400",
      icon: <Zap size={15} />,
    },
    {
      label: "Performance Layer",
      items: ["Canvas State Batching", "Offscreen Pre-Rendering", "Adaptive Quality Scaling", "Object Pooling", "Frame Budget Allocation"],
      bg: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(180,40,40,0.06) 100%)",
      border: "rgba(239,68,68,0.25)",
      accentColor: "rgba(248,113,113,0.9)",
      accentGlow: "rgba(248,113,113,0.18)",
      iconClass: "text-red-400",
      icon: <Cpu size={15} />,
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
        <OrnateFrame className="relative w-full h-full overflow-hidden flex flex-col" cornerSize={48} showSideBorders={false}>
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
              <div className="relative flex flex-col items-stretch">
                {/* Top: Canvas API foundation */}
                <ArchBookend
                  icon={<Monitor size={16} />}
                  label="HTML Canvas 2D API"
                  sublabel="Single <canvas> element"
                  accentColor="rgba(251,191,36,0.85)"
                  glowColor="rgba(251,191,36,0.15)"
                  borderColor="rgba(251,191,36,0.35)"
                  bgGradient="linear-gradient(135deg, rgba(251,191,36,0.10) 0%, rgba(180,140,60,0.05) 100%)"
                  iconBg="rgba(251,191,36,0.12)"
                />

                <ArchConnector />

                {/* Layer stack */}
                {ARCH_LAYERS.map((layer, i) => (
                  <React.Fragment key={layer.label}>
                    <div
                      className="relative rounded-xl overflow-hidden border"
                      style={{
                        background: layer.bg,
                        borderColor: layer.border,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 12px ${layer.accentGlow}`,
                      }}
                    >
                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                        style={{
                          background: `linear-gradient(180deg, ${layer.accentColor}, transparent)`,
                          boxShadow: `0 0 8px ${layer.accentGlow}`,
                        }}
                      />
                      <div className="pl-5 pr-4 py-3.5">
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{
                              background: layer.accentGlow,
                              boxShadow: `0 0 6px ${layer.accentGlow}`,
                            }}
                          >
                            <span className={layer.iconClass}>{layer.icon}</span>
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-200/80">{layer.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {layer.items.map((item) => (
                            <span
                              key={item}
                              className="px-2.5 py-1 text-[10px] font-medium rounded-md border"
                              style={{
                                background: "rgba(0,0,0,0.25)",
                                borderColor: `${layer.border}`,
                                color: "rgba(253,230,138,0.7)",
                                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03)`,
                              }}
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {i < ARCH_LAYERS.length - 1 && <ArchConnector />}
                  </React.Fragment>
                ))}

                <ArchConnector />

                {/* Bottom: React / Next.js shell */}
                <ArchBookend
                  icon={<Box size={16} />}
                  label="Next.js + React + TypeScript"
                  sublabel="UI shell & state"
                  accentColor="rgba(96,165,250,0.85)"
                  glowColor="rgba(96,165,250,0.12)"
                  borderColor="rgba(96,165,250,0.28)"
                  bgGradient="linear-gradient(135deg, rgba(59,130,246,0.10) 0%, rgba(30,64,175,0.05) 100%)"
                  iconBg="rgba(96,165,250,0.12)"
                />
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

function ArchConnector() {
  return (
    <div className="flex flex-col items-center py-0.5">
      <div
        className="w-px h-2"
        style={{
          background: "linear-gradient(180deg, rgba(180,140,60,0.35), rgba(180,140,60,0.15))",
          boxShadow: "0 0 4px rgba(180,140,60,0.1)",
        }}
      />
      <ChevronDown
        size={11}
        className="text-amber-600/40 -mt-[3px]"
        strokeWidth={2.5}
      />
    </div>
  );
}

function ArchBookend({
  icon,
  label,
  sublabel,
  accentColor,
  glowColor,
  borderColor,
  bgGradient,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
  iconBg: string;
}) {
  return (
    <div
      className="relative flex items-center gap-3 px-4 py-3 rounded-xl border overflow-hidden"
      style={{
        background: bgGradient,
        borderColor,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 16px ${glowColor}`,
      }}
    >
      {/* Subtle top highlight shimmer */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
        }}
      />
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: iconBg,
          boxShadow: `0 0 8px ${glowColor}`,
        }}
      >
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <span
        className="text-[11px] font-bold uppercase tracking-widest"
        style={{ color: accentColor }}
      >
        {label}
      </span>
      <span className="ml-auto text-[10px] font-medium" style={{ color: `${accentColor}`.replace(/[\d.]+\)$/, "0.4)") }}>
        {sublabel}
      </span>
    </div>
  );
}

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
