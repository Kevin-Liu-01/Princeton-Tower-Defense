export function getHpRingColor(percent: number, heroColor: string): string {
  if (percent <= 25) return "#ef4444";
  if (percent <= 50) return "#eab308";
  return heroColor;
}

export function getHeroHpTheme(percent: number) {
  if (percent <= 25) {
    return {
      barColor: "from-red-500 to-red-700",
      glowColor: "shadow-red-500/50",
      textColor: "text-red-400",
      fillGradient:
        "linear-gradient(90deg, rgba(180,80,60,0.18), rgba(180,80,60,0.06))",
      heartbeat: true,
      beatSpeed: percent <= 10 ? "0.6s" : "0.9s",
    };
  }
  if (percent <= 50) {
    return {
      barColor: "from-yellow-400 to-yellow-600",
      glowColor: "shadow-yellow-500/40",
      textColor: "text-yellow-400",
      fillGradient:
        "linear-gradient(90deg, rgba(200,160,60,0.14), rgba(200,160,60,0.05))",
      heartbeat: false,
      beatSpeed: "0s",
    };
  }
  return {
    barColor: "from-emerald-400 to-emerald-600",
    glowColor: "shadow-emerald-500/40",
    textColor: "text-emerald-400",
    fillGradient:
      "linear-gradient(90deg, rgba(180,140,50,0.12), rgba(180,140,50,0.04))",
    heartbeat: false,
    beatSpeed: "0s",
  };
}

export { hexToRgba } from "../../../../utils/colorUtils";
