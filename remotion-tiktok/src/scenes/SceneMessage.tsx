import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const SceneMessage: React.FC<{ timestamp: string; message: string }> = ({
  timestamp,
  message,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // typewriter for message
  const charsPerFrame = 0.9; // ~27 chars/sec — fast but readable
  const startTypingAt = 10;
  const typedCount = Math.max(0, Math.floor((frame - startTypingAt) * charsPerFrame));
  const typed = message.slice(0, Math.min(typedCount, message.length));
  const showCaret = frame % 20 < 12 && typed.length < message.length;

  const bubbleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 180 } });
  const bubbleY = interpolate(bubbleSpring, [0, 1], [40, 0]);
  const tsOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: "0 70px",
        fontFamily: "Geist, sans-serif",
      }}
    >
      <div style={{ opacity: tsOpacity, textAlign: "center", marginBottom: 30 }}>
        <span
          style={{
            color: "#666",
            fontSize: 26,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          {timestamp}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          opacity: bubbleSpring,
          transform: `translateY(${bubbleY}px)`,
        }}
      >
        <div
          style={{
            maxWidth: "82%",
            backgroundColor: "#1c1c1e",
            color: "#F5F1E8",
            padding: "36px 42px",
            borderRadius: 44,
            borderBottomLeftRadius: 12,
            fontSize: 54,
            lineHeight: 1.32,
            fontWeight: 400,
          }}
        >
          {typed}
          {showCaret && (
            <span style={{ color: "#E8A87C", marginLeft: 4 }}>▍</span>
          )}
        </div>
      </div>
      <div style={{ marginTop: 20, marginLeft: 20, opacity: tsOpacity }}>
        <span style={{ color: "#555", fontSize: 22, fontWeight: 500 }}>him</span>
      </div>
    </AbsoluteFill>
  );
};
