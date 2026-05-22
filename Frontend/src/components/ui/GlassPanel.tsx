import { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  position?: "left" | "right" | "bottom" | "center";
}

export function GlassPanel({
  children,
  className = "",
  position = "right",
}: GlassPanelProps) {
  const positionClasses = {
    left: "left-4 top-1/2 -translate-y-1/2",
    right: "right-4 top-1/2 -translate-y-1/2",
    bottom: "bottom-4 left-1/2 -translate-x-1/2",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} glass-strong p-4 animate-slide-up ${className}`}
    >
      {children}
    </div>
  );
}
