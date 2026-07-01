import React from "react";
import { AbsoluteFill, Series, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { SceneTwist } from "./scenes/SceneTwist";
import { SceneCTA } from "./scenes/SceneCTA";

loadGeist("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

type Reply = { text: string };

export type MisreadProps = {
  timestamp: string;
  message: string;
  replies: Reply[];
  flaggedIndex: number;
  signalLabel: string;
  twist: string;
};

// Scene 1: message appears immediately (no hook), positioned near top
const MessageTop: React.FC<{ timestamp: string; message: string }> = ({ timestamp, message }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const charsPerFrame = 0.9;
  const startTypingAt = 4;
  const typedCount = Math.max(0, Math.floor((frame - startTypingAt) * charsPerFrame));
  const typed = message.slice(0, Math.min(typedCount, message.length));
  const showCaret = frame % 20 < 12 && typed.length < message.length;

  const bubbleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 180 } });
  const bubbleY = interpolate(bubbleSpring, [0, 1], [30, 0]);
  const tsOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        padding: "260px 70px 0",
        fontFamily: "Geist, sans-serif",
      }}
    >
      <div style={{ opacity: tsOpacity, textAlign: "center", marginBottom: 24 }}>
        <span
          style={{
            color: "#666",
            fontSize: 24,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {timestamp} · from him
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
            maxWidth: "86%",
            backgroundColor: "#1c1c1e",
            color: "#F5F1E8",
            padding: "34px 40px",
            borderRadius: 40,
            borderBottomLeftRadius: 12,
            fontSize: 50,
            lineHeight: 1.3,
            fontWeight: 400,
          }}
        >
          {typed}
          {showCaret && <span style={{ color: "#E8A87C", marginLeft: 4 }}>▍</span>}
        </div>
      </div>
      <div style={{ marginTop: 16, marginLeft: 20, opacity: tsOpacity }}>
        <span style={{ color: "#555", fontSize: 22, fontWeight: 500 }}>your friend, 2:14 am</span>
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: message stays pinned at top, replies appear directly beneath with big number chips
const RepliesTop: React.FC<{ timestamp: string; message: string; replies: Reply[] }> = ({
  timestamp,
  message,
  replies,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pickOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        padding: "260px 70px 0",
        fontFamily: "Geist, sans-serif",
      }}
    >
      {/* Pinned message */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span
          style={{
            color: "#555",
            fontSize: 20,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {timestamp} · from him
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 30 }}>
        <div
          style={{
            maxWidth: "86%",
            backgroundColor: "#1c1c1e",
            color: "#B8B4AC",
            padding: "24px 32px",
            borderRadius: 32,
            borderBottomLeftRadius: 10,
            fontSize: 34,
            lineHeight: 1.3,
          }}
        >
          {message}
        </div>
      </div>

      {/* Prompt */}
      <div style={{ textAlign: "center", opacity: pickOpacity, marginBottom: 28 }}>
        <span
          style={{
            color: "#E8A87C",
            fontSize: 28,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          how do you reply?
        </span>
      </div>

      {/* Numbered replies */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {replies.map((r, i) => {
          const delay = 6 + i * 8;
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
                display: "flex",
                alignItems: "center",
                gap: 24,
                justifyContent: "flex-end",
              }}
            >
              {/* number chip overlay */}
              <div
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: 999,
                  backgroundColor: "#E8A87C",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 44,
                  fontWeight: 700,
                  flexShrink: 0,
                  boxShadow: "0 0 0 6px rgba(232,168,124,0.15)",
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  maxWidth: "78%",
                  backgroundColor: "#2C6DF6",
                  color: "#fff",
                  padding: "26px 34px",
                  borderRadius: 36,
                  borderBottomRightRadius: 12,
                  fontSize: 40,
                  lineHeight: 1.28,
                  fontWeight: 500,
                }}
              >
                {r.text}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const MainVideoMisread: React.FC<MisreadProps> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Series>
        <Series.Sequence durationInFrames={110}>
          <MessageTop timestamp={props.timestamp} message={props.message} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={110}>
          <RepliesTop
            timestamp={props.timestamp}
            message={props.message}
            replies={props.replies}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <SceneTwist
            twist={props.twist}
            flaggedReply={{ emoji: `${props.flaggedIndex + 1}`, text: props.replies[props.flaggedIndex].text }}
            signalLabel={props.signalLabel}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={75}>
          <SceneCTA />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
