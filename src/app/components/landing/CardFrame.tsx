import type React from "react";

export function FrameCorner({ className }: { className: string }) {
  return (
    <div
      className={`absolute w-[7px] h-[7px] rotate-45 pointer-events-none z-10 ${className}`}
      style={{
        background:
          "radial-gradient(circle at 35% 35%, #ffe8a0, #d4aa50, #8b6914)",
        border: "1px solid #6b4f12",
        boxShadow:
          "0 0 3px rgba(0,0,0,0.5), inset 0 0 1px rgba(255,230,150,0.4)",
      }}
    />
  );
}

export function CardFrame({
  accent,
  glow,
  children,
  className = "",
}: {
  accent?: string;
  glow?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const a = accent ?? "#d4aa50";
  return (
    <div
      className={`relative p-[3px] rounded-lg ${className}`}
      style={{
        background: `linear-gradient(160deg, #d4aa50, ${a}60, #8b6914, ${a}50, #d4aa50)`,
        boxShadow: glow
          ? `0 2px 8px rgba(0,0,0,0.55), 0 0 0 1px rgba(40,28,8,0.8), 0 0 20px ${glow}`
          : "0 2px 8px rgba(0,0,0,0.55), 0 0 0 1px rgba(40,28,8,0.8)",
      }}
    >
      {children}
      <FrameCorner className="top-[-2px] left-[-2px]" />
      <FrameCorner className="top-[-2px] right-[-2px]" />
      <FrameCorner className="bottom-[-2px] left-[-2px]" />
      <FrameCorner className="bottom-[-2px] right-[-2px]" />
    </div>
  );
}
