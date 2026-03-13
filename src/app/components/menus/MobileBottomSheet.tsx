"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleIcon?: React.ReactNode;
  accentColor?: string;
  children: React.ReactNode;
}

const ANIM_DURATION_MS = 300;

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  titleIcon,
  accentColor = "rgba(180,140,60,0.4)",
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), ANIM_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, ANIM_DURATION_MS);
  }, [onClose]);

  useEffect(() => {
    if (!mounted) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mounted, handleClose]);

  if (!mounted) return null;

  const sheet = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0,
          transition: `opacity ${ANIM_DURATION_MS}ms ease`,
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxHeight: "70dvh",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(38,32,24,0.99) 0%, rgba(20,16,10,0.99) 100%)",
          borderTop: `1.5px solid ${accentColor}`,
          boxShadow: `0 -8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: `transform ${ANIM_DURATION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4 }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.15)",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px 8px 16px",
            borderBottom: `1px solid ${accentColor}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {titleIcon}
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#fde68a",
              }}
            >
              {title}
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              color: "#a8a29e",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            overflowY: "auto",
            maxHeight: "calc(70dvh - 60px)",
            padding: 12,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheet, document.body);
};
