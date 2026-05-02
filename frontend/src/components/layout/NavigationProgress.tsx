"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => timer.current.forEach(clearTimeout);

  useEffect(() => {
    clear();
    setVisible(true);
    setWidth(20);
    timer.current = [
      setTimeout(() => setWidth(60), 80),
      setTimeout(() => setWidth(85), 300),
      setTimeout(() => {
        setWidth(100);
        timer.current = [setTimeout(() => { setVisible(false); setWidth(0); }, 200)];
      }, 500),
    ];
    return clear;
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "2px",
        width: `${width}%`,
        background: "#000",
        transition: "width 0.25s ease",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}
