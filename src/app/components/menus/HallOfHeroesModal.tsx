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
} from "lucide-react";
import type { HeroType } from "../../types";
import { HERO_DATA, HERO_ABILITY_COOLDOWNS } from "../../constants";
import { HeroSprite, HeroAbilityIcon } from "../../sprites";
import { HeroHelmetIcon } from "../../sprites/custom-icons";
import { BaseModal } from "../ui/BaseModal";
import { OrnateFrame } from "../ui/OrnateFrame";
import { PANEL, GOLD, OVERLAY, panelGradient, dividerGradient } from "../ui/theme";

const HERO_ROLES: Record<
  HeroType,
  { label: string; color: string; bg: string; border: string }
> = {
  tiger: { label: "Brawler", color: "text-orange-300", bg: "rgba(60,25,5,0.85)", border: "rgba(234,88,12,0.35)" },
  tenor: { label: "Mage", color: "text-violet-300", bg: "rgba(35,20,65,0.85)", border: "rgba(139,92,246,0.35)" },
  mathey: { label: "Tank", color: "text-indigo-300", bg: "rgba(25,25,60,0.85)", border: "rgba(99,102,241,0.35)" },
  rocky: { label: "Artillery", color: "text-amber-300", bg: "rgba(45,35,10,0.85)", border: "rgba(138,112,32,0.35)" },
  scott: { label: "Support", color: "text-teal-300", bg: "rgba(8,45,42,0.85)", border: "rgba(20,184,166,0.35)" },
  captain: { label: "Summoner", color: "text-red-300", bg: "rgba(55,12,12,0.85)", border: "rgba(220,38,38,0.35)" },
  engineer: { label: "Builder", color: "text-yellow-300", bg: "rgba(50,38,5,0.85)", border: "rgba(234,179,8,0.35)" },
};

const heroOptions: HeroType[] = [
  "tiger", "tenor", "mathey", "rocky", "scott", "captain", "engineer",
];

interface HallOfHeroesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHero: HeroType | null;
  onSelectHero: (hero: HeroType) => void;
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
  const isEquipped = selectedHero === focusedHero;
  const focusedIdx = heroOptions.indexOf(focusedHero);

  const navigate = (dir: -1 | 1) => {
    const next = (focusedIdx + dir + heroOptions.length) % heroOptions.length;
    setFocusedHero(heroOptions[next]);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zClass="z-[200]" backdropBg={OVERLAY.black60}>
      <div
        className="relative w-[92vw] max-w-[840px] max-h-[88vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: panelGradient,
          border: `2px solid ${GOLD.border35}`,
          boxShadow: `0 0 40px ${GOLD.glow07}, inset 0 0 30px ${GOLD.glow04}`,
        }}
      >
        <OrnateFrame className="relative w-full h-full overflow-hidden flex flex-col" cornerSize={48} showSideBorders={false}>
          <div className="absolute inset-[3px] rounded-[14px] pointer-events-none z-20" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: PANEL.bgDeep,
              border: `1px solid ${GOLD.border25}`,
            }}
          >
            <X size={16} className="text-amber-400" />
          </button>

          {/* Header */}
          <div
            className="relative px-6 py-4 flex-shrink-0"
            style={{
              background: "linear-gradient(90deg, rgba(180,130,40,0.22), rgba(120,80,20,0.08), transparent)",
            }}
          >
            <div className="flex items-center gap-3">
              <HeroHelmetIcon size={28} />
              <h2 className="text-lg font-bold text-amber-200 tracking-[0.2em] uppercase">
                Hall of Heroes
              </h2>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: dividerGradient }}
            />
          </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row p-5 gap-5">
            {/* Featured hero showcase */}
            <div
              className="flex-1 relative rounded-xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${hero.color}12, rgba(20,16,10,0.97))`,
                border: `1.5px solid ${hero.color}35`,
                minHeight: 340,
              }}
            >
              {/* Placeholder action background */}
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
                  background: `radial-gradient(ellipse at 50% 30%, ${hero.color}08, transparent 60%), linear-gradient(0deg, rgba(18,14,8,0.98) 0%, transparent 50%)`,
                }}
              />

              {/* Navigation arrows */}
              <button
                onClick={() => navigate(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(180,140,60,0.3)",
                }}
              >
                <ChevronLeft size={20} className="text-amber-400" />
              </button>
              <button
                onClick={() => navigate(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(180,140,60,0.3)",
                }}
              >
                <ChevronRight size={20} className="text-amber-400" />
              </button>

              {/* Hero content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full py-8 px-4">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center mb-5 transition-all duration-300"
                  style={{
                    background: `radial-gradient(circle, ${hero.color}30, ${hero.color}08)`,
                    border: `3px solid ${hero.color}`,
                    boxShadow: `0 0 40px ${hero.color}30, 0 0 80px ${hero.color}15, inset 0 0 20px ${hero.color}10`,
                  }}
                >
                  <HeroSprite type={focusedHero} size={72} />
                </div>

                <h3 className="text-2xl font-black text-amber-100 tracking-wide mb-1">
                  {hero.name}
                </h3>
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em] px-3 py-0.5 rounded-full mb-4"
                  style={{
                    background: HERO_ROLES[focusedHero].bg,
                    border: `1px solid ${HERO_ROLES[focusedHero].border}`,
                  }}
                >
                  <span className={HERO_ROLES[focusedHero].color}>
                    {HERO_ROLES[focusedHero].label}
                  </span>
                </span>

                {/* Stats row */}
                <div className="flex gap-2 mb-5">
                  {[
                    { icon: <Heart size={13} className="text-red-400" />, value: hero.hp, label: "HP", bg: "rgba(127,29,29,0.2)" },
                    { icon: <Swords size={13} className="text-orange-400" />, value: hero.damage, label: "DMG", bg: "rgba(124,45,18,0.2)" },
                    { icon: <Target size={13} className="text-blue-400" />, value: hero.range, label: "RNG", bg: "rgba(30,58,138,0.2)" },
                    { icon: <Gauge size={13} className="text-green-400" />, value: hero.speed, label: "SPD", bg: "rgba(20,83,45,0.2)" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col items-center px-3.5 py-2 rounded-lg"
                      style={{
                        background: stat.bg,
                        border: "1px solid rgba(180,140,60,0.12)",
                      }}
                    >
                      {stat.icon}
                      <span className="text-sm font-bold text-amber-200 mt-1">
                        {stat.value}
                      </span>
                      <span className="text-[8px] text-amber-500/60 uppercase font-semibold">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ability */}
                <div
                  className="px-5 py-3 rounded-xl max-w-[360px] text-center"
                  style={{
                    background: "rgba(88,28,135,0.14)",
                    border: "1px solid rgba(88,28,135,0.2)",
                  }}
                >
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <HeroAbilityIcon type={focusedHero} size={16} />
                    <span className="text-sm font-bold text-purple-200">
                      {hero.ability}
                    </span>
                    <span className="text-[9px] text-purple-400/60 flex items-center gap-0.5">
                      <Timer size={9} />
                      {HERO_ABILITY_COOLDOWNS[focusedHero] / 1000}s
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-300/70 leading-relaxed">
                    {hero.abilityDesc}
                  </p>
                </div>

                {/* Select button */}
                <button
                  onClick={() => {
                    onSelectHero(focusedHero);
                    onClose();
                  }}
                  className="mt-5 px-8 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 hover:brightness-110"
                  style={{
                    background: isEquipped
                      ? "linear-gradient(180deg, rgba(40,70,40,0.9), rgba(25,45,25,0.9))"
                      : "linear-gradient(180deg, rgba(180,130,30,0.92), rgba(120,78,15,0.95))",
                    border: isEquipped
                      ? "1.5px solid rgba(100,200,100,0.5)"
                      : "1.5px solid rgba(250,200,60,0.55)",
                    boxShadow: isEquipped
                      ? "0 0 20px rgba(100,200,100,0.15)"
                      : "0 0 20px rgba(250,200,60,0.15), inset 0 0 10px rgba(250,200,60,0.1)",
                    color: isEquipped ? "#86efac" : "#fde68a",
                  }}
                >
                  {isEquipped ? "✓ Equipped" : "Select Champion"}
                </button>
              </div>
            </div>

            {/* Hero roster */}
            <div className="w-full lg:w-[200px] flex flex-col gap-2 flex-shrink-0">
              <span className="text-[9px] font-bold text-amber-500/60 uppercase tracking-[0.2em] px-1">
                Roster
              </span>
              <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5">
                {heroOptions.map((ht) => {
                  const h = HERO_DATA[ht];
                  const isFocused = focusedHero === ht;
                  const isSel = selectedHero === ht;
                  return (
                    <button
                      key={ht}
                      onClick={() => setFocusedHero(ht)}
                      className={`relative flex flex-col items-center p-2.5 rounded-lg transition-all duration-200 ${
                        isFocused
                          ? "scale-105 z-10"
                          : "hover:scale-105 hover:brightness-110"
                      }`}
                      style={{
                        background: isFocused
                          ? `linear-gradient(135deg, ${h.color}30, ${h.color}10)`
                          : "linear-gradient(135deg, rgba(38,34,28,0.9), rgba(24,20,16,0.9))",
                        border: `1.5px solid ${isFocused ? h.color : "rgba(100,90,70,0.2)"}`,
                        boxShadow: isFocused
                          ? `0 0 14px ${h.color}25`
                          : "none",
                      }}
                    >
                      <HeroSprite type={ht} size={36} />
                      <span className="text-[8px] font-bold text-amber-300/70 mt-1 leading-none whitespace-nowrap">
                        {h.name}
                      </span>
                      {isSel && (
                        <div
                          className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border-[1.5px] border-stone-900 text-[7px] text-white font-bold"
                          style={{
                            boxShadow: "0 0 6px rgba(245,158,11,0.5)",
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        </OrnateFrame>
      </div>
    </BaseModal>
  );
};
