"use client";
import {
  Star,
  Crown,
  Clock,
  Heart,
  Swords,
  Shield,
  Trophy,
  Sparkles,
  Share2,
  ChevronDown,
  ExternalLink,
  Github,
  Globe,
  Flame,
  MapPin,
  Zap,
  Check,
} from "lucide-react";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import type { CumulativeCampaignStats } from "../../game/campaignStats";
import type { EventStats } from "../../hooks/useGameEventLog";
import { SITE_URL, SITE_AUTHOR } from "../../seo/constants";
import { OrnateFrame } from "../ui/primitives/OrnateFrame";
import { GOLD, DIVIDER, OVERLAY, panelGradient } from "../ui/system/theme";
import { formatDuration } from "./shared/menuMath";

// =============================================================================
// TYPES
// =============================================================================

interface CampaignVictoryScreenProps {
  cumulativeStats: CumulativeCampaignStats;
  sessionStats: EventStats;
  finalLevelTime: number;
  finalLevelLives: number;
  resetGame: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SECTION_DELAY_MS = 400;
const STAT_STAGGER_MS = 80;

const REGION_ICONS = [MapPin, Flame, Zap, Shield, Crown];

const CREDITS_LINKS = [
  {
    description: "Portfolio",
    href: "https://www.kevin-liu.tech/",
    icon: Globe,
    label: "kevin-liu.tech",
  },
  {
    description: "GitHub",
    href: "https://github.com/Kevin-Liu-01/Princeton-Tower-Defense",
    icon: Github,
    label: "Source Code",
  },
];

// =============================================================================
// ANIMATED CROWN CANVAS
// =============================================================================

function CampaignTrophyCanvas({ size = 120 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    function draw() {
      if (!ctx) {
        return;
      }
      const t = timeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const s = size / 120;

      // Radial glow
      const glowAlpha = 0.2 + Math.sin(t * 1.8) * 0.08;
      const glow = ctx.createRadialGradient(cx, cy, 5 * s, cx, cy, 55 * s);
      glow.addColorStop(0, `rgba(255,200,50,${glowAlpha})`);
      glow.addColorStop(0.6, `rgba(255,160,30,${glowAlpha * 0.3})`);
      glow.addColorStop(1, "rgba(255,160,30,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size, size);

      // Rotating rays
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.3);
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const alpha = 0.06 + Math.sin(t * 2 + i) * 0.03;
        ctx.fillStyle = `rgba(255,215,0,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(angle - 0.08) * 50 * s,
          Math.sin(angle - 0.08) * 50 * s
        );
        ctx.lineTo(
          Math.cos(angle + 0.08) * 50 * s,
          Math.sin(angle + 0.08) * 50 * s
        );
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Crown body
      const crownY = cy - 8 * s;
      const pulse = 1 + Math.sin(t * 2) * 0.02;
      ctx.save();
      ctx.translate(cx, crownY);
      ctx.scale(pulse, pulse);

      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 15 * s;

      const bodyGrad = ctx.createLinearGradient(-35 * s, 0, 35 * s, 0);
      bodyGrad.addColorStop(0, "#8b6914");
      bodyGrad.addColorStop(0.2, "#daa520");
      bodyGrad.addColorStop(0.5, "#ffe66d");
      bodyGrad.addColorStop(0.8, "#daa520");
      bodyGrad.addColorStop(1, "#8b6914");
      ctx.fillStyle = bodyGrad;

      // Crown shape
      ctx.beginPath();
      ctx.moveTo(-32 * s, 18 * s);
      ctx.lineTo(-35 * s, -8 * s);
      ctx.lineTo(-22 * s, 2 * s);
      ctx.lineTo(-11 * s, -18 * s);
      ctx.lineTo(0, -2 * s);
      ctx.lineTo(11 * s, -18 * s);
      ctx.lineTo(22 * s, 2 * s);
      ctx.lineTo(35 * s, -8 * s);
      ctx.lineTo(32 * s, 18 * s);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;

      // Crown band
      const bandGrad = ctx.createLinearGradient(
        -30 * s,
        12 * s,
        30 * s,
        12 * s
      );
      bandGrad.addColorStop(0, "#6b4f10");
      bandGrad.addColorStop(0.5, "#b8860b");
      bandGrad.addColorStop(1, "#6b4f10");
      ctx.fillStyle = bandGrad;
      ctx.fillRect(-30 * s, 12 * s, 60 * s, 7 * s);

      // Jewels on crown points
      const jewels = [
        { color: "#dc143c", x: -11 * s, y: -14 * s },
        { color: "#4169e1", x: 0, y: 2 * s },
        { color: "#50c878", x: 11 * s, y: -14 * s },
      ];
      for (const j of jewels) {
        const jGrad = ctx.createRadialGradient(
          j.x - 1 * s,
          j.y - 1 * s,
          0,
          j.x,
          j.y,
          4 * s
        );
        jGrad.addColorStop(0, "#fff");
        jGrad.addColorStop(0.3, j.color);
        jGrad.addColorStop(1, "#000");
        ctx.fillStyle = jGrad;
        ctx.beginPath();
        ctx.arc(j.x, j.y, 3.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Band jewels (small diamonds)
      ctx.fillStyle = "#ffec8b";
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        const bx = i * 12 * s;
        const by = 15.5 * s;
        ctx.moveTo(bx, by - 2 * s);
        ctx.lineTo(bx + 2 * s, by);
        ctx.lineTo(bx, by + 2 * s);
        ctx.lineTo(bx - 2 * s, by);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // Orbiting sparkles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 1.2;
        const dist = (42 + Math.sin(t * 2.5 + i * 1.5) * 8) * s;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy - 5 * s + Math.sin(angle) * dist * 0.5;
        const alpha = 0.35 + Math.sin(t * 3 + i * 2) * 0.35;
        const sparkSize = (2 + Math.sin(t * 2.5 + i) * 1.2) * s;
        if (alpha > 0.1) {
          ctx.fillStyle = `rgba(255,236,139,${alpha})`;
          ctx.fillRect(
            sx - sparkSize * 0.15,
            sy - sparkSize,
            sparkSize * 0.3,
            sparkSize * 2
          );
          ctx.fillRect(
            sx - sparkSize,
            sy - sparkSize * 0.15,
            sparkSize * 2,
            sparkSize * 0.3
          );
        }
      }

      timeRef.current += 0.016;
      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [size]);

  return <canvas ref={canvasRef} style={{ height: size, width: size }} />;
}

// =============================================================================
// FIREWORKS PARTICLE LAYER
// =============================================================================

function FireworksLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }

    const particles: Particle[] = [];
    const colors = [
      "#ffd700",
      "#ff6b6b",
      "#4ade80",
      "#60a5fa",
      "#c084fc",
      "#fb923c",
      "#f472b6",
    ];
    let nextBurst = 0;

    function burst(bx: number, by: number) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const count = 20 + Math.floor(Math.random() * 15);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const speed = 1.5 + Math.random() * 3;
        particles.push({
          color,
          life: 1,
          maxLife: 60 + Math.random() * 40,
          size: 1.5 + Math.random() * 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          x: bx,
          y: by,
        });
      }
    }

    function draw() {
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, w(), h());

      if (nextBurst <= 0) {
        burst(
          50 + Math.random() * (w() - 100),
          30 + Math.random() * (h() * 0.5)
        );
        nextBurst = 50 + Math.random() * 80;
      }
      nextBurst--;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.vx *= 0.99;
        p.life++;

        const progress = p.life / p.maxLife;
        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = 1 - progress;
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fill();

        if (alpha > 0.4) {
          ctx.globalAlpha = alpha * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

// =============================================================================
// ANIMATED SECTION WRAPPER
// =============================================================================

function AnimatedSection({
  delay,
  children,
}: {
  delay: number;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      {children}
    </div>
  );
}

// =============================================================================
// STAT COUNTER (animated number)
// =============================================================================

function AnimatedCounter({
  target,
  duration = 1500,
  suffix = "",
}: {
  target: number;
  duration?: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setDisplay(0);
      return;
    }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}

// =============================================================================
// SHARE BUTTONS
// =============================================================================

function ShareButtons({
  totalStars,
  maxStars,
}: {
  totalStars: number;
  maxStars: number;
}) {
  const [copied, setCopied] = useState(false);

  const shareText = useMemo(
    () =>
      `I completed the Princeton Tower Defense campaign with ${totalStars}/${maxStars} stars! ⭐⚔️🐅\n\nThink you can beat it? 👇`,
    [totalStars, maxStars]
  );

  const twitterUrl = useMemo(
    () =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(`${SITE_URL}/`)}&hashtags=${encodeURIComponent("gamedev,indiegame,towerdefense,princeton")}`,
    [shareText]
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${SITE_URL}/`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) {
      return;
    }
    try {
      await navigator.share({
        text: shareText,
        title: "Princeton Tower Defense - Campaign Complete!",
        url: `${SITE_URL}/`,
      });
    } catch {
      /* cancelled */
    }
  }, [shareText]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {/* Twitter/X */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 hover:brightness-110"
        style={{
          background:
            "linear-gradient(135deg, rgba(29,155,240,0.25), rgba(29,155,240,0.15))",
          border: "1px solid rgba(29,155,240,0.4)",
          color: "rgba(29,155,240,0.9)",
        }}
      >
        <span>𝕏</span>
        Share on X
        <ExternalLink size={11} />
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
        style={{
          background:
            "linear-gradient(135deg, rgba(180,140,60,0.2), rgba(180,140,60,0.1))",
          border: `1px solid ${GOLD.border25}`,
          color: "rgba(252,211,77,0.8)",
        }}
      >
        {copied ? <Check size={12} /> : <Share2 size={12} />}
        {copied ? "Copied!" : "Copy Link"}
      </button>

      {/* Native share (mobile) */}
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
          style={{
            background:
              "linear-gradient(135deg, rgba(74,222,128,0.2), rgba(74,222,128,0.1))",
            border: "1px solid rgba(74,222,128,0.35)",
            color: "rgba(74,222,128,0.9)",
          }}
        >
          <Share2 size={12} />
          Share
        </button>
      )}
    </div>
  );
}

// =============================================================================
// SECTION LABEL
// =============================================================================

function SectionLabel({
  text,
  icon: Icon,
}: {
  text: string;
  icon?: typeof Crown;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-px flex-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${GOLD.border35}, transparent)`,
        }}
      />
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-amber-500/60" />}
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/60">
          {text}
        </span>
      </div>
      <div
        className="h-px flex-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${GOLD.border35}, transparent)`,
        }}
      />
    </div>
  );
}

// =============================================================================
// STAT CARD
// =============================================================================

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  delay,
}: {
  icon: typeof Clock;
  label: string;
  value: React.ReactNode;
  subValue?: string;
  color: string;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className="rounded-xl p-3 transition-all duration-500"
      style={{
        background: `linear-gradient(135deg, ${color}18, ${color}0a)`,
        border: `1px solid ${color}40`,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.85)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} style={{ color: `${color}cc` }} />
        <span
          className="text-[9px] font-bold tracking-[0.2em] uppercase"
          style={{ color: `${color}99` }}
        >
          {label}
        </span>
      </div>
      <div
        className="text-lg font-black"
        style={{ color: `${color}dd`, textShadow: `0 0 12px ${color}30` }}
      >
        {value}
      </div>
      {subValue && (
        <span
          className="text-[9px] mt-0.5 block"
          style={{ color: `${color}66` }}
        >
          {subValue}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CampaignVictoryScreen({
  cumulativeStats,
  sessionStats,
  finalLevelTime,
  finalLevelLives,
  resetGame,
}: CampaignVictoryScreenProps) {
  const [showContent, setShowContent] = useState(false);
  const [scrollHint, setScrollHint] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRef.current && scrollRef.current.scrollTop > 40) {
      setScrollHint(false);
    }
  }, []);

  const {
    totalStars,
    maxStars,
    totalBestTime,
    totalTimesPlayed,
    totalTimesWon,
    perfectLevels,
    levelsCompleted,
    totalLevels,
    bestOverallHearts,
    regionStats,
  } = cumulativeStats;

  const baseDelay = 600;

  return (
    <div
      className="absolute inset-0 z-[500] flex flex-col items-center overflow-hidden pointer-events-auto"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(50,35,15,0.98), rgba(12,9,5,0.99))",
      }}
    >
      {/* Fireworks */}
      <FireworksLayer />

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`relative z-10 w-full h-full overflow-y-auto transition-opacity duration-1000 ${showContent ? "opacity-100" : "opacity-0"}`}
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="max-w-lg w-full mx-auto px-4 py-6 flex flex-col gap-5">
          {/* ===== HEADER ===== */}
          <AnimatedSection delay={0}>
            <div className="flex flex-col items-center">
              <CampaignTrophyCanvas size={100} />

              <h1
                className="text-3xl sm:text-4xl font-black tracking-[0.2em] mt-1"
                style={{
                  color: "#fcd34d",
                  textShadow:
                    "0 0 60px rgba(252,211,77,0.5), 0 0 25px rgba(252,211,77,0.3), 0 3px 0 #7a5c10, 0 4px 10px rgba(0,0,0,0.8)",
                }}
              >
                CAMPAIGN
              </h1>
              <h2
                className="text-xl sm:text-2xl font-black tracking-[0.3em] -mt-0.5"
                style={{
                  color: "#ffe4a0",
                  textShadow: "0 0 40px rgba(252,211,77,0.3), 0 2px 0 #7a5c10",
                }}
              >
                COMPLETE
              </h2>

              <div className="flex items-center gap-3 mt-3 w-full px-6">
                <div
                  className="flex-1 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${DIVIDER.gold50} 30%, ${GOLD.bright60})`,
                  }}
                />
                <div
                  className="p-1.5 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD.border30}, rgba(120,80,20,0.2))`,
                    border: `1px solid ${GOLD.border40}`,
                  }}
                >
                  <Crown size={14} className="text-amber-400" />
                </div>
                <div
                  className="flex-1 h-px"
                  style={{
                    background: `linear-gradient(90deg, ${GOLD.bright60}, ${DIVIDER.gold50} 70%, transparent)`,
                  }}
                />
              </div>

              <p className="text-xs text-amber-400/60 italic text-center mt-2 px-6 leading-relaxed max-w-md">
                &ldquo;Against all odds, through fire and frost, across desert
                and marsh &mdash; the realm stands defended. Your name shall
                echo through the halls of Princeton for eternity.&rdquo;
              </p>
            </div>
          </AnimatedSection>

          {/* ===== OVERALL STAR RATING ===== */}
          <AnimatedSection delay={baseDelay}>
            <OrnateFrame className="rounded-2xl" cornerSize={36} showBorders>
              <div
                className="rounded-2xl p-4"
                style={{
                  background: panelGradient,
                  border: `2px solid ${GOLD.border35}`,
                  boxShadow: `inset 0 0 25px ${GOLD.glow07}, 0 6px 30px ${OVERLAY.black60}`,
                }}
              >
                <SectionLabel text="Campaign Rating" icon={Trophy} />

                <div className="flex items-center justify-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    {[...Array(3)].map((_, i) => {
                      const filled = totalStars >= totalLevels * (i + 1);
                      return (
                        <Star
                          key={i}
                          size={28}
                          className={
                            filled
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                              : "text-amber-900/40"
                          }
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="text-center mt-2">
                  <span
                    className="text-2xl font-black text-amber-300"
                    style={{ textShadow: "0 0 15px rgba(252,211,77,0.3)" }}
                  >
                    <AnimatedCounter target={totalStars} />
                  </span>
                  <span className="text-sm text-amber-400/50 font-bold">
                    {" "}
                    / {maxStars}
                  </span>
                  <span className="text-[10px] text-amber-400/40 block mt-0.5 tracking-wider uppercase">
                    Total Stars Earned
                  </span>
                </div>

                {/* Perfect levels */}
                {perfectLevels > 0 && (
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <Sparkles size={12} className="text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-300/70 tracking-wider">
                      {perfectLevels} Perfect (3-Star) Level
                      {perfectLevels !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </OrnateFrame>
          </AnimatedSection>

          {/* ===== CUMULATIVE STATS GRID ===== */}
          <AnimatedSection delay={baseDelay + SECTION_DELAY_MS}>
            <SectionLabel text="Campaign Stats" icon={Swords} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <StatCard
                icon={Clock}
                label="Total Time"
                color="#60a5fa"
                value={formatDuration(totalBestTime)}
                subValue="Sum of best times"
                delay={baseDelay + SECTION_DELAY_MS + STAT_STAGGER_MS}
              />
              <StatCard
                icon={Heart}
                label="Hearts Saved"
                color="#f87171"
                value={<AnimatedCounter target={bestOverallHearts} />}
                subValue="Sum of best hearts"
                delay={baseDelay + SECTION_DELAY_MS + STAT_STAGGER_MS * 2}
              />
              <StatCard
                icon={Swords}
                label="Battles Won"
                color="#4ade80"
                value={
                  <>
                    <AnimatedCounter target={totalTimesWon} /> /{" "}
                    <AnimatedCounter target={totalTimesPlayed} />
                  </>
                }
                subValue="Wins / Total attempts"
                delay={baseDelay + SECTION_DELAY_MS + STAT_STAGGER_MS * 3}
              />
              <StatCard
                icon={Shield}
                label="Levels Cleared"
                color="#c084fc"
                value={
                  <>
                    <AnimatedCounter target={levelsCompleted} /> / {totalLevels}
                  </>
                }
                delay={baseDelay + SECTION_DELAY_MS + STAT_STAGGER_MS * 4}
              />
            </div>
          </AnimatedSection>

          {/* ===== FINAL BATTLE STATS ===== */}
          <AnimatedSection delay={baseDelay + SECTION_DELAY_MS * 2}>
            <SectionLabel text="Final Battle — Obsidian Throne" icon={Flame} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <StatCard
                icon={Clock}
                label="Time"
                color="#60a5fa"
                value={formatDuration(finalLevelTime)}
                delay={baseDelay + SECTION_DELAY_MS * 2 + STAT_STAGGER_MS}
              />
              <StatCard
                icon={Heart}
                label="Lives"
                color="#f87171"
                value={<>{finalLevelLives}/20</>}
                delay={baseDelay + SECTION_DELAY_MS * 2 + STAT_STAGGER_MS * 2}
              />
              <StatCard
                icon={Swords}
                label="Enemies Slain"
                color="#fb923c"
                value={<AnimatedCounter target={sessionStats.enemiesKilled} />}
                delay={baseDelay + SECTION_DELAY_MS * 2 + STAT_STAGGER_MS * 3}
              />
              <StatCard
                icon={Zap}
                label="Towers Built"
                color="#a78bfa"
                value={<AnimatedCounter target={sessionStats.towersBuilt} />}
                delay={baseDelay + SECTION_DELAY_MS * 2 + STAT_STAGGER_MS * 4}
              />
            </div>
          </AnimatedSection>

          {/* ===== REGION BREAKDOWN ===== */}
          <AnimatedSection delay={baseDelay + SECTION_DELAY_MS * 3}>
            <SectionLabel text="Region Progress" icon={MapPin} />
            <div className="flex flex-col gap-1.5 mt-2">
              {regionStats.map((r, i) => {
                const Icon = REGION_ICONS[i % REGION_ICONS.length];
                const pct = r.maxStars > 0 ? (r.stars / r.maxStars) * 100 : 0;
                return (
                  <div
                    key={r.region}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(120,80,20,0.12), rgba(180,140,60,0.14), rgba(120,80,20,0.12))",
                      border: "1px solid rgba(180,140,60,0.2)",
                    }}
                  >
                    <Icon size={14} className="text-amber-400/60 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-300/80 tracking-wider uppercase truncate">
                          {r.region}
                        </span>
                        <span className="text-[10px] font-bold text-amber-400/60 ml-2 shrink-0">
                          {r.stars}/{r.maxStars}
                        </span>
                      </div>
                      <div
                        className="h-1.5 mt-1 rounded-full overflow-hidden"
                        style={{ background: "rgba(0,0,0,0.3)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            background: r.completed
                              ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                              : "linear-gradient(90deg, rgba(251,191,36,0.5), rgba(245,158,11,0.3))",
                            boxShadow: r.completed
                              ? "0 0 8px rgba(251,191,36,0.3)"
                              : undefined,
                            width: `${pct}%`,
                          }}
                        />
                      </div>
                    </div>
                    {r.completed && (
                      <Star
                        size={12}
                        className="text-amber-400 fill-amber-400 shrink-0"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </AnimatedSection>

          {/* ===== SHARE ===== */}
          <AnimatedSection delay={baseDelay + SECTION_DELAY_MS * 4}>
            <OrnateFrame className="rounded-2xl" cornerSize={32} showBorders>
              <div
                className="rounded-2xl p-4"
                style={{
                  background: panelGradient,
                  border: `2px solid ${GOLD.border35}`,
                  boxShadow: `inset 0 0 20px ${GOLD.glow04}`,
                }}
              >
                <SectionLabel text="Share Your Victory" icon={Share2} />
                <p className="text-[10px] text-amber-400/50 text-center mt-2 mb-3">
                  Let the world know the realm is safe
                </p>
                <ShareButtons totalStars={totalStars} maxStars={maxStars} />
              </div>
            </OrnateFrame>
          </AnimatedSection>

          {/* ===== CREDITS ===== */}
          <AnimatedSection delay={baseDelay + SECTION_DELAY_MS * 5}>
            <OrnateFrame className="rounded-2xl" cornerSize={32} showBorders>
              <div
                className="rounded-2xl p-4"
                style={{
                  background: panelGradient,
                  border: `2px solid ${GOLD.border35}`,
                  boxShadow: `inset 0 0 20px ${GOLD.glow04}`,
                }}
              >
                <SectionLabel text="Credits" icon={Sparkles} />

                <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-amber-950/30 border border-amber-800/25">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-amber-900 shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #fbbf24, #d97706)",
                    }}
                  >
                    KL
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-amber-200 text-sm">
                      {SITE_AUTHOR}
                    </div>
                    <div className="text-[10px] text-amber-200/45">
                      Princeton University &apos;28, B.S.E. in Computer Science
                    </div>
                    <div className="text-[10px] text-amber-200/35 mt-0.5">
                      Design, Development & Art Direction
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-3">
                  {CREDITS_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-950/15 border border-amber-800/15 hover:bg-amber-900/25 hover:border-amber-700/35 transition-colors group"
                    >
                      <link.icon
                        size={14}
                        className="text-amber-400/60 group-hover:text-amber-300 transition-colors shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-amber-200/70 group-hover:text-amber-200 transition-colors">
                          {link.label}
                        </div>
                        <div className="text-[10px] text-amber-200/35">
                          {link.description}
                        </div>
                      </div>
                      <ExternalLink
                        size={11}
                        className="text-amber-200/15 group-hover:text-amber-200/40 transition-colors shrink-0"
                      />
                    </a>
                  ))}
                </div>

                <p className="text-[10px] text-amber-200/25 text-center mt-3 italic">
                  Built with Canvas 2D, Next.js, React & TypeScript &mdash; no
                  game engine required.
                </p>
              </div>
            </OrnateFrame>
          </AnimatedSection>

          {/* ===== RETURN BUTTON ===== */}
          <AnimatedSection delay={baseDelay + SECTION_DELAY_MS * 6}>
            <div className="flex justify-center pb-6">
              <button
                onClick={resetGame}
                className="group relative px-8 py-3 rounded-xl font-bold tracking-[0.2em] uppercase text-sm transition-all duration-200 hover:scale-105 hover:brightness-110"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(180,130,30,0.92), rgba(120,78,15,0.95))",
                  border: `1.5px solid ${GOLD.bright60}`,
                  boxShadow: `inset 0 1px 0 ${OVERLAY.white15}, 0 4px 20px ${OVERLAY.black40}, 0 0 30px rgba(180,140,60,0.2)`,
                  color: "#fff2c8",
                  textShadow:
                    "0 0 12px rgba(252,211,77,0.3), 0 2px 4px rgba(0,0,0,0.6)",
                }}
              >
                <span className="flex items-center gap-2.5">
                  <Crown size={16} />
                  Return to the Realm
                </span>
              </button>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Scroll hint */}
      {scrollHint && showContent && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 animate-bounce pointer-events-none"
          style={{ opacity: 0.5 }}
        >
          <span className="text-[9px] text-amber-400/60 uppercase tracking-widest font-bold">
            Scroll
          </span>
          <ChevronDown size={16} className="text-amber-400/60" />
        </div>
      )}
    </div>
  );
}

export default CampaignVictoryScreen;
