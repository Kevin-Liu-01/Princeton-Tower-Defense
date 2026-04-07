"use client";
import {
  MoreHorizontal,
  Info,
  Github,
  Share2,
  Bug,
  Gamepad2,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

import { SITE_URL, GITHUB_URL, AUTHOR_URL } from "../../seo/constants";
import { GOLD, OVERLAY, panelGradient } from "../ui/system/theme";

const SHARE_URL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
  `@kevskgs made a fire free browser TD game with 26 levels, 9 heroes, and spells ⚔️🏰🐅\n\nTry it out 👇`
)}&url=${encodeURIComponent(`${SITE_URL}/`)}&hashtags=${encodeURIComponent(
  "gamedev,indiegame,towdefense,princeton"
)}`;

interface DropdownItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

interface NavMoreDropdownProps {
  onShowCredits: () => void;
}

export const NavMoreDropdown: React.FC<NavMoreDropdownProps> = ({
  onShowCredits,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(
    null
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      right: window.innerWidth - rect.right,
      top: rect.bottom + 8,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  const close = useCallback(() => {
    setOpen(false);
    setMenuPos(null);
  }, []);

  const items: (DropdownItem | "divider")[] = [
    {
      icon: Info,
      label: "Credits",
      onClick: () => {
        onShowCredits();
        close();
      },
    },
    "divider",
    {
      href: GITHUB_URL,
      icon: Github,
      label: "GitHub",
    },
    {
      href: SHARE_URL,
      icon: Share2,
      label: "Share on X",
    },
    {
      href: `${GITHUB_URL}/issues`,
      icon: Bug,
      label: "Report Bug",
    },
    "divider",
    {
      href: AUTHOR_URL,
      icon: Gamepad2,
      label: "More Games",
    },
  ];

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          className="fixed w-48 rounded-xl overflow-hidden shadow-2xl"
          style={{
            background: panelGradient,
            border: `1.5px solid ${GOLD.border30}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 ${OVERLAY.white06}`,
            right: menuPos?.right ?? 0,
            top: menuPos?.top ?? 0,
            visibility: menuPos ? "visible" : "hidden",
            zIndex: 9999,
          }}
        >
          <div
            className="absolute inset-[2px] rounded-[10px] pointer-events-none"
            style={{ border: `1px solid ${GOLD.innerBorder08}` }}
          />
          <div className="py-1">
            {items.map((item, i) => {
              if (item === "divider") {
                return (
                  <div
                    key={`d-${i}`}
                    className="h-px mx-3 my-1"
                    style={{ background: `rgba(180,140,60,0.18)` }}
                  />
                );
              }

              const Icon = item.icon;
              const sharedCls =
                "relative z-10 flex items-center gap-2.5 w-full px-3.5 py-2 transition-all duration-150 hover:bg-amber-600/15 text-left";

              if (item.href) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={sharedCls}
                    onClick={close}
                  >
                    <Icon size={14} className="text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-200/80 font-semibold tracking-wide flex-1">
                      {item.label}
                    </span>
                    <ExternalLink
                      size={10}
                      className="text-amber-500/40 shrink-0"
                    />
                  </a>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={sharedCls}
                >
                  <Icon size={14} className="text-amber-400 shrink-0" />
                  <span className="text-xs text-amber-200/80 font-semibold tracking-wide">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => {
          if (!open) {
            updatePosition();
          }
          setOpen((prev) => !prev);
        }}
        className="relative flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-150 hover:bg-amber-600/15"
        style={{
          background: `linear-gradient(180deg, rgba(55,38,20,0.85), rgba(38,26,14,0.85))`,
          border: `1.5px solid ${GOLD.border30}`,
          boxShadow: open
            ? `inset 0 1px 0 ${OVERLAY.white06}, inset 0 0 16px ${GOLD.glow04}, 0 0 8px ${GOLD.glow04}`
            : `inset 0 1px 0 ${OVERLAY.white06}, inset 0 0 16px ${GOLD.glow04}`,
        }}
        title="More options"
      >
        <MoreHorizontal size={15} className="text-amber-300/70 shrink-0" />
        <span className="hidden md:inline text-xs text-amber-200/70 font-bold tracking-wider uppercase">
          More
        </span>
      </button>
      {menu}
    </>
  );
};
