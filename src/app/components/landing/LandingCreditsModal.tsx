"use client";
import { X, ExternalLink } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useCallback, useState } from "react";

import { LANDING_THEME } from "./landingConstants";

const T = LANDING_THEME;

const GALLERY = [
  { src: "/images/new/gameplay_grounds_ui.png", label: "Grasslands" },
  { src: "/images/new/gameplay_desert_ui.png", label: "Desert Sands" },
  { src: "/images/new/gameplay_swamp_ui.png", label: "Murky Swamp" },
  { src: "/images/new/gameplay_winter_ui.png", label: "Frozen Frontier" },
  { src: "/images/new/gameplay_volcano_ui.png", label: "Volcanic Realm" },
  { src: "/images/new/gameplay_sandbox_ui.png", label: "Sandbox Arena" },
] as const;

const SOCIAL_LINKS = [
  {
    href: "https://www.kevin-liu.tech/",
    label: "Portfolio",
    sub: "kevin-liu.tech",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={18}
        height={18}
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
      <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    href: "https://www.linkedin.com/in/kevin-liu-princeton/",
    label: "LinkedIn",
    sub: "kevin-liu-princeton",
    icon: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/kevskgs",
    label: "X / Twitter",
    sub: "@kevskgs",
    icon: (
      <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://devpost.com/Kevin-Liu-01",
    label: "Devpost",
    sub: "Kevin-Liu-01",
    icon: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
        <path d="M6.002 1.61L0 12.004 6.002 22.39h11.996L24 12.004 17.998 1.61zm1.593 4.084h3.947c3.605 0 6.276 1.695 6.276 6.31 0 4.436-3.21 6.302-6.456 6.302H7.595zm2.517 2.449v7.714h1.241c2.646 0 3.862-1.55 3.862-3.861.009-2.569-1.096-3.853-3.767-3.853z" />
      </svg>
    ),
  },
  {
    href: "https://kevin-liu-01.itch.io/",
    label: "itch.io",
    sub: "kevin-liu-01",
    icon: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
        <path d="M3.13 1.338C2.08 1.96.02 4.328 0 4.95v1.03c0 1.303 1.22 2.45 2.325 2.45 1.33 0 2.436-1.09 2.436-2.36 0 1.27 1.07 2.36 2.4 2.36 1.328 0 2.362-1.09 2.362-2.36 0 1.27 1.1 2.36 2.43 2.36h.5c1.33 0 2.43-1.09 2.43-2.36 0 1.27 1.034 2.36 2.362 2.36 1.33 0 2.4-1.09 2.4-2.36 0 1.27 1.105 2.36 2.436 2.36C22.78 8.43 24 7.282 24 5.98V4.95c-.02-.62-2.08-2.99-3.13-3.612C18.86.01 14.663 0 12 0 9.337 0 5.14.01 3.13 1.338zm-.18 7.79c-.592.6-1.41.975-2.304 1.018v8.63C.647 21.564 3.236 24 5.77 24h12.46c2.535 0 5.124-2.436 5.124-5.224v-8.63c-.893-.043-1.712-.418-2.304-1.018-.6.616-1.437 1.004-2.35 1.018-.915-.014-1.752-.402-2.353-1.018-.603.616-1.44 1.004-2.355 1.018-.914-.014-1.75-.402-2.353-1.018-.602.616-1.438 1.004-2.353 1.018-.914-.014-1.75-.402-2.352-1.018-.6.616-1.436 1.004-2.35 1.018zM8.996 13.1h6.008v4.455H8.996z" />
      </svg>
    ),
  },
] as const;

const TECH_ITEMS = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Canvas 2D API",
  "Tailwind CSS",
  "Framer Motion",
] as const;

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

export function LandingCreditsModal({ onClose }: { onClose: () => void }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

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
        if (lightboxIdx !== null) {
          setLightboxIdx(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, lightboxIdx]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={handleBackdrop}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90dvh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          animation: "landing-credits-enter 0.3s ease-out",
          background: `linear-gradient(160deg, rgba(${T.bgRgb},0.98) 0%, rgba(20,14,6,0.99) 100%)`,
          border: `1.5px solid rgba(${T.accentDarkRgb},0.3)`,
          boxShadow: `0 0 60px rgba(${T.accentRgb},0.1), 0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}
      >
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${T.accentRgb},0.3), transparent)`,
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
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
            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white/10"
            style={{ color: `rgba(${T.accentRgb},0.5)` }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 no-scrollbar">
          {/* Hero video */}
          <div className="relative rounded-xl overflow-hidden aspect-video">
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
                  "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)",
              }}
            />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: `rgba(${T.accentRgb},0.6)` }}
              >
                Live Gameplay
              </span>
            </div>
          </div>

          {/* Developer card */}
          <div className="space-y-3">
            <SectionLabel text="Developer" />
            <div
              className="relative p-5 rounded-xl overflow-hidden"
              style={{
                background: `rgba(${T.accentDarkRgb},0.08)`,
                border: `1px solid rgba(${T.accentDarkRgb},0.18)`,
              }}
            >
              <div className="flex items-start gap-4">
                <img
                  src="/images/kevin.png"
                  alt="Kevin Liu"
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  style={{
                    border: `2.5px solid rgba(${T.accentRgb},0.35)`,
                    boxShadow: `0 0 20px rgba(${T.accentRgb},0.1)`,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className="font-bold text-lg tracking-wide"
                    style={{ color: `rgba(${T.accentRgb},0.95)` }}
                  >
                    Kevin Liu
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: `rgba(${T.accentRgb},0.45)` }}
                  >
                    Princeton University &apos;28 &middot; B.S.E. Computer
                    Science
                  </div>
                  <p
                    className="text-[11px] leading-relaxed mt-2.5"
                    style={{ color: `rgba(${T.accentRgb},0.4)` }}
                  >
                    Full-stack engineer and game developer. Built this entire
                    engine from scratch using only the browser&apos;s Canvas 2D
                    API &mdash; no WebGL, no game frameworks, no sprite sheets.
                  </p>
                </div>
              </div>

              {/* Social links grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 group"
                    style={{
                      background: `rgba(${T.accentDarkRgb},0.06)`,
                      border: `1px solid rgba(${T.accentDarkRgb},0.12)`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `rgba(${T.accentDarkRgb},0.18)`;
                      e.currentTarget.style.borderColor = `rgba(${T.accentDarkRgb},0.3)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `rgba(${T.accentDarkRgb},0.06)`;
                      e.currentTarget.style.borderColor = `rgba(${T.accentDarkRgb},0.12)`;
                    }}
                  >
                    <span
                      className="flex-shrink-0 transition-colors duration-200"
                      style={{ color: `rgba(${T.accentRgb},0.4)` }}
                    >
                      {link.icon}
                    </span>
                    <div className="min-w-0">
                      <div
                        className="text-[11px] font-semibold truncate"
                        style={{ color: `rgba(${T.accentRgb},0.75)` }}
                      >
                        {link.label}
                      </div>
                      <div
                        className="text-[9px] truncate"
                        style={{ color: `rgba(${T.accentRgb},0.3)` }}
                      >
                        {link.sub}
                      </div>
                    </div>
                    <ExternalLink
                      size={10}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                      style={{ color: `rgba(${T.accentRgb},0.3)` }}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Screenshot gallery */}
          <div className="space-y-3">
            <SectionLabel text="Every Region" />
            <div className="grid grid-cols-3 gap-2">
              {GALLERY.map((shot, i) => (
                <button
                  key={shot.label}
                  onClick={() => setLightboxIdx(i)}
                  className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                  style={{
                    border: `1px solid rgba(${T.accentDarkRgb},0.15)`,
                  }}
                >
                  <Image
                    src={shot.src}
                    alt={shot.label}
                    fill
                    sizes="(max-width:640px) 30vw, 200px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 transition-opacity duration-200 group-hover:opacity-0"
                    style={{ background: "rgba(0,0,0,0.15)" }}
                  />
                  <span
                    className="absolute bottom-1 left-1.5 text-[9px] font-semibold tracking-wide"
                    style={{
                      color: `rgba(${T.accentRgb},0.7)`,
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {shot.label}
                  </span>
                </button>
              ))}
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
              libraries. Every pixel is hand-drawn through{" "}
              <code
                className="px-1 py-0.5 rounded text-[10px]"
                style={{
                  background: `rgba(${T.accentDarkRgb},0.15)`,
                  color: `rgba(${T.accentRgb},0.7)`,
                }}
              >
                CanvasRenderingContext2D
              </code>
              .
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
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 border-t text-center flex-shrink-0"
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

      {/* Lightbox overlay */}
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
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
            style={{ color: `rgba(${T.accentRgb},0.6)` }}
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
