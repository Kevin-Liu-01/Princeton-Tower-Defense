export function getLivesTheme(percent: number, flashing: boolean) {
  if (flashing) {
    return {
      barColor: "#ef4444",
      bg: "linear-gradient(135deg, rgba(80,12,12,0.95), rgba(50,8,8,0.95))",
      border: "1.5px solid rgba(248,113,113,0.5)",
      iconClass: "text-red-200 scale-125",
      iconFill: "#fecaca",
      innerBorder: "1px solid rgba(248,113,113,0.15)",
      shadow:
        "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 12px rgba(248,113,113,0.15)",
      subText: "text-red-400/50",
      textClass: "text-red-100",
    };
  }
  if (percent > 60) {
    return {
      barColor: "#f87171",
      bg: "linear-gradient(135deg, rgba(28,20,10,0.95), rgba(16,11,6,0.95))",
      border: "1.5px solid rgba(180,140,60,0.4)",
      iconClass: "text-red-400",
      iconFill: "#f87171",
      innerBorder: "1px solid rgba(180,140,60,0.15)",
      shadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
      subText: "text-red-500/40",
      textClass: "text-red-300",
    };
  }
  if (percent > 30) {
    return {
      barColor: "#ea580c",
      bg: "linear-gradient(135deg, rgba(35,16,5,0.95), rgba(22,10,3,0.95))",
      border: "1.5px solid rgba(180,90,15,0.35)",
      iconClass: "text-orange-500",
      iconFill: "#ea580c",
      innerBorder: "1px solid rgba(180,90,15,0.12)",
      shadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
      subText: "text-orange-600/50",
      textClass: "text-orange-300",
    };
  }
  return {
    barColor: "#dc2626",
    bg: "linear-gradient(135deg, rgba(50,6,6,0.95), rgba(30,4,4,0.95))",
    border: "1.5px solid rgba(180,30,30,0.45)",
    iconClass: "text-red-300 animate-pulse",
    iconFill: "#ef4444",
    innerBorder: "1px solid rgba(180,30,30,0.15)",
    shadow:
      "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 10px rgba(180,30,30,0.08)",
    subText: "text-red-500/50",
    textClass: "text-red-200",
  };
}

export const PRESET_SPEEDS = [0.5, 1, 2];
