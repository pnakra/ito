import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Reply } from "../MainVideo";

export const SceneReplies: React.FC<{
  timestamp: string;
  message: string;
  replies: Reply[];
}> = ({ timestamp, message, replies }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pickOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        padding: "140px 70px 100px",
        fontFamily: "Geist, sans-serif",
        justifyContent: "space-between",
      }}
    >
      {/* Shrunken message context */}
      <div>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span
            style={{
              color: "#555",
              fontSize: 20,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {timestamp} — him
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div
            style={{
              maxWidth: "82%",
              backgroundColor: "#1c1c1e",
              color: "#B8B4AC",
              padding: "22px 30px",
              borderRadius: 30,
              borderBottomLeftRadius: 10,
              fontSize: 34,
              lineHeight: 1.32,
            }}
          >
            {message}
          </div>
        </div>
      </div>

      {/* Pick prompt */}
      <div style={{ textAlign: "center", opacity: pickOpacity }}>
        <span
          style={{
            color: "#888",
            fontSize: 30,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          pick one.
        </span>
      </div>

      {/* Reply bubbles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-end" }}>
        {replies.map((r, i) => {
          const delay = 8 + i * 8;
          const s = spring({
            frame: frame - delay,
            fps,
            config: { damping: 18, stiffness: 200 },
          });
          const x = interpolate(s, [0, 1], [80, 0]);
          return (
            <div
              key={i}
              style={{
                opacity: s,
                transform: `translateX(${x}px)`,
                maxWidth: "88%",
                backgroundColor: "#2C6DF6",
                color: "#fff",
                padding: "30px 38px",
                borderRadius: 40,
                borderBottomRightRadius: 12,
                fontSize: 44,
                lineHeight: 1.28,
                fontWeight: 500,
                display: "flex",
                gap: 18,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 48 }}>{r.emoji}</span>
              <span>{r.text}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
