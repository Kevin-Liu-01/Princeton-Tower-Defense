"use client";
import React, { useRef, useState, useEffect } from "react";
import type { RefObject } from "react";

interface SectionRevealProps {
  children: React.ReactNode;
  scrollRoot: RefObject<HTMLDivElement | null>;
  delay?: number;
  className?: string;
}

export function SectionReveal({
  children,
  scrollRoot,
  delay = 0,
  className,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setVisible(true));
          });
          observer.disconnect();
        }
      },
      { root: scrollRoot.current, rootMargin: "300px 0px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollRoot]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: mounted ? undefined : 300,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.8s ease-out ${delay}ms, transform 0.8s ease-out ${delay}ms`,
      }}
    >
      {mounted ? children : null}
    </div>
  );
}
