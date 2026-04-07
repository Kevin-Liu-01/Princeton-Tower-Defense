export function getHpRingColor(percent: number, heroColor: string): string {
  if (percent <= 25) {
    return "#ef4444";
  }
  if (percent <= 50) {
    return "#eab308";
  }
  return heroColor;
}

export function getHeroHpTheme(percent: number) {
  if (percent <= 25) {
    return {
      barColor: "from-red-500 to-red-700",
      beatSpeed: percent <= 10 ? "0.6s" : "0.9s",
      fillGradient:
        "linear-gradient(90deg, rgba(180,80,60,0.18), rgba(180,80,60,0.06))",
      glowColor: "shadow-red-500/50",
      heartbeat: true,
      textColor: "text-red-400",
    };
  }
  if (percent <= 50) {
    return {
      barColor: "from-yellow-400 to-yellow-600",
      beatSpeed: "0s",
      fillGradient:
        "linear-gradient(90deg, rgba(200,160,60,0.14), rgba(200,160,60,0.05))",
      glowColor: "shadow-yellow-500/40",
      heartbeat: false,
      textColor: "text-yellow-400",
    };
  }
  return {
    barColor: "from-emerald-400 to-emerald-600",
    beatSpeed: "0s",
    fillGradient:
      "linear-gradient(90deg, rgba(180,140,50,0.12), rgba(180,140,50,0.04))",
    glowColor: "shadow-emerald-500/40",
    heartbeat: false,
    textColor: "text-emerald-400",
  };
}

export { hexToRgba } from "../../../../utils/colorUtils";
