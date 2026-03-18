"use client";
import React from "react";
import {
  X,
  Heart,
  Swords,
  Target,
  Gauge,
  Timer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  Crosshair,
} from "lucide-react";
import type { HeroType } from "../../types";
import { HERO_DATA, HERO_ABILITY_COOLDOWNS, HERO_ROLES } from "../../constants";
import { HeroSprite, HeroAbilityIcon } from "../../sprites";
import { HeroHelmetIcon } from "../../sprites/custom-icons";
import { BaseModal } from "../ui/primitives/BaseModal";
import { OrnateFrame } from "../ui/primitives/OrnateFrame";
import { PANEL, GOLD, OVERLAY, panelGradient, dividerGradient } from "../ui/system/theme";
import { heroFrameElements } from "../ui/primitives/ornateFrameHelpers";
import { HERO_OPTIONS } from "./shared/loadoutOptions";
import { hexToRgba } from "./shared/colorUtils";
import { FloatingParticles, RuneBackground } from "./shared/showcaseEffects";

const SHOWCASE_FRAME = 152;
const SHOWCASE_CX = SHOWCASE_FRAME / 2;
const SHOWCASE_MID_R = SHOWCASE_CX - 5;

const ROSTER_FRAME = 56;
const ROSTER_CX = ROSTER_FRAME / 2;

const HERO_ROLE_ICONS: Record<HeroType, React.ReactNode> = {
  tiger: <Swords size={10} />,
  tenor: <Sparkles size={10} />,
  mathey: <Shield size={10} />,
  rocky: <Crosshair size={10} />,
  scott: <Heart size={10} />,
  captain: <Sparkles size={10} />,
  engineer: <Target size={10} />,
};

const STAT_MAX: Record<string, number> = { HP: 5600, DMG: 90, RNG: 250, SPD: 3.5 };

interface HallOfHeroesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHero: HeroType | null;
  onSelectHero: (hero: HeroType) => void;
}

function HeroStatCard({ icon, value, label, bg, barColor, maxValue }: {
  icon: React.ReactNode;
  value: number;
  label: string;
  bg: string;
  barColor: string;
  maxValue: number;
}) {
  const pct = Math.min(100, (value / maxValue) * 100);
  return (
    <div
      className="flex flex-col items-center px-4 py-2.5 rounded-lg min-w-[70px] relative overflow-hidden"
      style={{ background: bg, border: "1px solid rgba(180,140,60,0.15)" }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 5px)" }}
      />
      {icon}
      <span className="text-sm font-bold text-amber-200 mt-1.5 tabular-nums">{value}</span>
      <span className="text-[7px] text-amber-500/50 uppercase font-bold tracking-wider mb-1.5">{label}</span>
      <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
        <div className="h-full rounded-full animate-stat-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  );
}

export const HallOfHeroesModal: React.FC<HallOfHeroesModalProps> = ({
  isOpen,
  onClose,
  selectedHero,
  onSelectHero,
}) => {
  const [focusedHero, setFocusedHero] = React.useState<HeroType>(
    selectedHero || "tiger"
  );

  React.useEffect(() => {
    if (isOpen && selectedHero) setFocusedHero(selectedHero);
  }, [isOpen, selectedHero]);

  const hero = HERO_DATA[focusedHero];
  const role = HERO_ROLES[focusedHero];
  const isEquipped = selectedHero === focusedHero;
  const focusedIdx = HERO_OPTIONS.indexOf(focusedHero);

  const navigate = (dir: -1 | 1) => {
    const next = (focusedIdx + dir + HERO_OPTIONS.length) % HERO_OPTIONS.length;
    setFocusedHero(HERO_OPTIONS[next]);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zClass="z-[200]" backdropBg={OVERLAY.black60}>
      <div
        className="relative w-[92vw] max-w-[880px] max-h-[88dvh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: panelGradient,
          border: `2px solid ${GOLD.border35}`,
          boxShadow: `0 0 60px ${GOLD.glow07}, 0 0 120px rgba(180,140,60,0.04), inset 0 0 30px ${GOLD.glow04}`,
        }}
      >
        <OrnateFrame className="relative w-full h-full overflow-hidden flex flex-col" cornerSize={52} showSideBorders={false}>
          <div className="absolute inset-[3px] rounded-[14px] pointer-events-none z-20" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
          <RuneBackground patternId="hero-rune-grid">
            <path d="M30 5 L30 15 M25 10 L35 10" stroke="rgba(180,140,60,0.4)" strokeWidth="0.5" fill="none" />
            <circle cx="30" cy="10" r="2" stroke="rgba(180,140,60,0.3)" strokeWidth="0.3" fill="none" />
            <path d="M5 30 L15 30 M10 25 L10 35" stroke="rgba(180,140,60,0.3)" strokeWidth="0.5" fill="none" />
            <path d="M50 50 L55 45 L55 55 Z" stroke="rgba(180,140,60,0.25)" strokeWidth="0.3" fill="none" />
          </RuneBackground>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:rotate-90 duration-300"
            style={{ background: PANEL.bgDeep, border: `1px solid ${GOLD.border25}` }}
          >
            <X size={16} className="text-amber-400" />
          </button>

          {/* Header */}
          <div
            className="relative px-6 py-4 flex-shrink-0"
            style={{ background: "linear-gradient(90deg, rgba(180,130,40,0.22), rgba(120,80,20,0.08), transparent)" }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <HeroHelmetIcon size={30} />
                <div className="absolute -inset-1 rounded-full animate-badge-glow" style={{ "--glow-color": "rgba(180,140,60,0.3)" } as React.CSSProperties} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-200 tracking-[0.2em] uppercase font-cinzel">
                  Hall of Heroes
                </h2>
                <p className="text-[9px] text-amber-600/50 tracking-[0.15em] uppercase mt-0.5">
                  Choose your champion wisely
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: dividerGradient }} />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="flex flex-col lg:flex-row p-5 gap-5">
              {/* Featured hero showcase */}
              <div
                className="flex-1 relative rounded-xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${hero.color}12, rgba(20,16,10,0.97))`,
                  border: `1.5px solid ${hero.color}35`,
                  minHeight: 420,
                }}
              >
                {/* Background layers */}
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage: `url('/images/heroes/${focusedHero}-action.png')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at 50% 25%, ${hero.color}10, transparent 55%), linear-gradient(0deg, rgba(18,14,8,0.99) 0%, rgba(18,14,8,0.7) 30%, transparent 60%)`,
                  }}
                />

                <FloatingParticles color={hero.color} count={8} />

                {/* Navigation arrows */}
                {(["left", "right"] as const).map((side) => (
                  <button
                    key={side}
                    onClick={() => navigate(side === "left" ? -1 : 1)}
                    className={`absolute ${side === "left" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-black/70 duration-200 group`}
                    style={{ background: "rgba(0,0,0,0.45)", border: `1px solid ${hero.color}40` }}
                  >
                    {side === "left"
                      ? <ChevronLeft size={20} className="text-amber-400 group-hover:text-amber-300 transition-colors" />
                      : <ChevronRight size={20} className="text-amber-400 group-hover:text-amber-300 transition-colors" />
                    }
                  </button>
                ))}

                {/* Hero content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full py-8 px-4">
                  {/* Hero avatar with animated aura */}
                  <div className="relative mb-6">
                    {/* Outer spinning aura ring */}
                    <div
                      className="absolute -inset-6 rounded-full animate-aura-spin"
                      style={{
                        background: `conic-gradient(from 0deg, transparent, ${hero.color}20, transparent, ${hero.color}15, transparent)`,
                      }}
                    />
                    {/* Pulsing glow */}
                    <div
                      className="absolute -inset-4 rounded-full animate-hero-aura"
                      style={{
                        background: `radial-gradient(circle, ${hero.color}20, transparent 70%)`,
                      }}
                    />
                    {/* Avatar circle */}
                    <div
                      className="relative w-[120px] h-[120px] rounded-full flex items-center justify-center transition-all duration-500"
                      style={{
                        background: `radial-gradient(circle at 40% 35%, ${hero.color}35, ${hero.color}10)`,
                        border: `3px solid ${hero.color}`,
                        boxShadow: `0 0 40px ${hero.color}30, 0 0 80px ${hero.color}15, inset 0 0 25px ${hero.color}12`,
                      }}
                    >
                      <svg className="absolute pointer-events-none" style={{
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }} width={SHOWCASE_FRAME} height={SHOWCASE_FRAME} overflow="visible">
                        {heroFrameElements({
                          cx: SHOWCASE_CX, outerR: SHOWCASE_CX - 2, midR: SHOWCASE_MID_R,
                          color: hexToRgba(hero.color, 0.3),
                          dimColor: hexToRgba(hero.color, 0.15),
                          prefix: "hoh-show",
                        })}
                      </svg>
                      <HeroSprite type={focusedHero} size={76} />
                    </div>
                    {/* Equipped badge */}
                    {isEquipped && (
                      <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider text-amber-200 animate-badge-glow z-20"
                        style={{
                          background: "linear-gradient(135deg, rgba(100,70,15,0.95), rgba(60,40,8,0.95))",
                          border: "1px solid rgba(250,200,60,0.5)",
                          "--glow-color": "rgba(250,200,60,0.3)",
                        } as React.CSSProperties}
                      >
                        Active
                      </div>
                    )}
                  </div>

                  {/* Name + Role */}
                  <h3 className="text-2xl font-black text-amber-100 tracking-wide mb-1.5 font-cinzel">
                    {hero.name}
                  </h3>
                  <span
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] px-3.5 py-1 rounded-full mb-3"
                    style={{ background: role.bg, border: `1px solid ${role.border}` }}
                  >
                    <span className={role.color}>{HERO_ROLE_ICONS[focusedHero]}</span>
                    <span className={role.color}>{role.label}</span>
                  </span>

                  {/* Lore blurb */}
                  <p className="text-[10px] text-amber-400/40 leading-relaxed text-center max-w-[340px] mb-5 italic">
                    {hero.description}
                  </p>

                  {/* Ornate divider */}
                  <div className="w-48 h-px mb-5" style={{ background: `linear-gradient(90deg, transparent, ${hero.color}40, transparent)` }} />

                  {/* Stats row */}
                  <div className="flex gap-2 mb-5 flex-wrap justify-center">
                    <HeroStatCard icon={<Heart size={14} className="text-red-400" />} value={hero.hp} label="HP" bg="rgba(127,29,29,0.2)" barColor="#ef4444" maxValue={STAT_MAX.HP} />
                    <HeroStatCard icon={<Swords size={14} className="text-orange-400" />} value={hero.damage} label="DMG" bg="rgba(124,45,18,0.2)" barColor="#f97316" maxValue={STAT_MAX.DMG} />
                    <HeroStatCard icon={<Target size={14} className="text-blue-400" />} value={hero.range} label="RNG" bg="rgba(30,58,138,0.2)" barColor="#3b82f6" maxValue={STAT_MAX.RNG} />
                    <HeroStatCard icon={<Gauge size={14} className="text-green-400" />} value={hero.speed} label="SPD" bg="rgba(20,83,45,0.2)" barColor="#22c55e" maxValue={STAT_MAX.SPD} />
                  </div>

                  {/* Ability section */}
                  <div
                    className="relative px-5 py-3.5 rounded-xl max-w-[380px] text-center overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, rgba(88,28,135,0.18), rgba(88,28,135,0.08))",
                      border: "1px solid rgba(88,28,135,0.25)",
                    }}
                  >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 animate-shimmer" style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.06), transparent)" }} />
                    </div>
                    <div className="relative">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "rgba(88,28,135,0.3)", border: "1px solid rgba(139,92,246,0.3)" }}>
                          <HeroAbilityIcon type={focusedHero} size={14} />
                        </div>
                        <span className="text-sm font-bold text-purple-200 tracking-wide">
                          {hero.ability}
                        </span>
                        <span className="text-[9px] text-purple-400/50 flex items-center gap-0.5 bg-purple-950/30 px-1.5 py-0.5 rounded">
                          <Timer size={9} />
                          {HERO_ABILITY_COOLDOWNS[focusedHero] / 1000}s
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-300/60 leading-relaxed">
                        {hero.abilityDesc}
                      </p>
                    </div>
                  </div>

                  {/* Select button */}
                  <button
                    onClick={() => {
                      onSelectHero(focusedHero);
                      onClose();
                    }}
                    className="mt-6 px-10 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 hover:brightness-110 duration-200 relative overflow-hidden group"
                    style={{
                      background: isEquipped
                        ? "linear-gradient(180deg, rgba(40,70,40,0.9), rgba(25,45,25,0.9))"
                        : "linear-gradient(180deg, rgba(180,130,30,0.92), rgba(120,78,15,0.95))",
                      border: isEquipped
                        ? "1.5px solid rgba(100,200,100,0.5)"
                        : "1.5px solid rgba(250,200,60,0.55)",
                      boxShadow: isEquipped
                        ? "0 0 20px rgba(100,200,100,0.15)"
                        : "0 0 25px rgba(250,200,60,0.18), inset 0 0 12px rgba(250,200,60,0.1)",
                      color: isEquipped ? "#86efac" : "#fde68a",
                    }}
                  >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
                    </div>
                    <span className="relative z-10">
                      {isEquipped ? "Equipped" : "Select Champion"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Hero roster */}
              <div className="w-full lg:w-[220px] flex flex-col gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-1 mb-1">
                  <span className="text-[9px] font-bold text-amber-500/50 uppercase tracking-[0.2em]">
                    Roster
                  </span>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(180,140,60,0.15), transparent)" }} />
                  <span className="text-[8px] text-amber-600/30 font-medium">{HERO_OPTIONS.length} heroes</span>
                </div>

                <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
                  {HERO_OPTIONS.map((ht) => {
                    const h = HERO_DATA[ht];
                    const r = HERO_ROLES[ht];
                    const isFocused = focusedHero === ht;
                    const isSel = selectedHero === ht;
                    return (
                      <button
                        key={ht}
                        onClick={() => setFocusedHero(ht)}
                        className={`relative flex flex-col items-center p-3 rounded-lg transition-all duration-200 group ${isFocused ? "scale-105 z-10" : "hover:scale-105 hover:brightness-110"
                          }`}
                        style={{
                          background: isFocused
                            ? `linear-gradient(135deg, ${h.color}30, ${h.color}10)`
                            : "linear-gradient(135deg, rgba(38,34,28,0.9), rgba(24,20,16,0.9))",
                          border: `1.5px solid ${isFocused ? h.color : "rgba(100,90,70,0.2)"}`,
                          boxShadow: isFocused
                            ? `0 0 18px ${h.color}25, inset 0 0 12px ${h.color}08`
                            : "none",
                        }}
                      >
                        {/* Inner shimmer on hover */}
                        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at 50% 30%, ${h.color}10, transparent 70%)` }} />
                        </div>

                        <div className="relative flex items-center justify-center" style={{ width: 42, height: 42 }}>
                          <svg className="absolute pointer-events-none" style={{
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }} width={ROSTER_FRAME} height={ROSTER_FRAME} overflow="visible">
                            {heroFrameElements({
                              cx: ROSTER_CX, outerR: ROSTER_CX - 2, midR: ROSTER_CX - 4,
                              color: hexToRgba(h.color, isFocused ? 0.35 : isSel ? 0.22 : 0.12),
                              dimColor: hexToRgba(h.color, isFocused ? 0.18 : isSel ? 0.1 : 0.06),
                              prefix: `hr-${ht}`,
                            })}
                          </svg>
                          <HeroSprite type={ht} size={38} />
                          {isFocused && (
                            <div className="absolute -inset-1 rounded-full" style={{ boxShadow: `0 0 12px ${h.color}30` }} />
                          )}
                        </div>
                        <span className="text-[8px] font-bold text-amber-300/70 mt-1.5 leading-none whitespace-nowrap">
                          {h.name}
                        </span>
                        {/* Role micro-badge */}
                        <span className={`text-[6px] font-semibold uppercase tracking-wider mt-0.5 ${r.color} opacity-60`}>
                          {r.label}
                        </span>

                        {isSel && (
                          <div
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border-[1.5px] border-stone-900 text-[7px] text-white font-bold"
                            style={{ boxShadow: "0 0 8px rgba(245,158,11,0.5)" }}
                          >
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Current selection summary */}
                <div className="mt-auto pt-3">
                  <div className="h-px mb-3" style={{ background: "linear-gradient(90deg, transparent, rgba(180,140,60,0.15) 30%, rgba(180,140,60,0.15) 70%, transparent)" }} />
                  {selectedHero && (
                    <div
                      className="flex items-center gap-2.5 p-2.5 rounded-lg"
                      style={{ background: "rgba(60,45,15,0.2)", border: "1px solid rgba(180,140,60,0.12)" }}
                    >
                      <HeroSprite type={selectedHero} size={24} />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-amber-200">
                          {HERO_DATA[selectedHero].name}
                        </span>
                        <span className="text-[7px] text-amber-500/40 uppercase tracking-wider font-semibold">
                          Current Champion
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </OrnateFrame>
      </div>
    </BaseModal>
  );
};
