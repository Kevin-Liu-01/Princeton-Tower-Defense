"use client";
import { X, ExternalLink, Github, Globe } from "lucide-react";
import React, { useEffect, useCallback } from "react";

import { LANDING_THEME } from "./landingConstants";

const T = LANDING_THEME;

interface LandingCreditsModalProps {
  onClose: () => void;
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-px flex-1"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${T.accentDarkRgb},0.3), transparent)`,
        }}
      />
      <span
        className="text-[10px] font-bold uppercase tracking-[0.25em]"
        style={{ color: `rgba(${T.accentRgb},0.4)` }}
      >
        {text}
      </span>
      <div
        className="h-px flex-1"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${T.accentDarkRgb},0.3), transparent)`,
        }}
      />
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
      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group"
      style={{
        background: `rgba(${T.accentDarkRgb},0.08)`,
        border: `1px solid rgba(${T.accentDarkRgb},0.15)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `rgba(${T.accentDarkRgb},0.16)`;
        e.currentTarget.style.borderColor = `rgba(${T.accentDarkRgb},0.3)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `rgba(${T.accentDarkRgb},0.08)`;
        e.currentTarget.style.borderColor = `rgba(${T.accentDarkRgb},0.15)`;
      }}
    >
      <div style={{ color: `rgba(${T.accentRgb},0.5)` }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-medium"
          style={{ color: `rgba(${T.accentRgb},0.8)` }}
        >
          {label}
        </div>
        <div className="text-xs" style={{ color: `rgba(${T.accentRgb},0.35)` }}>
          {description}
        </div>
      </div>
      <ExternalLink
        size={14}
        style={{ color: `rgba(${T.accentRgb},0.2)` }}
        className="flex-shrink-0"
      />
    </a>
  );
}

const TECH_ITEMS = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Canvas 2D API",
  "Tailwind CSS",
  "Framer Motion",
] as const;

export function LandingCreditsModal({ onClose }: LandingCreditsModalProps) {
  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={handleBackdrop}
    >
      <div
        className="relative w-full max-w-lg max-h-[85dvh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          animation: "landing-credits-enter 0.3s ease-out",
          background: `linear-gradient(160deg, rgba(${T.bgRgb},0.98) 0%, rgba(20,14,6,0.99) 100%)`,
          border: `1.5px solid rgba(${T.accentDarkRgb},0.3)`,
          boxShadow: `0 0 60px rgba(${T.accentRgb},0.1), 0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}
      >
        {/* Top edge glow */}
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${T.accentRgb},0.3), transparent)`,
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: `rgba(${T.accentDarkRgb},0.2)` }}
        >
          <div>
            <h2
              className="text-lg font-bold tracking-wide"
              style={{ color: T.accent }}
            >
              Credits
            </h2>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: `rgba(${T.accentRgb},0.3)` }}
            >
              A Canvas 2D Technical Showcase
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: `rgba(${T.accentRgb},0.5)` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `rgba(${T.accentDarkRgb},0.2)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 no-scrollbar">
          {/* Developer */}
          <div className="space-y-3">
            <SectionLabel text="Developer" />
            <div
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: `rgba(${T.accentDarkRgb},0.08)`,
                border: `1px solid rgba(${T.accentDarkRgb},0.15)`,
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${T.accentBright}, ${T.accentDark})`,
                  color: T.bg,
                }}
              >
                KL
              </div>
              <div className="min-w-0">
                <div
                  className="font-semibold text-base"
                  style={{ color: `rgba(${T.accentRgb},0.9)` }}
                >
                  Kevin Liu
                </div>
                <div
                  className="text-xs"
                  style={{ color: `rgba(${T.accentRgb},0.4)` }}
                >
                  Princeton University &apos;28, B.S.E. Computer Science
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="space-y-3">
            <SectionLabel text="About" />
            <p
              className="text-xs leading-relaxed"
              style={{ color: `rgba(${T.accentRgb},0.55)` }}
            >
              Princeton Tower Defense is a technical experiment pushing the
              browser&apos;s native Canvas 2D API to its limits &mdash; a fully
              performant isometric pseudo-3D game engine with zero WebGL, zero
              game framework dependencies, and zero external rendering
              libraries.
            </p>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <SectionLabel text="Built With" />
            <div className="flex flex-wrap gap-2">
              {TECH_ITEMS.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 text-[10px] font-medium rounded-lg"
                  style={{
                    background: `rgba(${T.accentDarkRgb},0.1)`,
                    border: `1px solid rgba(${T.accentDarkRgb},0.18)`,
                    color: `rgba(${T.accentRgb},0.6)`,
                  }}
                >
                  {item}
                </span>
              ))}
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
          style={{ borderColor: `rgba(${T.accentDarkRgb},0.15)` }}
        >
          <p
            className="text-[10px]"
            style={{ color: `rgba(${T.accentRgb},0.2)` }}
          >
            Made with care at Princeton University
          </p>
        </div>
      </div>
    </div>
  );
}
