"use client";

import React, { useEffect, useState } from "react";
import { Coins, Eye, Sparkles, Timer } from "lucide-react";
import { AMBER_CARD, PURPLE_CARD } from "./theme";

interface PaydayNotificationProps {
  active: boolean;
  endTime: number | null;
  pawPointsEarned: number;
}

function formatTimeLeft(endTime: number): string {
  const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  return `${remaining}s`;
}

export const PaydayNotification: React.FC<PaydayNotificationProps> = ({
  active,
  endTime,
  pawPointsEarned,
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active || !endTime) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setTimeLeft(formatTimeLeft(endTime));

    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        setVisible(false);
        clearInterval(interval);
        return;
      }
      setTimeLeft(formatTimeLeft(endTime));
    }, 200);

    return () => clearInterval(interval);
  }, [active, endTime]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-auto mt-2 mx-auto w-fit px-4 py-2 rounded-lg backdrop-blur-sm shadow-xl"
      style={{
        background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
        border: `1.5px solid rgba(250,204,21,0.5)`,
        boxShadow: `0 0 20px rgba(250,204,21,0.15), inset 0 1px 0 rgba(250,204,21,0.1)`,
        animation: "notifSlideIn 0.3s ease-out",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(120,90,20,0.9), rgba(80,58,10,0.9))",
            border: "1.5px solid rgba(250,204,21,0.4)",
          }}
        >
          <Coins size={14} className="text-yellow-300 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wide text-amber-100">
            Paw Point Payday Active
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-amber-300">
              <Coins size={10} />
              <span className="font-semibold">+{pawPointsEarned} PP</span>
            </span>
            <span
              className="flex items-center gap-1 font-medium"
              style={{ color: "rgba(253,230,138,0.8)" }}
            >
              <Timer size={10} />
              {timeLeft} remaining
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface HexWardNotificationProps {
  endTime: number | null;
  targetCount: number;
  raiseCap: number;
  raisesRemaining: number;
  damageAmpPct: number;
  blocksHealing: boolean;
}

export const HexWardNotification: React.FC<HexWardNotificationProps> = ({
  endTime,
  targetCount,
  raiseCap,
  raisesRemaining,
  damageAmpPct,
  blocksHealing,
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!endTime || endTime <= Date.now()) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setTimeLeft(formatTimeLeft(endTime));

    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        setVisible(false);
        clearInterval(interval);
        return;
      }
      setTimeLeft(formatTimeLeft(endTime));
    }, 200);

    return () => clearInterval(interval);
  }, [endTime]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-auto mt-2 mx-auto w-fit px-4 py-2 rounded-lg backdrop-blur-sm shadow-xl"
      style={{
        background: `linear-gradient(135deg, ${PURPLE_CARD.bgLight}, ${PURPLE_CARD.bgDark})`,
        border: `1.5px solid rgba(192,132,252,0.5)`,
        boxShadow: `0 0 20px rgba(192,132,252,0.18), inset 0 1px 0 rgba(232,121,249,0.08)`,
        animation: "notifSlideIn 0.3s ease-out",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(126,34,206,0.92), rgba(76,29,149,0.92))",
            border: "1.5px solid rgba(232,121,249,0.4)",
          }}
        >
          <Eye size={14} className="text-fuchsia-200 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wide text-fuchsia-100">
            Hex Ward Harvest
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-fuchsia-300">
              <Sparkles size={10} />
              <span className="font-semibold">
                {raisesRemaining}/{raiseCap} raises left
              </span>
            </span>
            <span className="flex items-center gap-1 text-purple-300">
              <Eye size={10} />
              <span className="font-semibold">{targetCount} marked</span>
            </span>
            {(damageAmpPct > 0 || blocksHealing) && (
              <span className="flex items-center gap-1 text-violet-200">
                <Sparkles size={10} />
                <span className="font-semibold">
                  {damageAmpPct > 0 ? `+${damageAmpPct}% dmg` : "no-heal"}
                  {damageAmpPct > 0 && blocksHealing ? " + no-heal" : ""}
                </span>
              </span>
            )}
            <span
              className="flex items-center gap-1 font-medium"
              style={{ color: "rgba(233,213,255,0.85)" }}
            >
              <Timer size={10} />
              {timeLeft} remaining
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
