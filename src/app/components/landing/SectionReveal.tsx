"use client";
import React, { useRef, useState, useEffect, type RefObject } from "react";

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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, root: scrollRoot.current },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollRoot]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.8s ease-out ${delay}ms, transform 0.8s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
