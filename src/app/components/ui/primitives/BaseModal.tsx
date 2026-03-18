"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zClass?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  blurClass?: string;
  backdropBg?: string;
  paddingClass?: string;
  usePortal?: boolean;
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
    (event: React.MouseEvent) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose],
  );

  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen || !mounted) {
    return null;
  }

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
