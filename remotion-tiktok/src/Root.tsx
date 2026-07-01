import React from "react";
import { Composition } from "remotion";
import { MainVideo, VideoProps } from "./MainVideo";
import { MainVideoMisread, MisreadProps } from "./MainVideoMisread";

const MISREAD_V2: MisreadProps = {
  timestamp: "2:14 am",
  message: "you think she was into it right? like i didn't misread it?",
  replies: [
    { text: "hey. what does she say when you ask her?" },
    { text: "if you're asking me, you already know" },
    { text: "haha bro you're fine, don't overthink it" },
  ],
  flaggedIndex: 2,
  signalLabel: "letting him off the hook",
  twist: "most friends pick #3. here's why ito flags it.",
};

const SCENARIOS: Record<string, VideoProps> = {
  "misread-v1": {
    hook: "he sent this. what do you say?",
    timestamp: "2:14 AM",
    message: "you were into it right? like i didn't misread it?",
    replies: [
      { emoji: "🎯", text: "we should talk tomorrow, not now" },
      { emoji: "🫶", text: "i need a minute to think about it" },
      { emoji: "🪶", text: "haha you're overthinking it" },
    ],
    flaggedIndex: 2,
    signalLabel: "avoiding the question",
    twist: "most people pick the last one. here's why ito flags it.",
  },
  dramatic: {
    hook: "he sent this. what do you say?",
    timestamp: "yesterday",
    message: "you're being dramatic. it wasn't that deep.",
    replies: [
      { emoji: "🎯", text: "it was that deep to me" },
      { emoji: "🫶", text: "can we actually talk about it" },
      { emoji: "🪶", text: "you're right, sorry" },
    ],
    flaggedIndex: 2,
    signalLabel: "minimizing your read",
    twist: "the last one feels easiest. it's the one ito flags.",
  },
  samepage: {
    hook: "he sent this. what do you say?",
    timestamp: "this morning",
    message: "i thought we were on the same page last night.",
    replies: [
      { emoji: "🎯", text: "we weren't. we should talk." },
      { emoji: "🫶", text: "i don't think we were, actually" },
      { emoji: "🪶", text: "idk, maybe i was being weird" },
    ],
    flaggedIndex: 2,
    signalLabel: "rewriting your own memory",
    twist: "most people pick the last one. ito reads it differently.",
  },
};

export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(SCENARIOS).map(([id, props]) => (
      <Composition
        key={id}
        id={id}
        component={MainVideo}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={props}
      />
    ))}
    <Composition
      id="misread"
      component={MainVideoMisread}
      durationInFrames={415}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={MISREAD_V2}
    />
  </>
);
