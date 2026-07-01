import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Reply } from "../MainVideo";

export const SceneTwist: React.FC<{
  twist: string;
  flaggedReply: Reply;
  signalLabel: string;
}> = ({ twist, flaggedReply, signalLabel }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const twistOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const twistY = interpolate(frame, [0, 18], [20, 0], { extrapolateRight: "clamp" });

  const bubbleSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 18, stiffness: 180 },
  });
  const bubbleY = interpolate(bubbleSpring, [0, 1], [40, 0]);

  const chipSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 16, stiffness: 200 },
  });
  const chipY = interpolate(chipSpring, [0, 1], [20, 0]);

  // Amber underline draws in
  const underlineWidth = interpolate(frame, [40, 70], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: "0 70px",
        gap: 60,
        fontFamily: "Geist, sans-serif",
      }}
    >
      <div
        style={{
          opacity: twistOpacity,
          transform: `translateY(${twistY}px)`,
          textAlign: "center",
        }}
      >
        <span
          style={{
            color: "#F5F1E8",
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: -0.5,
            lineHeight: 1.25,
          }}
        >
          {twist}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          opacity: bubbleSpring,
          transform: `translateY(${bubbleY}px)`,
        }}
      >
        <div
          style={{
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
            position: "relative",
          }}
        >
          <span style={{ fontSize: 48 }}>{flaggedReply.emoji}</span>
          <span style={{ position: "relative" }}>
            {flaggedReply.text}
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: -8,
                height: 4,
                width: `${underlineWidth}%`,
                backgroundColor: "#E8A87C",
                borderRadius: 2,
              }}
            />
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          opacity: chipSpring,
          transform: `translateY(${chipY}px)`,
        }}
      >
        <div
          style={{
            border: "2px solid #E8A87C",
            color: "#E8A87C",
            padding: "18px 32px",
            borderRadius: 999,
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          ito reads: {signalLabel}
        </div>
      </div>
    </AbsoluteFill>
  );
};
