"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  Check,
  Crosshair,
  Flame,
  Info,
  Shield,
  Users,
  X,
  Zap,
} from "lucide-react";
import { PANEL, GOLD, RED_CARD, GREEN_CARD, BLUE_CARD, AMBER_CARD, panelGradient } from "./theme";

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export type NotificationType = "info" | "success" | "warning" | "error" | "action" | "spell";

export type NotificationIcon =
  | "info" | "warning" | "error" | "success"
  | "crosshair" | "flame" | "zap" | "shield" | "users" | "camera";

export interface GameNotification {
  id: string;
  type: NotificationType;
  message: string;
  submessage?: string;
  icon?: NotificationIcon;
  duration?: number;
  dismissible?: boolean;
  pulse?: boolean;
}

// =============================================================================
// THEME CONFIGS
// =============================================================================

interface NotificationTheme {
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  textClass: string;
  subTextClass: string;
}

const NOTIFICATION_THEMES: Record<NotificationType, NotificationTheme> = {
  info: {
    bgGradient: `linear-gradient(135deg, ${BLUE_CARD.bgLight}, ${BLUE_CARD.bgDark})`,
    borderColor: BLUE_CARD.border,
    glowColor: BLUE_CARD.glow,
    textClass: "text-blue-100",
    subTextClass: "text-blue-400",
  },
  success: {
    bgGradient: `linear-gradient(135deg, ${GREEN_CARD.bgLight}, ${GREEN_CARD.bgDark})`,
    borderColor: GREEN_CARD.border,
    glowColor: GREEN_CARD.glow,
    textClass: "text-emerald-100",
    subTextClass: "text-emerald-400",
  },
  warning: {
    bgGradient: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
    borderColor: AMBER_CARD.border,
    glowColor: AMBER_CARD.glow,
    textClass: "text-amber-100",
    subTextClass: "text-amber-400",
  },
  error: {
    bgGradient: `linear-gradient(135deg, ${RED_CARD.bgLight}, ${RED_CARD.bgDark})`,
    borderColor: RED_CARD.border,
    glowColor: RED_CARD.glow06,
    textClass: "text-red-100",
    subTextClass: "text-red-400",
  },
  action: {
    bgGradient: panelGradient,
    borderColor: GOLD.border30,
    glowColor: GOLD.glow07,
    textClass: "text-amber-100",
    subTextClass: "text-amber-400",
  },
  spell: {
    bgGradient: panelGradient,
    borderColor: GOLD.border30,
    glowColor: GOLD.glow07,
    textClass: "text-purple-100",
    subTextClass: "text-purple-400",
  },
};

const ICON_COMPONENTS: Record<NotificationIcon, React.FC<{ size: number; className?: string }>> = {
  info: Info,
  warning: AlertTriangle,
  error: X,
  success: Check,
  crosshair: Crosshair,
  flame: Flame,
  zap: Zap,
  shield: Shield,
  users: Users,
  camera: Camera,
};

const ICON_CLASSES: Record<NotificationType, string> = {
  info: "text-blue-400",
  success: "text-emerald-400",
  warning: "text-amber-400",
  error: "text-red-400",
  action: "text-amber-400",
  spell: "text-purple-400",
};

const DEFAULT_ICONS: Record<NotificationType, NotificationIcon> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
  action: "crosshair",
  spell: "flame",
};

// =============================================================================
// CONTEXT & HOOK
// =============================================================================

interface NotificationContextValue {
  notify: (notification: Omit<GameNotification, "id">) => string;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

// =============================================================================
// PROVIDER
// =============================================================================

let notificationCounter = 0;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const notify = useCallback((notification: Omit<GameNotification, "id">): string => {
    const id = `notif-${++notificationCounter}-${Date.now()}`;
    const full: GameNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 3000,
      dismissible: notification.dismissible ?? true,
    };

    setNotifications((prev) => {
      const next = [...prev, full];
      return next.length > 5 ? next.slice(-5) : next;
    });

    if (full.duration && full.duration > 0) {
      const timer = setTimeout(() => dismiss(id), full.duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [dismiss]);

  const clearAll = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
    setNotifications([]);
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, dismiss, clearAll }}>
      {children}
      <NotificationContainer notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
};

// =============================================================================
// NOTIFICATION CONTAINER
// =============================================================================

interface NotificationContainerProps {
  notifications: GameNotification[];
  onDismiss: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none"
      style={{ zIndex: 200 }}
    >
      {notifications.map((n) => (
        <NotificationToast key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

// =============================================================================
// SINGLE NOTIFICATION TOAST
// =============================================================================

interface NotificationToastProps {
  notification: GameNotification;
  onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  const theme = NOTIFICATION_THEMES[notification.type];
  const iconKey = notification.icon ?? DEFAULT_ICONS[notification.type];
  const IconComp = ICON_COMPONENTS[iconKey];
  const iconClass = ICON_CLASSES[notification.type];

  return (
    <div
      className={`pointer-events-auto px-4 py-2 rounded-lg backdrop-blur-sm shadow-xl ${notification.pulse ? "animate-pulse" : ""}`}
      style={{
        background: theme.bgGradient,
        border: `1.5px solid ${theme.borderColor}`,
        boxShadow: `0 0 20px ${theme.glowColor}`,
        animation: "notifSlideIn 0.3s ease-out",
        maxWidth: 400,
      }}
    >
      <div className="flex items-center gap-2">
        <IconComp size={16} className={iconClass} />
        <div className="flex flex-col">
          <span className={`text-sm font-bold tracking-wide ${theme.textClass}`}>
            {notification.message}
          </span>
          {notification.submessage && (
            <span className={`text-xs ${theme.subTextClass}`}>
              {notification.submessage}
            </span>
          )}
        </div>
        {notification.dismissible && (
          <button
            onClick={() => onDismiss(notification.id)}
            className="ml-2 p-0.5 rounded hover:bg-white/10 transition-colors"
          >
            <X size={12} className="text-white/50" />
          </button>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// CSS KEYFRAMES (inject once)
// =============================================================================

const NOTIFICATION_STYLES = `
@keyframes notifSlideIn {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

if (typeof document !== "undefined") {
  const styleId = "ptd-notification-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = NOTIFICATION_STYLES;
    document.head.appendChild(style);
  }
}
