import { useState, useEffect, useRef } from "react";
import {
  Search, Camera, MessageCircle, User, MapPin,
  Send, ChevronLeft, Plus, Image as ImageIcon,
  Phone, Video, Shield,
  ArrowRight, X, Hand, SquarePen,
  Copy, Check, FileText, Users, HeartPulse,
} from "lucide-react";

/**
 * Clickchat — Jalen's POV.
 * He's been seeing Maya. They've been physical before.
 * Tonight he's pushing for a pic. Signals are mixed, not black & white.
 * ito appears before he sends, asks him to pause and reflect on what he actually wants.
 */

type Screen =
  | "inbox"
  | "conversation"
  | "ito-pause"
  | "ito-rewrite"
  | "ito-reflect";

const C = {
  bg: "#FFFFFF",
  surface: "#FFFDF0",
  surface2: "#FFF9D6",
  text: "#0B1220",
  subtext: "#6A7280",
  border: "#EFE9C6",
  accent: "#FFFC00",
  accentDeep: "#E6D900",
  accentSoft: "#FFFDB8",
  pop: "#FF4D8D",
  bubbleIn: "#F1F2F4",
  bubbleOut: "#FFFC00",
  bubbleOutText: "#0B1220",
  online: "#22D07A",
  itoInk: "#0E1A2B",
  itoSoft: "#F5F1EA",
  itoSoftDeep: "#EBE4D6",
  itoAccent: "#3D5E8C",
  warn: "#C97A1A",
  alert: "#C73838",
};

const MAYA_GRAD = ["#FFB199", "#FF6F61"];

const friends = [
  { id: "maya",   name: "Maya",          initial: "M", grad: MAYA_GRAD,             last: "i'll let u know, kinda tired", time: "now", unread: 1, online: true,  story: true,  delivered: false, live: true },
  { id: "tre",    name: "Tre",           initial: "T", grad: ["#7CC4FF", "#5B8DEF"], last: "u going to the gym tmrw", time: "8m", unread: 0, online: true,  story: false, delivered: true },
  { id: "ben",    name: "Ben",           initial: "B", grad: ["#C8B6FF", "#8A7BFF"], last: "ayo send that clip 😂", time: "22m", unread: 1, online: false, story: false, delivered: false },
  { id: "squad",  name: "the boys",      initial: "★", grad: ["#A8E6CF", "#3DD68C"], last: "Marcus: pulling up 11", time: "1h", unread: 0, online: false, story: false, delivered: true },
  { id: "kayla",  name: "Kayla",         initial: "K", grad: ["#FFD6E0", "#FF8FB1"], last: "you: lol nah u tripping", time: "2h", unread: 0, online: false, story: true,  delivered: true },
  { id: "mom",    name: "Mom",           initial: "🩷", grad: ["#B5E48C", "#76C893"], last: "call me when you can", time: "3h", unread: 0, online: false, story: false, delivered: true },
  { id: "andre",  name: "Andre",         initial: "A", grad: ["#FFD580", "#FF9F45"], last: "📸 sent a snap", time: "5h", unread: 0, online: false, story: true,  delivered: false },
  { id: "team",   name: "intramural ⚽", initial: "⚽", grad: ["#F2A6FF", "#B16CFF"], last: "Coach: practice 6pm", time: "yday", unread: 0, online: false, story: false, delivered: true },
];

const storyFriends = [
  { id: "tre",    initial: "T", grad: ["#7CC4FF", "#5B8DEF"], label: "Tre" },
  { id: "andre",  initial: "A", grad: ["#FFD580", "#FF9F45"], label: "Andre" },
  { id: "maya",   initial: "M", grad: MAYA_GRAD,              label: "Maya" },
  { id: "ben",    initial: "B", grad: ["#C8B6FF", "#8A7BFF"], label: "Ben" },
  { id: "kayla",  initial: "K", grad: ["#FFD6E0", "#FF8FB1"], label: "Kayla" },
  { id: "marcus", initial: "M", grad: ["#A0E7E5", "#54B8B5"], label: "Marcus" },
];

/* Conversation with Maya — they've hooked up before. Tonight she's quieter.
   Jalen ("me") keeps angling for a pic. Mixed signals, not black & white. */
const mayaThread = [
  { from: "me",   text: "yoo what u doing", time: "10:32 PM" },
  { from: "them", text: "just laying down. long day", time: "10:38 PM" },
  { from: "me",   text: "lol same. miss u tho 🙃", time: "10:39 PM" },
  { from: "them", text: "haha you're sweet", time: "10:42 PM" },
  { from: "me",   text: "send me smth 👀", time: "10:43 PM" },
  { from: "them", text: "lol what", time: "10:47 PM" },
  { from: "me",   text: "you know what 😉 like last time", time: "10:48 PM" },
  { from: "them", text: "mmm idk i'm not really feeling it tonight", time: "10:53 PM" },
  { from: "me",   text: "c'monnn just one. for me", time: "10:54 PM" },
  { from: "them", text: "maybe another time", time: "11:02 PM" },
  { from: "me",   text: "you did before tho", time: "11:04 PM" },
  { from: "them", text: "i'll let u know, kinda tired", time: "11:11 PM" },
];

export default function EmbedSender({ onBackToSelect }: { onBackToSelect: () => void }) {
  const [screen, setScreen] = useState<Screen>("inbox");
  const [tab, setTab] = useState<"map" | "chats" | "camera" | "stories" | "you">("chats");

  return (
    <div
      style={{ background: "#0E0F12", minHeight: "100vh" }}
      className="flex items-center justify-center p-6"
    >
      <button
        onClick={onBackToSelect}
        style={{
          position: "fixed", top: 18, left: 18, zIndex: 100,
          padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,0.08)",
          color: "#fff", border: "1px solid rgba(255,255,255,0.15)",
          fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: '"Geist", "Inter", system-ui, sans-serif',
        }}
      >
        <ChevronLeft size={14} /> Switch POV
      </button>

      <div
        style={{
          width: 393,
          height: 852,
          background: C.bg,
          borderRadius: 48,
          boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 0 12px #111 inset, 0 0 0 14px #2a2a2a",
          overflow: "hidden",
          position: "relative",
          color: C.text,
          fontFamily: '"Geist", "Inter", system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{
          position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)",
          width: 120, height: 34, background: "#000", borderRadius: 20, zIndex: 50,
        }} />

        <div style={{
          height: 54, display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", padding: "0 28px 6px", fontSize: 15,
          fontWeight: 600, color: C.text,
        }}>
          <span>11:11</span>
          <span style={{ fontSize: 13 }}>• • • •</span>
        </div>

        <div style={{
          position: "absolute", top: 54, left: 0, right: 0, bottom: 78,
          overflow: "hidden",
        }}>
          {screen === "inbox" && <Inbox onOpen={(id) => {
            if (id === "maya") setScreen("conversation");
          }} />}
          {screen === "conversation" && <Conversation
            onBack={() => setScreen("inbox")}
            onItoPause={() => setScreen("ito-pause")}
            onReflect={() => setScreen("ito-reflect")}
          />}
        </div>

        {screen === "ito-pause" && (
          <ItoPause
            onClose={() => setScreen("conversation")}
            onRewrite={() => setScreen("ito-rewrite")}
            onReflect={() => setScreen("ito-reflect")}
          />
        )}
        {screen === "ito-rewrite" && (
          <ItoRewrite
            onBack={() => setScreen("ito-pause")}
            onClose={() => setScreen("conversation")}
            onReflect={() => setScreen("ito-reflect")}
          />
        )}
        {screen === "ito-reflect" && (
          <ItoReflect
            onClose={() => setScreen("conversation")}
            onBack={() => setScreen("ito-pause")}
          />
        )}

        {(screen === "inbox" || screen === "conversation") && (
          <TabBar tab={tab} onTab={(t) => {
            setTab(t);
            if (t === "chats") setScreen("inbox");
          }} />
        )}
      </div>
    </div>
  );
}

/* ---------------- Inbox ---------------- */

function Inbox({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div style={{ height: "100%", overflowY: "auto", background: C.bg }}>
      <div style={{
        padding: "4px 18px 8px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, letterSpacing: -0.8,
            color: C.text, margin: 0, lineHeight: 1,
          }}>Chats</h1>
          <span style={{ fontSize: 13, color: C.subtext, fontWeight: 500 }}>8</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button style={iconBtn()}><Search size={22} color={C.text} strokeWidth={2.2} /></button>
          <button style={iconBtn()}><SquarePen size={21} color={C.text} strokeWidth={2.2} /></button>
        </div>
      </div>

      <div style={{
        display: "flex", gap: 14, padding: "6px 18px 14px",
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        <AddStory />
        {storyFriends.map((s) => (
          <StoryAvatar key={s.id} grad={s.grad} initial={s.initial} label={s.label} />
        ))}
      </div>

      <div style={{
        padding: "8px 20px 4px", fontSize: 11, fontWeight: 700,
        color: C.subtext, letterSpacing: 0.8, textTransform: "uppercase",
      }}>
        Recent
      </div>

      {friends.map((f) => {
        const live = (f as any).live;
        return (
        <button
          key={f.id}
          onClick={() => onOpen(f.id)}
          disabled={!live}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "9px 18px", background: "transparent", border: "none",
            cursor: live ? "pointer" : "default", textAlign: "left",
            opacity: live ? 1 : 0.55,
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 25,
              background: `linear-gradient(135deg, ${f.grad[0]}, ${f.grad[1]})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, color: "#fff", fontSize: 18,
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.25)",
            }}>{f.initial}</div>
            {f.online && (
              <div style={{
                position: "absolute", bottom: 0, right: 0, width: 13, height: 13,
                borderRadius: 7, background: C.online, border: "2.5px solid #fff",
              }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: C.text, letterSpacing: -0.2 }}>{f.name}</span>
                {live && (
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, color: "#fff",
                    background: C.pop, padding: "2px 6px", borderRadius: 999,
                    letterSpacing: 0.4, textTransform: "uppercase",
                  }}>Tap to demo</span>
                )}
              </div>
              <span style={{ fontSize: 11.5, color: C.subtext, fontWeight: 500 }}>{f.time}</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginTop: 2, gap: 8,
            }}>
              <span style={{
                fontSize: 13, color: f.unread ? C.text : C.subtext,
                fontWeight: f.unread ? 600 : 400,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                flex: 1, minWidth: 0,
              }}>{f.last}</span>
              {f.unread > 0 && (
                <span style={{
                  background: C.pop, color: "#fff", borderRadius: 10,
                  minWidth: 18, height: 18, padding: "0 6px", fontSize: 11,
                  fontWeight: 700, display: "inline-flex", alignItems: "center",
                  justifyContent: "center",
                }}>{f.unread}</span>
              )}
            </div>
          </div>
        </button>
        );
      })}
      <div style={{ height: 20 }} />
    </div>
  );
}

function AddStory() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
      <div style={{
        width: 58, height: 58, borderRadius: 29, background: C.surface,
        border: `2px dashed ${C.border}`, display: "flex",
        alignItems: "center", justifyContent: "center", color: C.subtext,
      }}>
        <Plus size={22} strokeWidth={2.4} />
      </div>
      <span style={{ fontSize: 11, color: C.subtext, fontWeight: 500 }}>You</span>
    </div>
  );
}

function StoryAvatar({ grad, initial, label }: { grad: string[]; initial: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
      <div style={{
        width: 62, height: 62, borderRadius: 31, padding: 2.5,
        background: `conic-gradient(from 210deg, ${C.accent}, ${C.pop}, #FFB347, ${C.accent})`,
      }}>
        <div style={{
          width: "100%", height: "100%", borderRadius: "50%",
          background: "#fff", padding: 2,
        }}>
          <div style={{
            width: "100%", height: "100%", borderRadius: "50%",
            background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, color: "#fff", fontSize: 18,
          }}>{initial}</div>
        </div>
      </div>
      <span style={{ fontSize: 11, color: C.text, fontWeight: 500, maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

/* ---------------- Conversation ---------------- */

function Conversation({ onBack, onItoPause, onReflect }: { onBack: () => void; onItoPause: () => void; onReflect: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg }}>
      <div style={{
        padding: "6px 12px 10px", display: "flex", alignItems: "center",
        gap: 8, borderBottom: `1px solid ${C.border}`,
      }}>
        <button onClick={onBack} style={iconBtn()}>
          <ChevronLeft size={26} color={C.text} />
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: 18,
          background: `linear-gradient(135deg, ${MAYA_GRAD[0]}, ${MAYA_GRAD[1]})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 14, color: "#fff",
          boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.25)",
        }}>M</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>Maya</div>
          <div style={{ fontSize: 11, color: C.subtext, fontWeight: 500 }}>last active 4m ago</div>
        </div>
        <button onClick={onReflect} title="Take a beat" style={iconBtn()}>
          <Shield size={20} color={C.itoInk} />
        </button>
        <button style={iconBtn()}><Phone size={20} color={C.text} /></button>
        <button style={iconBtn()}><Video size={22} color={C.text} /></button>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 12px 8px" }}>
        <div style={{
          textAlign: "center", fontSize: 11, color: C.subtext,
          fontWeight: 600, margin: "4px 0 10px", letterSpacing: 0.3,
        }}>
          Today
        </div>

        {mayaThread.map((m, i) => {
          const prev = mayaThread[i - 1];
          const grouped = prev && prev.from === m.from;
          const next = mayaThread[i + 1];
          const isLastOfGroup = !next || next.from !== m.from;
          return (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: m.from === "me" ? "flex-end" : "flex-start",
                  marginBottom: 3,
                  marginTop: grouped ? 0 : 8,
                }}
              >
                <div style={{
                  maxWidth: "76%",
                  padding: "9px 14px",
                  borderRadius: 22,
                  borderBottomRightRadius: m.from === "me" && isLastOfGroup ? 6 : 22,
                  borderBottomLeftRadius: m.from === "them" && isLastOfGroup ? 6 : 22,
                  background: m.from === "me" ? C.bubbleOut : C.bubbleIn,
                  color: m.from === "me" ? C.bubbleOutText : C.text,
                  fontSize: 14.5,
                  lineHeight: 1.35,
                  fontWeight: m.from === "me" ? 500 : 400,
                }}>
                  {m.text}
                </div>
              </div>
              {isLastOfGroup && (
                <div style={{
                  fontSize: 10.5, color: C.subtext, fontWeight: 500,
                  textAlign: m.from === "me" ? "right" : "left",
                  padding: m.from === "me" ? "2px 6px 0 0" : "2px 0 0 6px",
                }}>
                  {m.time}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ito inline pause — appears above his draft */}
      <div style={{ padding: "4px 12px 8px" }}>
        <button
          onClick={onItoPause}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", background: C.itoSoft,
            border: `1px solid ${C.itoSoftDeep}`, borderRadius: 14,
            cursor: "pointer", textAlign: "left",
          }}
        >
          <ItoMarkSmall />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13.5, fontWeight: 600, color: C.itoInk,
              fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.1,
            }}>
              Take a beat before you send
            </div>
            <div style={{ fontSize: 11.5, color: "#6F6657", marginTop: 1 }}>
              Private. Maya won't see this.
            </div>
          </div>
          <ArrowRight size={16} color={C.itoInk} />
        </button>
      </div>

      <div style={{
        padding: "8px 10px 10px", display: "flex", alignItems: "flex-end",
        gap: 8, borderTop: `1px solid ${C.border}`,
      }}>
        <button style={{
          width: 40, height: 40, borderRadius: 20,
          background: C.accent, border: "none", display: "flex",
          alignItems: "center", justifyContent: "center", cursor: "pointer",
          flexShrink: 0, boxShadow: `0 4px 12px ${C.accent}40`,
        }}>
          <Camera size={20} color="#fff" strokeWidth={2.2} />
        </button>
        <div style={{
          flex: 1, background: "#fff", border: `1.5px solid ${C.accent}`,
          borderRadius: 20, padding: "8px 12px", fontSize: 14,
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: `0 0 0 3px ${C.accent}1A`,
        }}>
          <span style={{ flex: 1, color: C.text, lineHeight: 1.35 }}>
            don't be like that. just one pic, it's not a big deal
            <span style={{
              display: "inline-block", width: 1.5, height: 16,
              background: C.accent, marginLeft: 2, marginBottom: -3,
              animation: "caret 1s steps(2) infinite",
            }} />
          </span>
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: 20,
          background: C.accent, border: "none", display: "flex",
          alignItems: "center", justifyContent: "center", cursor: "pointer",
          flexShrink: 0,
        }}>
          <Send size={18} color="#fff" />
        </button>
        <style>{`@keyframes caret { 50% { opacity: 0; } }`}</style>
      </div>
    </div>
  );
}

function ItoMarkSmall() {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: 9,
      background: `linear-gradient(160deg, ${C.itoInk} 0%, #1B2C44 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
        <path d="M7 6.5 C 5 6.5, 4 8, 4 10 L 4 16 C 4 18, 5 19.5, 7 19.5"
              stroke="#FAF7F0" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M19 6.5 C 21 6.5, 22 8, 22 10 L 22 16 C 22 18, 21 19.5, 19 19.5"
              stroke="#FAF7F0" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M13 8.5 L 13.9 12.1 L 17.5 13 L 13.9 13.9 L 13 17.5 L 12.1 13.9 L 8.5 13 L 12.1 12.1 Z"
              fill={C.accent} />
      </svg>
    </div>
  );
}

function ItoMarkMedium() {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: `linear-gradient(160deg, ${C.itoInk} 0%, #1B2C44 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, boxShadow: "0 2px 6px rgba(14, 26, 43, 0.18)",
    }}>
      <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
        <path d="M7 6.5 C 5 6.5, 4 8, 4 10 L 4 16 C 4 18, 5 19.5, 7 19.5"
              stroke="#FAF7F0" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M19 6.5 C 21 6.5, 22 8, 22 10 L 22 16 C 22 18, 21 19.5, 19 19.5"
              stroke="#FAF7F0" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M13 8.5 L 13.9 12.1 L 17.5 13 L 13.9 13.9 L 13 17.5 L 12.1 13.9 L 8.5 13 L 12.1 12.1 Z"
              fill={C.accent} />
      </svg>
    </div>
  );
}

/* ---------------- ito Pause (Quick Read for the sender) ---------------- */

function ItoPause({
  onClose, onRewrite, onReflect,
}: { onClose: () => void; onRewrite: () => void; onReflect: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ItoMarkMedium />
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 700, fontSize: 17, color: C.itoInk,
            fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.3,
          }}>
            Take a beat
          </div>
          <div style={{ fontSize: 12, color: "#6F6657", marginTop: 1 }}>
            What's actually happening here
          </div>
        </div>
        <button onClick={onClose} style={iconBtn()}>
          <X size={20} color={C.subtext} />
        </button>
      </div>

      {/* Reflective, non-accusatory — she sent mixed signals, but the pattern is clear */}
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          "You've asked twice. She said 'not feeling it' and 'maybe another time.'",
          "Bringing up that she did it before can land as pressure, even if you don't mean it that way.",
          "Past yes doesn't mean tonight's yes. That's true for both of you.",
        ].map((line, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            padding: "12px 14px", background: "#fff",
            border: `1px solid ${C.itoSoftDeep}`, borderRadius: 12,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 11, flexShrink: 0,
              background: C.itoSoft, color: C.itoInk,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 11.5, fontWeight: 700, marginTop: 1,
              fontFamily: '"Geist", "Inter", system-ui, sans-serif',
            }}>{i + 1}</span>
            <span style={{
              fontSize: 14.5, color: C.itoInk, lineHeight: 1.45,
              fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.1,
            }}>
              {line}
            </span>
          </div>
        ))}
      </div>

      {/* The core question for him */}
      <div style={{
        marginTop: 14, padding: "14px 16px", background: C.itoSoft,
        border: `1px solid ${C.itoSoftDeep}`, borderRadius: 14,
      }}>
        <div style={{
          fontSize: 11.5, fontWeight: 700, color: "#6F6657",
          letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 4,
        }}>
          Ask yourself
        </div>
        <div style={{
          fontSize: 15.5, color: C.itoInk, lineHeight: 1.4, fontWeight: 600,
          fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.2,
        }}>
          What do you actually want from her tonight — and is one more push the way to get there?
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={onRewrite} style={primaryBtn(C.itoInk)}>
          Help me rewrite this
        </button>
        <button onClick={onReflect} style={ghostBtn()}>
          I want to think this through
        </button>
      </div>

      <div style={{
        marginTop: 16, padding: "10px 12px",
        display: "flex", alignItems: "center", gap: 8,
        borderTop: `1px dashed ${C.itoSoftDeep}`,
        paddingTop: 14,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: 3, background: "#9B8E73", flexShrink: 0,
        }} />
        <span style={{ fontSize: 11.5, color: "#6F6657", lineHeight: 1.4 }}>
          ito only knows what you share here. Maya won't be told you opened this.
        </span>
      </div>
    </Sheet>
  );
}

/* ---------------- ito Rewrite — three options ---------------- */

function ItoRewrite({ onBack, onClose, onReflect }: { onBack: () => void; onClose: () => void; onReflect: () => void }) {
  const [copied, setCopied] = useState<number | null>(null);
  const [used, setUsed] = useState<number | null>(null);

  const options = [
    {
      label: "Drop it for tonight",
      text: "all good, didn't mean to push. talk tomorrow?",
      explain: "Lets it go without making her feel bad for saying no.",
      tone: "Direct",
    },
    {
      label: "Actually check in",
      text: "no worries — how was your day for real?",
      explain: "Shifts the energy. Shows up for her, not just for what you want.",
      tone: "Genuine",
    },
    {
      label: "Name it honestly",
      text: "i hear you. i was pushing, my bad. get some rest 🤍",
      explain: "Names what you were doing. People respect that more than you'd think.",
      tone: "Honest",
    },
  ];

  const handleCopy = (i: number, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
  };

  const handleUse = (i: number) => {
    setUsed(i);
    setTimeout(() => onClose(), 220);
  };

  return (
    <Sheet onClose={onClose} tall>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={iconBtn()}>
          <ChevronLeft size={24} color={C.itoInk} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 700, fontSize: 17, color: C.itoInk,
            fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.3,
          }}>
            Try a different send
          </div>
          <div style={{ fontSize: 12, color: "#6F6657", marginTop: 1 }}>
            Pick one to use as your draft
          </div>
        </div>
        <button onClick={onClose} style={iconBtn()}>
          <X size={20} color={C.subtext} />
        </button>
      </div>

      <div style={{
        marginTop: 8, fontSize: 12, color: "#6F6657", lineHeight: 1.4,
        padding: "8px 10px", background: "#fff", borderRadius: 10,
        border: `1px solid ${C.itoSoftDeep}`,
      }}>
        Nothing sends until you hit send. Edit any of these first.
      </div>

      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((o, i) => {
          const isUsed = used === i;
          return (
            <div
              key={i}
              style={{
                padding: "10px 12px 10px", background: "#fff",
                border: `1.5px solid ${isUsed ? C.itoInk : C.itoSoftDeep}`,
                borderRadius: 14, boxShadow: isUsed ? "0 4px 14px rgba(14,26,43,0.10)" : "none",
                transition: "all 220ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: C.itoInk,
                  fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.1,
                }}>
                  {o.label}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: "#6F6657",
                  padding: "2px 6px", background: C.itoSoft, borderRadius: 999,
                }}>
                  {o.tone}
                </span>
              </div>

              <div style={{
                padding: "9px 11px", background: C.itoSoft,
                borderRadius: 10, border: `1px solid ${C.itoSoftDeep}`,
                fontSize: 14.5, color: C.itoInk, lineHeight: 1.4,
                fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.1,
              }}>
                “{o.text}”
              </div>

              <div style={{
                marginTop: 5, fontSize: 12, color: "#6F6657", lineHeight: 1.35,
              }}>
                {o.explain}
              </div>

              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => handleUse(i)}
                  style={{
                    flex: 1, padding: "8px 10px", borderRadius: 10,
                    background: isUsed ? "#0B1A2D" : C.itoInk,
                    color: "#fff", border: "none", fontWeight: 700,
                    fontSize: 12.5, cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: 5,
                  }}
                >
                  {isUsed ? (<><Check size={13} strokeWidth={2.5} /> Draft ready</>) : "Use this"}
                </button>
                <button
                  onClick={() => handleCopy(i, o.text)}
                  style={{
                    padding: "8px 10px", borderRadius: 10,
                    background: "transparent", border: `1.5px solid ${C.itoSoftDeep}`,
                    color: C.itoInk, fontWeight: 600, fontSize: 12.5,
                    cursor: "pointer", display: "flex", alignItems: "center",
                    gap: 4, minWidth: 76, justifyContent: "center",
                  }}
                >
                  {copied === i ? (<><Check size={13} strokeWidth={2.5} /> Copied</>) : (<><Copy size={13} strokeWidth={2.2} /> Copy</>)}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onReflect} style={{ ...textBtn(), marginTop: 2, color: C.itoInk, fontWeight: 600 }}>
        I want to think about this more
      </button>

      <button onClick={onClose} style={{ ...textBtn(), marginTop: 4 }}>
        Not now — I'll write my own
      </button>
    </Sheet>
  );
}

/* ---------------- ito Reflect (escalation for the sender) ---------------- */

function ItoReflect({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const text = mayaThread.map((m) => `${m.from === "me" ? "You" : "Maya"}: ${m.text}`).join("\n");
    void navigator.clipboard.writeText(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <Sheet onClose={onClose} tall accent={C.itoInk}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={iconBtn()}>
          <ChevronLeft size={24} color={C.itoInk} />
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: 18,
          background: "#E8E2D6", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Hand size={18} color={C.itoInk} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 700, fontSize: 17, color: C.itoInk,
            fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.3,
          }}>
            This is the line
          </div>
          <div style={{ fontSize: 12, color: "#6F6657", marginTop: 1 }}>
            Worth pausing on, honestly
          </div>
        </div>
        <button onClick={onClose} style={iconBtn()}>
          <X size={20} color={C.subtext} />
        </button>
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          "Asking once is asking. Asking three times after a soft no is pressure.",
          "It doesn't have to be 'a big deal' to leave someone feeling bad about it tomorrow.",
          "What you do here shapes whether she trusts you next time.",
        ].map((line, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            padding: "12px 14px", background: "#fff",
            border: `1px solid ${C.itoSoftDeep}`, borderRadius: 12,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 11, flexShrink: 0,
              background: C.itoInk, color: "#fff",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 11.5, fontWeight: 700, marginTop: 1,
              fontFamily: '"Geist", "Inter", system-ui, sans-serif',
            }}>{i + 1}</span>
            <span style={{
              fontSize: 14.5, color: C.itoInk, lineHeight: 1.45,
              fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.1,
            }}>
              {line}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <ActionRow
          icon={<Shield size={18} color={C.itoInk} />}
          label="Put the phone down for 10"
          isOpen={open === "cool"}
          onToggle={() => setOpen(open === "cool" ? null : "cool")}
        >
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#6F6657", lineHeight: 1.5 }}>
            <li>The conversation isn't going anywhere.</li>
            <li>Walk away from the chat for ten minutes.</li>
            <li>If you still want to send something after, send the kind one.</li>
          </ul>
        </ActionRow>

        <ActionRow
          icon={<Users size={18} color={C.itoInk} />}
          label="Talk to someone you trust"
          isOpen={open === "trust"}
          onToggle={() => setOpen(open === "trust" ? null : "trust")}
        >
          <div style={{ fontSize: 13, color: "#6F6657", lineHeight: 1.5 }}>
            A friend, a brother, anyone you respect. Try:
            <div style={{
              marginTop: 8, padding: 10, background: C.itoSoft, borderRadius: 10,
              border: `1px solid ${C.itoSoftDeep}`, color: C.itoInk,
              fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.1,
            }}>
              "I keep pushing this girl for something and she's not into it tonight. I need a gut check."
            </div>
            <div style={{ marginTop: 8 }}>
              People who actually care about you will tell you the truth.
            </div>
          </div>
        </ActionRow>

        <ActionRow
          icon={<HeartPulse size={18} color={C.itoInk} />}
          label="Learn what consent actually looks like"
          isOpen={open === "learn"}
          onToggle={() => setOpen(open === "learn" ? null : "learn")}
        >
          <div style={{ fontSize: 13, color: "#6F6657", lineHeight: 1.5 }}>
            Short version: enthusiastic, freely given, can change at any time — including
            with someone you've been with before. "Maybe" and silence aren't yes.
            <div style={{ marginTop: 8 }}>
              <a href="https://www.rainn.org/articles/what-is-consent" target="_blank" rel="noreferrer"
                 style={{ color: C.itoInk, fontWeight: 600, textDecoration: "underline" }}>
                Read more (RAINN) →
              </a>
            </div>
          </div>
        </ActionRow>

        <button
          onClick={handleSave}
          style={{
            ...ghostBtn(),
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {saved ? <Check size={18} color={C.itoInk} /> : <FileText size={18} color={C.itoInk} />}
          <span>{saved ? "Saved to clipboard" : "Save this for later"}</span>
        </button>
      </div>

      <div style={{
        marginTop: 16, padding: "12px 14px", borderRadius: 12,
        background: "#fff", border: `1px solid ${C.itoSoftDeep}`,
        fontSize: 12, color: "#6F6657", lineHeight: 1.45,
      }}>
        This stays on your device. ito doesn't notify anyone, and Clickchat can't see that you opened this.
      </div>

      <button onClick={onBack} style={{ ...textBtn(), marginTop: 4 }}>
        Back to rewrite options
      </button>
    </Sheet>
  );
}

function ActionRow({
  icon, label, isOpen, onToggle, children,
}: {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#fff", border: `1.5px solid ${isOpen ? C.itoInk : C.itoSoftDeep}`,
      borderRadius: 14, overflow: "hidden", transition: "all 220ms ease",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "12px 14px", background: "none", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        {icon}
        <span style={{
          flex: 1, fontSize: 14, fontWeight: 700, color: C.itoInk,
          fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.1,
        }}>
          {label}
        </span>
        <ChevronLeft
          size={18}
          color={C.subtext}
          style={{ transform: isOpen ? "rotate(-90deg)" : "rotate(-180deg)", transition: "transform 200ms ease" }}
        />
      </button>
      {isOpen && (
        <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${C.itoSoftDeep}` }}>
          <div style={{ paddingTop: 10 }}>{children}</div>
        </div>
      )}
    </div>
  );
}

function Sheet({
  children, onClose, accent, tall,
}: { children: React.ReactNode; onClose: () => void; accent?: string; tall?: boolean }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 40,
      background: "rgba(8, 12, 20, 0.5)",
      display: "flex", alignItems: "flex-end",
    }}
    onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", background: "#FAF7F0",
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: "12px 20px 28px",
          maxHeight: tall ? "92%" : "85%", overflowY: "auto",
          borderTop: accent ? `3px solid ${accent}` : "none",
          animation: "slideUp 280ms cubic-bezier(.2,.9,.3,1)",
        }}
      >
        <div style={{
          width: 40, height: 4, background: C.itoSoftDeep, borderRadius: 2,
          margin: "0 auto 10px",
        }} />
        {children}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}

function TabBar({ tab, onTab }: { tab: string; onTab: (t: any) => void }) {
  const left = [
    { id: "map", label: "Map", icon: MapPin },
    { id: "chats", label: "Chats", icon: MessageCircle },
  ];
  const right = [
    { id: "stories", label: "Stories", icon: ImageIcon },
    { id: "you", label: "You", icon: User },
  ];

  const Item = ({ it }: { it: { id: string; label: string; icon: any } }) => {
    const Icon = it.icon;
    const active = tab === it.id;
    return (
      <button
        onClick={() => onTab(it.id)}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 3, background: "none", border: "none", cursor: "pointer",
          color: active ? C.text : "#9099A4", padding: "4px 14px",
        }}
      >
        <Icon size={24} strokeWidth={active ? 2.6 : 2} />
        <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500 }}>{it.label}</span>
        <div style={{
          width: 4, height: 4, borderRadius: 2,
          background: active ? C.accent : "transparent",
        }} />
      </button>
    );
  };

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 78,
      background: "#fff", borderTop: `1px solid ${C.border}`,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 14px 22px",
    }}>
      <div style={{ display: "flex", gap: 4 }}>
        {left.map((it) => <Item key={it.id} it={it} />)}
      </div>

      <button
        onClick={() => onTab("camera")}
        style={{
          position: "absolute", left: "50%", top: -10,
          transform: "translateX(-50%)",
          width: 62, height: 62, borderRadius: 31,
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`,
          border: "4px solid #fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: `0 8px 20px ${C.accent}55`,
        }}
      >
        <Camera size={26} color="#fff" strokeWidth={2.4} />
      </button>

      <div style={{ display: "flex", gap: 4 }}>
        {right.map((it) => <Item key={it.id} it={it} />)}
      </div>
    </div>
  );
}

function iconBtn(): React.CSSProperties {
  return {
    background: "none", border: "none", padding: 6, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  };
}
function primaryBtn(bg: string): React.CSSProperties {
  return {
    padding: "14px 16px", borderRadius: 14, background: bg, color: "#fff",
    border: "none", fontWeight: 700, fontSize: 14.5, cursor: "pointer",
    textAlign: "center", textDecoration: "none", display: "block",
    letterSpacing: -0.1,
  };
}
function ghostBtn(): React.CSSProperties {
  return {
    padding: "13px 16px", borderRadius: 14, background: "#fff",
    color: C.itoInk, border: `1.5px solid ${C.itoSoftDeep}`,
    fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "center",
  };
}
function textBtn(): React.CSSProperties {
  return {
    padding: "10px", background: "none", border: "none",
    color: "#6F6657", fontSize: 13.5, cursor: "pointer", fontWeight: 500,
  };
}
