"use client";
import { useState, useEffect } from "react";

export function useCrossfade(count: number, intervalMs: number): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [count, intervalMs]);

  return index;
}
