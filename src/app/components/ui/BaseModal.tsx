"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** z-index class or inline value. Defaults to "z-50". */
  zClass?: string;
  /** Whether clicking the backdrop closes the modal. Defaults to true. */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes the modal. Defaults to true. */
  closeOnEscape?: boolean;
  /** Backdrop blur class. Defaults to "backdrop-blur-sm". */
  blurClass?: string;
  /** Backdrop background style. Defaults to "rgba(0,0,0,0.6)". */
  backdropBg?: string;
  /** Padding class for the outer container. Defaults to "p-4". */
  paddingClass?: string;
  /** Whether to render via portal into document.body. Defaults to false. */
  usePortal?: boolean;
  /** Extra className on the outer container (after fixed/flex/center). */
  className?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  zClass = "z-50",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  blurClass = "backdrop-blur-sm",
  backdropBg = "rgba(0,0,0,0.6)",
  paddingClass = "p-4",
  usePortal = false,
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose],
  );

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      className={`fixed inset-0 ${zClass} flex items-center justify-center ${paddingClass} ${blurClass} ${className ?? ""}`}
      style={{ background: backdropBg }}
      onClick={handleBackdropClick}
    >
      {children}
    </div>
  );

  if (usePortal && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
};
