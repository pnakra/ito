import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const SceneHook: React.FC<{ hook: string }> = ({ hook }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = hook.split(" ");
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        fontFamily: "Geist, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.35em" }}>
        {words.map((w, i) => {
          const delay = i * 4;
          const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 220 } });
          const y = interpolate(s, [0, 1], [30, 0]);
          return (
            <span
              key={i}
              style={{
                fontSize: 88,
                fontWeight: 700,
                color: "#F5F1E8",
                letterSpacing: -1,
                opacity: s,
                transform: `translateY(${y}px)`,
                lineHeight: 1.1,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
