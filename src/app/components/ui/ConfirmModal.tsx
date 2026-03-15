"use client";

import React, { useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { OrnateFrame } from "./OrnateFrame";
import { PANEL, GOLD, OVERLAY, dividerGradient } from "./theme";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  titleIcon?: LucideIcon;
  confirmIcon?: LucideIcon;
  cancelIcon?: LucideIcon;
}

const VARIANT_STYLES = {
  danger: {
    confirmBg: "linear-gradient(180deg, rgba(140,30,30,0.85), rgba(90,18,18,0.9))",
    confirmBorder: "1.5px solid rgba(220,60,60,0.5)",
    confirmShadow: "0 4px 12px rgba(140,30,30,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
    confirmText: "text-red-100",
    titleIconClass: "text-red-400",
    iconBg: "linear-gradient(135deg, rgba(80,16,16,0.9), rgba(55,10,10,0.9))",
    iconBorder: "2px solid rgba(220,60,60,0.4)",
    iconShadow: "0 4px 12px rgba(140,30,30,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
  },
  warning: {
    confirmBg: "linear-gradient(180deg, rgba(160,115,20,0.85), rgba(110,75,15,0.9))",
    confirmBorder: `1.5px solid ${GOLD.border40}`,
    confirmShadow: "0 4px 12px rgba(160,115,20,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
    confirmText: "text-amber-100",
    titleIconClass: "text-amber-400",
    iconBg: "linear-gradient(135deg, rgba(60,42,12,0.9), rgba(40,28,8,0.9))",
    iconBorder: `2px solid ${GOLD.border35}`,
    iconShadow: "0 4px 12px rgba(160,115,20,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
  },
} as const;

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  titleIcon: TitleIcon,
  confirmIcon: ConfirmIcon,
  cancelIcon: CancelIcon,
}) => {
  const styles = VARIANT_STYLES[variant];

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      zClass="z-[200]"
      usePortal
      backdropBg="rgba(0,0,0,0.65)"
      blurClass="backdrop-blur-sm"
    >
      <OrnateFrame
        className="pointer-events-auto w-full max-w-[340px]"
        cornerSize={18}
        cornerVariant="compact"
        sideBorderVariant="compact"
        topBottomBorderVariant="compact"
        showBorders
        showTopBottomBorders
      >
        <div
          className="flex flex-col items-center gap-4 px-6 py-5"
          style={{
            background: `linear-gradient(180deg, ${PANEL.bgLight} 0%, ${PANEL.bgDark} 100%)`,
            boxShadow: `0 20px 50px rgba(0,0,0,0.5), inset 0 0 22px rgba(245,158,11,0.04)`,
          }}
        >
          {TitleIcon && (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{
                background: styles.iconBg,
                border: styles.iconBorder,
                boxShadow: styles.iconShadow,
              }}
            >
              <TitleIcon size={22} className={styles.titleIconClass} />
            </div>
          )}

          <h2 className="text-center text-base font-bold text-amber-100/90 tracking-wide">
            {title}
          </h2>

          <div className="h-px w-full" style={{ background: dividerGradient }} />

          <p className="text-center text-sm leading-relaxed text-amber-200/60">
            {description}
          </p>

          <div className="flex w-full items-center gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-amber-300/70 transition-all hover:brightness-125 active:scale-[0.97]"
              style={{
                background: `linear-gradient(180deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1.5px solid ${GOLD.border25}`,
                boxShadow: `0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 ${OVERLAY.white04}`,
              }}
            >
              {CancelIcon && <CancelIcon size={14} className="opacity-70" />}
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold transition-all hover:brightness-110 active:scale-[0.97] ${styles.confirmText}`}
              style={{
                background: styles.confirmBg,
                border: styles.confirmBorder,
                boxShadow: styles.confirmShadow,
              }}
            >
              {ConfirmIcon && <ConfirmIcon size={14} />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </OrnateFrame>
    </BaseModal>
  );
};
