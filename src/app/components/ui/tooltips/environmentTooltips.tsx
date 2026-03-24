"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  CircleOff,
  Crown,
  Crosshair,
  Diamond,
  Eye,
  Fence,
  Flame,
  Home,
  Landmark,
  Mountain,
  Shield,
  Skull,
  Snowflake,
  Sparkles,
  Swords,
  TrendingDown,
  TrendingUp,
  Wind,
  Zap,
} from "lucide-react";
import type { Position } from "../../../types";
import { GOLD, PANEL, RED_CARD, panelGradient } from "../system/theme";
import { getTooltipPosition } from "./tooltipPositioning";

interface LandmarkTooltipProps {
  landmarkType: string;
  position: Position;
}

const LANDMARK_INFO: Record<
  string,
  { name: string; icon: React.ReactNode; desc: string; lore: string }
> = {
  pyramid: {
    name: "Ancient Pyramid",
    icon: <Landmark className="text-amber-400" size={16} />,
    desc: "A towering stone monument from a forgotten civilization.",
    lore: "Legend says it was built by scholars who discovered the secrets of geometry long before anyone else.",
  },
  sphinx: {
    name: "Sphinx",
    icon: <Eye className="text-amber-400" size={16} />,
    desc: "A mythical guardian carved from living stone.",
    lore: "It asks riddles of all who pass. Most enemies are too dumb to answer correctly.",
  },
  giant_sphinx: {
    name: "Great Sphinx",
    icon: <Eye className="text-amber-400" size={16} />,
    desc: "An enormous sphinx watching over the desert sands.",
    lore: "Its gaze is said to pierce through illusions. Even the bravest foes feel uneasy in its shadow.",
  },
  nassau_hall: {
    name: "Nassau Hall",
    icon: <Home className="text-amber-400" size={16} />,
    desc: "The historic heart of Princeton University, est. 1756.",
    lore: "Once served as the capitol of the United States. Now it serves as the last bastion against the dark horde.",
  },
  glacier: {
    name: "Glacier",
    icon: <Snowflake className="text-cyan-400" size={16} />,
    desc: "A towering block of ancient ice sculpted by millennia of wind and frost.",
    lore: "These crystalline monoliths predate all memory, slowly creeping across the frozen highlands like silent sentinels.",
  },
  ice_fortress: {
    name: "Ice Fortress",
    icon: <Snowflake className="text-cyan-400" size={16} />,
    desc: "A massive fortification carved from living ice, bristling with frozen battlements.",
    lore: "Built during the Great Frost by ice mages who froze an entire river to create its foundations.",
  },
  ice_throne: {
    name: "Ice Throne",
    icon: <Snowflake className="text-cyan-300" size={16} />,
    desc: "A grand seat of power carved from a single colossal block of enchanted ice.",
    lore: "The throne of the Frost Queen, from which she commanded the eternal winter that once blanketed these peaks.",
  },
  obsidian_castle: {
    name: "Obsidian Castle",
    icon: <Shield className="text-purple-400" size={16} />,
    desc: "A dark stronghold hewn from volcanic glass.",
    lore: "The castle absorbs light itself. Torches flicker and die within its walls without magical protection.",
  },
  witch_cottage: {
    name: "Witch's Cottage",
    icon: <Sparkles className="text-green-400" size={16} />,
    desc: "A crooked dwelling reeking of potions and old magic.",
    lore: "The witch left years ago, but her cauldron still bubbles. Nobody dares taste what's inside.",
  },
  ruined_temple: {
    name: "Ruined Temple",
    icon: <Landmark className="text-stone-400" size={16} />,
    desc: "Crumbling remains of an ancient place of worship.",
    lore: "The old gods may be gone, but faint hymns can still be heard at midnight.",
  },
  sunken_pillar: {
    name: "Sunken Pillar",
    icon: <Mountain className="text-stone-400" size={16} />,
    desc: "A massive column half-buried in the earth.",
    lore: "Part of a bridge that once connected two kingdoms. The other half was never found.",
  },
  statue: {
    name: "Stone Statue",
    icon: <Crown className="text-amber-400" size={16} />,
    desc: "A weathered statue of a forgotten hero.",
    lore: "Students used to rub its nose for good luck on exams. The nose is very shiny.",
  },
  demon_statue: {
    name: "Demon Statue",
    icon: <Swords className="text-red-400" size={16} />,
    desc: "A menacing effigy radiating dark energy.",
    lore: "Carved by a mad sculptor who claimed the stone 'told him what shape it wanted to be.'",
  },
  obelisk: {
    name: "Ancient Obelisk",
    icon: <TrendingUp className="text-amber-400" size={16} />,
    desc: "A tall monolith inscribed with arcane symbols.",
    lore: "The inscriptions are a pizza recipe in a dead language. Scholars are still debating the toppings.",
  },
  cobra_statue: {
    name: "Cobra Statue",
    icon: <Diamond className="text-green-400" size={16} />,
    desc: "A menacing effigy radiating dark energy.",
    lore: "Carved by a mad sculptor who claimed the stone 'told him what shape it wanted to be.'",
  },
  frozen_waterfall: {
    name: "Frozen Waterfall",
    icon: <Snowflake className="text-cyan-400" size={16} />,
    desc: "A frozen waterfall that flows through the battlefield.",
    lore: "The waterfall is frozen solid and cannot be passed through.",
  },
  frozen_gate: {
    name: "Frozen Gate",
    icon: <Fence className="text-cyan-400" size={16} />,
    desc: "A frozen gate that defends the battlefield.",
    lore: "The gate doesn't seem to be very sturdy.",
  },
  aurora_crystal: {
    name: "Aurora Crystal",
    icon: <Sparkles className="text-purple-400" size={16} />,
    desc: "A crystal that emits a radiant energy.",
    lore: "The crystal is said to be the source of the aurora borealis.",
  },
  lava_fall: {
    name: "Lava Fall",
    icon: <Flame className="text-orange-400" size={16} />,
    desc: "A lava fall that flows through the battlefield.",
    lore: "The lava is hot and cannot be passed through.",
  },
  obsidian_pillar: {
    name: "Obsidian Pillar",
    icon: <Shield className="text-purple-400" size={16} />,
    desc: "A pillar of obsidian that stands in the battlefield.",
    lore: "Combined with a crystal, it could heal a dragon.",
  },
  skull_throne: {
    name: "Skull Throne",
    icon: <Skull className="text-red-400" size={16} />,
    desc: "A throne made of skulls that stands in the battlefield.",
    lore: "How many souls does it take to get some seating?",
  },
  volcano_rim: {
    name: "Volcano Rim",
    icon: <Flame className="text-orange-400" size={16} />,
    desc: "A rim of lava that surrounds the battlefield.",
    lore: "The precipice of eternal fire.",
  },
  idol_statue: {
    name: "Idol Statue",
    icon: <Landmark className="text-amber-400" size={16} />,
    desc: "A statue of an idol that stands in the battlefield.",
    lore: "A less impressive statue of a less impressive idol.",
  },
  gate: {
    name: "Gate",
    icon: <Fence className="text-cyan-400" size={16} />,
    desc: "A gate that defends the battlefield.",
    lore: "The gate doesn't seem to be very sturdy.",
  },
  carnegie_lake: {
    name: "Carnegie Lake",
    icon: <Mountain className="text-blue-400" size={16} />,
    desc: "A serene body of water reflecting the sky like a mirror.",
    lore: "Andrew Carnegie donated the lake so Princeton students could row. The fish were not consulted.",
  },
  hieroglyph_wall: {
    name: "Hieroglyph Wall",
    icon: <Landmark className="text-amber-400" size={16} />,
    desc: "A weathered stone wall covered in ancient hieroglyphs.",
    lore: "Scholars have translated most of it. It's mostly complaints about the heat and requests for more beer.",
  },
  sarcophagus: {
    name: "Sarcophagus",
    icon: <Skull className="text-amber-400" size={16} />,
    desc: "An ornate stone coffin sealed with ancient wards.",
    lore: "Whatever's inside keeps knocking. Everyone has agreed to pretend they don't hear it.",
  },
  dark_throne: {
    name: "Dark Throne",
    icon: <Crown className="text-purple-400" size={16} />,
    desc: "A menacing throne wreathed in shadow and dread.",
    lore: "Sitting in it grants immense power and also terrible lower back pain.",
  },
  dark_barracks: {
    name: "Dark Barracks",
    icon: <Shield className="text-purple-400" size={16} />,
    desc: "A fortified outpost where dark forces once mustered.",
    lore: "The bunks are still made. Evil is disciplined about hospital corners, apparently.",
  },
  dark_spire: {
    name: "Dark Spire",
    icon: <TrendingUp className="text-purple-400" size={16} />,
    desc: "A jagged tower of black stone piercing the sky.",
    lore: "Lightning strikes it constantly, yet it never crumbles. The architect was either brilliant or cursed.",
  },
  ice_bridge: {
    name: "Ice Bridge",
    icon: <Snowflake className="text-cyan-400" size={16} />,
    desc: "A frozen arch spanning a treacherous chasm.",
    lore: "Crossing it requires courage, balance, and the good sense not to look down.",
  },
  cannon_crest: {
    name: "Cannon Crest",
    icon: <Crosshair className="text-stone-400" size={16} />,
    desc: "An entrenched artillery berm lined with Nassau cannons.",
    lore: "The ridge was reshaped around firing lanes. Every sandbag exists because someone learned the hard way.",
  },
  ivy_crossroads: {
    name: "Ivy Crossroads",
    icon: <Landmark className="text-emerald-400" size={16} />,
    desc: "An ivy-choked arch marking a split crossroads through old campus stone.",
    lore: "Nobody remembers who built the arch first. The ivy is now the senior partner.",
  },
  blight_basin: {
    name: "Blight Basin",
    icon: <Skull className="text-lime-400" size={16} />,
    desc: "A poisoned basin where corrosive pools bubble through dead ground.",
    lore: "The air tastes wrong here. The mushrooms seem thrilled about that.",
  },
  triad_keep: {
    name: "Triad Keep",
    icon: <Shield className="text-emerald-400" size={16} />,
    desc: "A fortified swamp keep ringed by murky water and green banners.",
    lore: "Three halls fed this fortress once. Now only the walls remember the guest list.",
  },
  sunscorch_labyrinth: {
    name: "Sunscorch Labyrinth",
    icon: <TrendingUp className="text-amber-400" size={16} />,
    desc: "A burning sandstone maze whose walls trap heat as well as armies.",
    lore: "It was designed to confuse invaders and roast them while they were busy being confused.",
  },
  frist_outpost: {
    name: "Frist Outpost",
    icon: <Fence className="text-cyan-300" size={16} />,
    desc: "A snowbound palisade outpost built around a rough watchtower and campfire.",
    lore: "The walls creak, the fire sputters, and somehow it still holds every winter.",
  },
  ashen_spiral: {
    name: "Ashen Spiral",
    icon: <Flame className="text-orange-400" size={16} />,
    desc: "A spiral of scorched vents that erupts in staggered waves of fire.",
    lore: "Stand still too long and the ground starts making plans for you.",
  },
  war_monument: {
    name: "War Monument",
    icon: <Swords className="text-stone-400" size={16} />,
    desc: "A towering memorial honoring fallen warriors of ages past.",
    lore: "Every name etched into its surface represents a hero. There are a lot of names.",
  },
  bone_altar: {
    name: "Bone Altar",
    icon: <Skull className="text-red-400" size={16} />,
    desc: "A grim sacrificial platform assembled from countless bones.",
    lore: "Dark rituals were performed here. The stains don't come out no matter how hard you scrub.",
  },
  sun_obelisk: {
    name: "Sun Obelisk",
    icon: <TrendingUp className="text-amber-400" size={16} />,
    desc: "A golden spire that channels the power of the sun.",
    lore: "At high noon it casts no shadow. At midnight, it glows faintly, as if remembering the light.",
  },
  frost_citadel: {
    name: "Frost Citadel",
    icon: <Snowflake className="text-cyan-400" size={16} />,
    desc: "A massive fortress sculpted entirely from enchanted ice.",
    lore: "The throne room is gorgeous but the heating bill is zero—because there is no heating.",
  },
  infernal_gate: {
    name: "Infernal Gate",
    icon: <Flame className="text-red-400" size={16} />,
    desc: "A blazing portal crackling with hellfire and brimstone.",
    lore: "It leads somewhere very hot. The welcome mat on the other side says 'Abandon Hope.' Subtle.",
  },
};

export const LandmarkTooltip: React.FC<LandmarkTooltipProps> = ({
  landmarkType,
  position,
}) => {
  const info = LANDMARK_INFO[landmarkType] || {
    name: landmarkType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    icon: <Landmark className="text-amber-400" size={16} />,
    desc: "A notable landmark on the battlefield.",
    lore: "Its origins are shrouded in mystery.",
  };

  const coords = getTooltipPosition(position, { width: 240, height: 140 });

  return (
    <div
      className="fixed pointer-events-none shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{
        left: coords.left,
        top: coords.top,
        zIndex: 250,
        width: 240,
        background: panelGradient,
        border: `1.5px solid ${GOLD.border30}`,
        boxShadow: `0 0 20px ${GOLD.glow07}`,
      }}
    >
      <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
      <div className="px-3 py-1.5 relative z-10" style={{ background: PANEL.bgWarmMid, borderBottom: `1px solid ${GOLD.border25}` }}>
        <div className="flex items-center gap-2">
          {info.icon}
          <span className="font-bold text-amber-200 text-sm">{info.name}</span>
        </div>
        <div className="text-[9px] text-amber-500/70 uppercase tracking-wider mt-0.5 flex items-center gap-1">
          <Landmark size={8} />
          Landmark
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="text-[11px] text-amber-100/80 leading-relaxed">{info.desc}</p>
        <p className="text-[10px] text-amber-400/60 leading-relaxed mt-1.5 italic pt-1.5" style={{ borderTop: `1px solid ${GOLD.innerBorder08}` }}>
          &quot;{info.lore}&quot;
        </p>
      </div>
    </div>
  );
};

interface HazardTooltipProps {
  hazardType: string;
  position: Position;
}

const HAZARD_INFO: Record<
  string,
  { name: string; icon: React.ReactNode; desc: string; effect: string; effectColor: string }
> = {
  poison_fog: {
    name: "Poison Fog",
    icon: <Wind className="text-green-400" size={16} />,
    desc: "A thick, noxious cloud of toxic gas lingers over this area.",
    effect: "Deals 15 DPS to all units passing through",
    effectColor: "text-green-400",
  },
  deep_water: {
    name: "Deep Water",
    icon: <Activity className="text-blue-400" size={16} />,
    desc: "Dark water with strong undertow and almost no footing.",
    effect: "Slows and drowns all units — 4-9 DPS + 38% slow",
    effectColor: "text-blue-300",
  },
  maelstrom: {
    name: "Maelstrom",
    icon: <Wind className="text-cyan-300" size={16} />,
    desc: "A rotating vortex that drags everything toward its crushing center.",
    effect: "8-20 DPS + 55% slow to all units",
    effectColor: "text-cyan-300",
  },
  storm_field: {
    name: "Storm Field",
    icon: <Zap className="text-sky-300" size={16} />,
    desc: "Ionized storm air that supercharges movement but shreds armor.",
    effect: "All units move 15% faster but take 6 DPS",
    effectColor: "text-sky-300",
  },
  quicksand: {
    name: "Quicksand",
    icon: <TrendingDown className="text-yellow-400" size={16} />,
    desc: "Treacherous ground that swallows anything that steps on it.",
    effect: "Slows all units by 50%",
    effectColor: "text-yellow-400",
  },
  ice_sheet: {
    name: "Ice Sheet",
    icon: <Snowflake className="text-cyan-400" size={16} />,
    desc: "A slick expanse of frozen ground that accelerates movement.",
    effect: "All units move 60% FASTER through this zone",
    effectColor: "text-cyan-400",
  },
  slippery_ice: {
    name: "Slippery Ice",
    icon: <Snowflake className="text-cyan-400" size={16} />,
    desc: "A treacherously smooth ice surface.",
    effect: "All units move 60% FASTER through this zone",
    effectColor: "text-cyan-400",
  },
  ice: {
    name: "Ice",
    icon: <Snowflake className="text-cyan-300" size={16} />,
    desc: "A frozen patch that makes footing unreliable.",
    effect: "All units move 50% FASTER through this zone",
    effectColor: "text-cyan-300",
  },
  ice_spikes: {
    name: "Ice Spikes",
    icon: <Mountain className="text-cyan-300" size={16} />,
    desc: "Razor-sharp crystal growths burst from the frozen ground.",
    effect: "Shoots up in cycles, damaging and slowing all units",
    effectColor: "text-cyan-300",
  },
  spikes: {
    name: "Ice Spikes",
    icon: <Mountain className="text-cyan-300" size={16} />,
    desc: "Razor-sharp crystal growths burst from the frozen ground.",
    effect: "Shoots up in cycles, damaging and slowing all units",
    effectColor: "text-cyan-300",
  },
  lava_geyser: {
    name: "Lava Geyser",
    icon: <Flame className="text-orange-400" size={16} />,
    desc: "Periodic eruptions of molten rock from deep underground.",
    effect: "Random eruptions deal 5 fire damage to all nearby units",
    effectColor: "text-orange-400",
  },
  eruption_zone: {
    name: "Lava Geyser",
    icon: <Flame className="text-orange-400" size={16} />,
    desc: "Periodic eruptions of molten rock from deep underground.",
    effect: "Random eruptions deal 5 fire damage to all nearby units",
    effectColor: "text-orange-400",
  },
  volcano: {
    name: "Volcano",
    icon: <Flame className="text-red-400" size={16} />,
    desc: "A volatile crater that hurls molten rock across the battlefield.",
    effect: "Devastating eruptions deal 15 fire damage to all nearby units",
    effectColor: "text-red-400",
  },
  lava: {
    name: "Lava Pool",
    icon: <Flame className="text-red-300" size={16} />,
    desc: "Bubbling magma that scorches anything too close.",
    effect: "Periodic splashes deal 4 fire damage to all nearby units",
    effectColor: "text-red-300",
  },
  swamp: {
    name: "Toxic Swamp",
    icon: <Wind className="text-lime-400" size={16} />,
    desc: "A fetid mire oozing with corrosive sludge.",
    effect: "6 DPS poison + 35% slow to all units",
    effectColor: "text-lime-400",
  },
  poison: {
    name: "Poison",
    icon: <Wind className="text-green-400" size={16} />,
    desc: "A pool of concentrated toxin.",
    effect: "Deals 12 DPS to all units",
    effectColor: "text-green-400",
  },
  fire: {
    name: "Hellfire Zone",
    icon: <Flame className="text-orange-400" size={16} />,
    desc: "Continuous flames scorch everything in the area.",
    effect: "10 fire DPS to all units",
    effectColor: "text-orange-400",
  },
  lightning: {
    name: "Lightning Field",
    icon: <Zap className="text-yellow-300" size={16} />,
    desc: "Sporadic high-voltage strikes blast the area.",
    effect: "18 burst damage per lightning strike to all units",
    effectColor: "text-yellow-300",
  },
  void: {
    name: "Void Rift",
    icon: <CircleOff className="text-purple-400" size={16} />,
    desc: "A dimensional tear that drains life force.",
    effect: "8 DPS + 30% slow to all units",
    effectColor: "text-purple-400",
  },
};

export const HazardTooltip: React.FC<HazardTooltipProps> = ({
  hazardType,
  position,
}) => {
  const info = HAZARD_INFO[hazardType] || {
    name: hazardType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    icon: <AlertTriangle className="text-red-400" size={16} />,
    desc: "A dangerous environmental hazard.",
    effect: "Applies an unknown effect to units in the area",
    effectColor: "text-red-400",
  };

  const coords = getTooltipPosition(position, { width: 250, height: 150 });

  return (
    <div
      className="fixed pointer-events-none shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{
        left: coords.left,
        top: coords.top,
        zIndex: 250,
        width: 250,
        background: panelGradient,
        border: `1.5px solid ${RED_CARD.border}`,
        boxShadow: `0 0 20px ${RED_CARD.glow06}`,
      }}
    >
      <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${RED_CARD.innerBorder12}` }} />
      <div className="px-3 py-1.5 relative z-10" style={{ background: RED_CARD.bgLight, borderBottom: `1px solid ${RED_CARD.border25}` }}>
        <div className="flex items-center gap-2">
          {info.icon}
          <span className="font-bold text-red-200 text-sm">{info.name}</span>
        </div>
        <div className="text-[9px] text-red-400/70 uppercase tracking-wider mt-0.5 flex items-center gap-1">
          <AlertTriangle size={9} />
          Environmental Hazard
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="text-[11px] text-stone-300/80 leading-relaxed">{info.desc}</p>
        <div className="mt-2 rounded-lg px-2.5 py-1.5" style={{ background: PANEL.bgDeep, border: `1px solid ${RED_CARD.border25}` }}>
          <div className="text-[9px] text-red-400/60 uppercase tracking-wider mb-0.5 font-semibold">Effect</div>
          <p className={`text-[11px] font-medium leading-snug ${info.effectColor}`}>
            {info.effect}
          </p>
        </div>
      </div>
    </div>
  );
};
