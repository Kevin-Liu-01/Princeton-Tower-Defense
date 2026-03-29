"use client";

import React, { useState, useCallback, useRef } from "react";
import { Share2, Check } from "lucide-react";
import { PANEL, GOLD } from "../../ui/system/theme";

interface ShareLevelButtonProps {
  levelId: string;
  levelName: string;
  iconSize?: number;
  className?: string;
}

function buildLevelUrl(levelId: string): string {
  if (typeof window === "undefined") return `/${levelId}`;
  return `${window.location.origin}/${levelId}`;
}

export function ShareLevelButton({
  levelId,
  levelName,
  iconSize = 14,
  className = "",
}: ShareLevelButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = buildLevelUrl(levelId);

      if (navigator.share) {
        try {
          await navigator.share({
            title: `${levelName} — Princeton TD`,
            url,
          });
          return;
        } catch {
          // User cancelled or share failed — fall through to clipboard
        }
      }

      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // Clipboard API not available in insecure contexts
        return;
      }

      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1800);
    },
    [levelId, levelName],
  );

  const Icon = copied ? Check : Share2;

  return (
    <button
      onClick={handleShare}
      className={`p-1.5 rounded-lg transition-all hover:scale-110 shrink-0 ${className}`}
      style={{
        background: PANEL.bgWarmMid,
        border: `1px solid ${GOLD.border25}`,
      }}
      title={copied ? "Link copied!" : "Share level"}
    >
      <Icon
        size={iconSize}
        className={
          copied
            ? "text-emerald-400 transition-colors"
            : "text-amber-400 transition-colors"
        }
      />
    </button>
  );
}
