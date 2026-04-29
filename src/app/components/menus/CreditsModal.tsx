"use client";
import {
  X,
  ExternalLink,
  Cpu,
  Zap,
  Palette,
  Box,
  Monitor,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

import { BaseModal } from "../ui/primitives/BaseModal";
import { OrnateFrame } from "../ui/primitives/OrnateFrame";
import { GOLD, OVERLAY, panelGradient } from "../ui/system/theme";

interface CreditsModalProps {
  onClose: () => void;
}

const GALLERY = [
  { src: "/images/new/gameplay_grounds_ui.png", label: "Grasslands" },
  { src: "/images/new/gameplay_desert_ui.png", label: "Desert" },
  { src: "/images/new/gameplay_swamp_ui.png", label: "Swamp" },
  { src: "/images/new/gameplay_winter_ui.png", label: "Frontier" },
  { src: "/images/new/gameplay_volcano_ui.png", label: "Volcanic" },
  { src: "/images/new/gameplay_sandbox_ui.png", label: "Sandbox" },
] as const;

const SOCIAL_LINKS = [
  {
    href: "https://www.kevin-liu.tech/",
    label: "Portfolio",
    sub: "kevin-liu.tech",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={16}
        height={16}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    href: "https://github.com/Kevin-Liu-01",
    label: "GitHub",
    sub: "@Kevin-Liu-01",
    icon: (
      <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    href: "https://www.linkedin.com/in/kevin-liu-princeton/",
    label: "LinkedIn",
    sub: "kevin-liu-princeton",
    icon: (
      <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/kevskgs",
    label: "X / Twitter",
    sub: "@kevskgs",
    icon: (
      <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
] as const;

const ARCH_LAYERS = [
  {
    accentColor: "rgba(251,191,36,0.9)",
    accentGlow: "rgba(251,191,36,0.25)",
    bg: "linear-gradient(135deg, rgba(217,119,6,0.18) 0%, rgba(180,83,9,0.10) 100%)",
    border: "rgba(217,119,6,0.35)",
    icon: <Palette size={15} />,
    iconClass: "text-amber-400",
    items: [
      "Isometric Projection",
      "Sprite Animation",
      "Z-Sorting",
      "Shadow & Lighting",
      "Particle Effects",
    ],
    label: "Rendering Engine",
  },
  {
    accentColor: "rgba(251,146,60,0.9)",
    accentGlow: "rgba(251,146,60,0.20)",
    bg: "linear-gradient(135deg, rgba(234,88,12,0.15) 0%, rgba(180,60,9,0.08) 100%)",
    border: "rgba(234,88,12,0.30)",
    icon: <Zap size={15} />,
    iconClass: "text-orange-400",
    items: [
      "Tower AI",
      "Pathfinding",
      "Wave Orchestration",
      "Projectile Physics",
      "Hero & Spell Logic",
    ],
    label: "Game Systems",
  },
  {
    accentColor: "rgba(248,113,113,0.9)",
    accentGlow: "rgba(248,113,113,0.18)",
    bg: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(180,40,40,0.06) 100%)",
    border: "rgba(239,68,68,0.25)",
    icon: <Cpu size={15} />,
    iconClass: "text-red-400",
    items: [
      "Canvas Batching",
      "Offscreen Rendering",
      "Quality Scaling",
      "Object Pooling",
      "Frame Budgeting",
    ],
    label: "Performance Layer",
  },
] as const;

const TECH_STATS = [
  { label: "Towers", value: "7 Types" },
  { label: "Heroes", value: "9 Playable" },
  { label: "Levels", value: "26 Maps" },
  { label: "Enemies", value: "100+" },
  { label: "Engine", value: "Canvas 2D" },
  { label: "Framework", value: "Next.js" },
] as const;

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <BaseModal isOpen onClose={onClose} backdropBg={OVERLAY.black60}>
      <div
        className="relative w-full max-w-2xl max-h-[90dvh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: panelGradient,
          border: `2px solid ${GOLD.border35}`,
          boxShadow: `0 0 40px ${GOLD.glow07}, inset 0 0 30px ${GOLD.glow04}`,
        }}
      >
        <OrnateFrame
          className="relative w-full h-full overflow-hidden flex flex-col"
          cornerSize={48}
          showSideBorders={false}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
            style={{ borderColor: GOLD.border25 }}
          >
            <div>
              <h2 className="text-xl font-bold text-amber-200 tracking-wide">
                About This Project
              </h2>
              <p className="text-xs text-amber-200/40 mt-0.5">
                A Canvas API Technical Showcase
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/10 cursor-pointer"
            >
              <X size={20} className="text-amber-400" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Hero video */}
            <div
              className="relative rounded-xl overflow-hidden aspect-video"
              style={{ border: `1px solid ${GOLD.border25}` }}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster="/images/new/gameplay_grounds_ui.png"
              >
                <source src="/videos/sandbox.mp4" type="video/mp4" />
              </video>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.5) 100%)",
                }}
              />
              <span className="absolute bottom-2.5 left-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/50">
                Live Gameplay
              </span>
            </div>

            {/* Mission statement */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/30">
              <p className="text-sm text-amber-200/80 leading-relaxed">
                Princeton Tower Defense is a{" "}
                <strong className="text-amber-300">
                  tech demo and personal experiment
                </strong>{" "}
                exploring how far the browser&apos;s native Canvas 2D API can be
                pushed &mdash; building a fully performant, isometric pseudo-3D
                game engine with zero WebGL, zero game framework dependencies,
                and zero external rendering libraries. Every pixel is drawn
                through{" "}
                <code className="text-amber-400/90 bg-amber-900/40 px-1.5 py-0.5 rounded text-xs">
                  CanvasRenderingContext2D
                </code>
                .
              </p>
            </div>

            {/* Developer */}
            <div className="space-y-3">
              <SectionLabel text="Developer" />
              <div className="p-5 rounded-xl bg-amber-950/30 border border-amber-800/30">
                <div className="flex items-start gap-4">
                  <img
                    src="/images/kevin.png"
                    alt="Kevin Liu"
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    style={{
                      border: "2.5px solid rgba(251,191,36,0.4)",
                      boxShadow: "0 0 20px rgba(251,191,36,0.1)",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-amber-200 text-lg tracking-wide">
                      Kevin Liu
                    </div>
                    <div className="text-xs text-amber-200/45 mt-0.5">
                      Princeton University &apos;28 &middot; B.S.E. Computer
                      Science
                    </div>
                    <p className="text-[11px] text-amber-200/35 leading-relaxed mt-2">
                      Full-stack engineer and game developer. Built this entire
                      engine from scratch &mdash; isometric rendering,
                      pathfinding, projectile physics, wave AI, and 60fps
                      performance &mdash; all on a single Canvas 2D element.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-amber-950/30 border border-amber-800/15 hover:bg-amber-900/40 hover:border-amber-700/30 transition-colors group"
                    >
                      <span className="flex-shrink-0 text-amber-400/50 group-hover:text-amber-300/70 transition-colors">
                        {link.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-amber-200/70 truncate">
                          {link.label}
                        </div>
                        <div className="text-[8px] text-amber-200/30 truncate">
                          {link.sub}
                        </div>
                      </div>
                      <ExternalLink
                        size={9}
                        className="flex-shrink-0 text-amber-200/0 group-hover:text-amber-200/30 transition-colors ml-auto"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-3">
              <SectionLabel text="Every Region" />
              <div className="grid grid-cols-3 gap-2">
                {GALLERY.map((shot, i) => (
                  <button
                    key={shot.label}
                    onClick={() => setLightboxIdx(i)}
                    className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                    style={{ border: "1px solid rgba(180,140,60,0.15)" }}
                  >
                    <Image
                      src={shot.src}
                      alt={shot.label}
                      fill
                      sizes="(max-width:640px) 30vw, 180px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-200" />
                    <span
                      className="absolute bottom-1 left-1.5 text-[8px] font-semibold tracking-wide text-amber-200/70"
                      style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                    >
                      {shot.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Architecture Diagram */}
            <div className="space-y-3">
              <SectionLabel text="Architecture" />
              <div className="relative flex flex-col items-stretch">
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
                            <span className={layer.iconClass}>
                              {layer.icon}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-200/80">
                            {layer.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {layer.items.map((item) => (
                            <span
                              key={item}
                              className="px-2.5 py-1 text-[10px] font-medium rounded-md border"
                              style={{
                                background: "rgba(0,0,0,0.25)",
                                borderColor: layer.border,
                                boxShadow:
                                  "inset 0 1px 0 rgba(255,255,255,0.03)",
                                color: "rgba(253,230,138,0.7)",
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {TECH_STATS.map((s) => (
                <div
                  key={s.label}
                  className="text-center p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/20"
                >
                  <div className="text-sm font-bold text-amber-300/90">
                    {s.value}
                  </div>
                  <div className="text-[10px] text-amber-200/40 uppercase tracking-wider mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-3 border-t text-center flex-shrink-0"
            style={{ borderColor: GOLD.border25 }}
          >
            <p className="text-xs text-amber-200/30">
              A Canvas 2D tech demo &mdash; built at Princeton University
            </p>
          </div>
        </OrnateFrame>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center p-6 backdrop-blur-md cursor-pointer"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setLightboxIdx(null)}
        >
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden">
            <Image
              src={GALLERY[lightboxIdx].src}
              alt={GALLERY[lightboxIdx].label}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-6 right-6 p-2 rounded-full text-amber-400/60 hover:bg-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      )}
    </BaseModal>
  );
};

function ArchConnector() {
  return (
    <div className="flex flex-col items-center py-0.5">
      <div
        className="w-px h-2"
        style={{
          background:
            "linear-gradient(180deg, rgba(180,140,60,0.35), rgba(180,140,60,0.15))",
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
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
        }}
      />
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, boxShadow: `0 0 8px ${glowColor}` }}
      >
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <span
        className="text-[11px] font-bold uppercase tracking-widest"
        style={{ color: accentColor }}
      >
        {label}
      </span>
      <span
        className="ml-auto text-[10px] font-medium"
        style={{ color: `${accentColor}`.replace(/[\d.]+\)$/, "0.4)") }}
      >
        {sublabel}
      </span>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
      <span className="text-xs font-bold uppercase tracking-widest text-amber-500/60">
        {text}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
    </div>
  );
}
