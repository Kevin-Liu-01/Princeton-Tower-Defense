"use client";

import React, { useEffect, useState } from "react";
import { Coins, Timer } from "lucide-react";
import { AMBER_CARD } from "./theme";

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
