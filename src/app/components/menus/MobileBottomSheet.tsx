"use client";

import { X } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

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
    if (!mounted) {
      return;
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mounted, handleClose]);

  if (!mounted) {
    return null;
  }

  const sheet = (
    <div
      style={{
        alignItems: "flex-end",
        display: "flex",
        inset: 0,
        justifyContent: "center",
        pointerEvents: visible ? "auto" : "none",
        position: "fixed",
        zIndex: 9999,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          WebkitBackdropFilter: "blur(4px)",
          backdropFilter: "blur(4px)",
          background: "rgba(0,0,0,0.75)",
          inset: 0,
          opacity: visible ? 1 : 0,
          position: "absolute",
          transition: `opacity ${ANIM_DURATION_MS}ms ease`,
        }}
      />

      {/* Sheet */}
      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(38,32,24,0.99) 0%, rgba(20,16,10,0.99) 100%)",
          borderTop: `1.5px solid ${accentColor}`,
          boxShadow: `0 -8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
          maxHeight: "70dvh",
          overflow: "hidden",
          position: "relative",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: `transform ${ANIM_DURATION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
          width: "100%",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 4,
            paddingTop: 10,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 9999,
              height: 4,
              width: 40,
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            alignItems: "center",
            borderBottom: `1px solid ${accentColor}`,
            display: "flex",
            justifyContent: "space-between",
            padding: "0 16px 8px 16px",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flex: 1,
              gap: 8,
              minWidth: 0,
            }}
          >
            {titleIcon && <span style={{ flexShrink: 0 }}>{titleIcon}</span>}
            <span
              style={{
                color: "#fde68a",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.15em",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              alignItems: "center",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#a8a29e",
              cursor: "pointer",
              display: "flex",
              height: 28,
              justifyContent: "center",
              width: 28,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            WebkitOverflowScrolling: "touch",
            maxHeight: "calc(70dvh - 60px)",
            overflowY: "auto",
            padding: 12,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }
  return createPortal(sheet, document.body);
};
