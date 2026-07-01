import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadNewsreader } from "@remotion/google-fonts/Newsreader";
import { SceneHook } from "./scenes/SceneHook";
import { SceneMessage } from "./scenes/SceneMessage";
import { SceneReplies } from "./scenes/SceneReplies";
import { SceneTwist } from "./scenes/SceneTwist";
import { SceneCTA } from "./scenes/SceneCTA";

loadGeist("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
loadNewsreader("normal", { weights: ["400", "500"], subsets: ["latin"] });

export type Reply = { emoji: string; text: string };
export type VideoProps = {
  hook: string;
  timestamp: string;
  message: string;
  replies: Reply[];
  flaggedIndex: number;
  signalLabel: string;
  twist: string;
};

export const MainVideo: React.FC<VideoProps> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Series>
        <Series.Sequence durationInFrames={45}>
          <SceneHook hook={props.hook} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <SceneMessage timestamp={props.timestamp} message={props.message} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <SceneReplies
            timestamp={props.timestamp}
            message={props.message}
            replies={props.replies}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <SceneTwist
            twist={props.twist}
            flaggedReply={props.replies[props.flaggedIndex]}
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
