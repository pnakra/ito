import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const l1 = spring({ frame, fps, config: { damping: 18, stiffness: 180 } });
  const l2 = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 180 } });
  const l3 = spring({ frame: frame - 22, fps, config: { damping: 18, stiffness: 180 } });

  const pulse = 1 + Math.sin(frame / 8) * 0.02;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 70,
        gap: 40,
        fontFamily: "Geist, sans-serif",
        textAlign: "center",
      }}
    >
      <div
        style={{
          opacity: l1,
          transform: `translateY(${interpolate(l1, [0, 1], [20, 0])}px)`,
        }}
      >
        <span
          style={{
            color: "#888",
            fontSize: 32,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          try it with
        </span>
      </div>
      <div
        style={{
          opacity: l2,
          transform: `translateY(${interpolate(l2, [0, 1], [20, 0])}px) scale(${pulse})`,
        }}
      >
        <span
          style={{
            color: "#F5F1E8",
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -1.5,
            lineHeight: 1.1,
          }}
        >
          a text you<br />actually got.
        </span>
      </div>
      <div
        style={{
          opacity: l3,
          marginTop: 30,
          transform: `translateY(${interpolate(l3, [0, 1], [20, 0])}px)`,
        }}
      >
        <span
          style={{
            color: "#E8A87C",
            fontSize: 56,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          isthisok.app/misread
        </span>
      </div>
      <div style={{ opacity: l3, marginTop: 20 }}>
        <span style={{ color: "#555", fontSize: 24, letterSpacing: 1 }}>type it in</span>
      </div>
    </AbsoluteFill>
  );
};
