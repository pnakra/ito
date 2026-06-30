import { useState, useEffect, useRef } from "react";
import {
  Search, Camera, MessageCircle, User, MapPin,
  Send, ChevronLeft, Plus, Image as ImageIcon,
  Smile, Mic, Phone, Video, Shield,
  ArrowRight, X, Pause, Hand, Sticker, SquarePen,
  Copy, Check, FileText, Users, Download, HeartPulse,
} from "lucide-react";

/**
 * Clickchat — fictional consumer messaging app with embedded ito.
 * Standalone mobile-first clickable prototype at /embed.
 * Camera-first youth-social vibe; ito is the calmer help layer inside it.
 */

type Screen =
  | "inbox"
  | "conversation"
  | "ito-quickread"
  | "ito-reply"
  | "ito-escalation"
  | "ask-ito-direct";

// Clickchat host app — Snap-yellow forward, youthful and fast.
const C = {
  bg: "#FFFFFF",
  surface: "#FFFDF0",
  surface2: "#FFF9D6",
  text: "#0B1220",
  subtext: "#6A7280",
  border: "#EFE9C6",
  // Clickchat host accent — Snapchat-style yellow
  accent: "#FFFC00",
  accentDeep: "#E6D900",
  accentSoft: "#FFFDB8",
  pop: "#FF4D8D",
  // Bubbles
  bubbleIn: "#F1F2F4",
  bubbleOut: "#FFFC00",
  bubbleOutText: "#0B1220",
  online: "#22D07A",
  // ito sub-brand — softer, grounded, calmer
  itoInk: "#0E1A2B",
  itoSoft: "#F5F1EA",
  itoSoftDeep: "#EBE4D6",
  itoAccent: "#3D5E8C",
  warn: "#C97A1A",
  alert: "#C73838",
};

// Jalen's avatar gradient (referenced in inbox + conversation header)
const JALEN_GRAD = ["#7CC4FF", "#5B8DEF"];

const friends = [
  { id: "jalen",   name: "Jalen",          initial: "J", grad: JALEN_GRAD,             last: "just come for an hour. it's not that deep", time: "now", unread: 3, online: true,  story: false, delivered: false, live: true },
  { id: "maya",    name: "Maya",           initial: "M", grad: ["#7CC4FF", "#5B8DEF"], last: "ok see u there 🩷", time: "2m", unread: 0, online: true,  story: true,  delivered: true },
  { id: "devon",   name: "Devon",          initial: "D", grad: ["#C8B6FF", "#8A7BFF"], last: "send the pic lol", time: "12m", unread: 1, online: false, story: false, delivered: false },
  { id: "riley",   name: "Riley + 4",      initial: "R", grad: ["#A8E6CF", "#3DD68C"], last: "Maya: pulling up in 10", time: "28m", unread: 0, online: false, story: false, delivered: true },
  { id: "sam",     name: "Sam",            initial: "S", grad: ["#FFD6E0", "#FF8FB1"], last: "you: lol fr", time: "1h", unread: 0, online: false, story: true,  delivered: true },
  { id: "alex",    name: "Alex K.",        initial: "A", grad: ["#B5E48C", "#76C893"], last: "📸 sent a snap", time: "3h", unread: 0, online: false, story: false, delivered: true },
  { id: "noor",    name: "Noor",           initial: "N", grad: ["#FFD580", "#FF9F45"], last: "wait you saw that too??", time: "5h", unread: 3, online: false, story: true,  delivered: false },
  { id: "studio",  name: "art ppl 🎨",     initial: "✿", grad: ["#F2A6FF", "#B16CFF"], last: "Tasha: bring the polaroids", time: "yday", unread: 0, online: false, story: false, delivered: true },
  { id: "kai",     name: "Kai",            initial: "K", grad: ["#FFB199", "#FF6F61"], last: "ok bet", time: "yday", unread: 0, online: false, story: false, delivered: true },
];

const storyFriends = [
  { id: "maya",   initial: "M", grad: ["#7CC4FF", "#5B8DEF"], label: "Maya" },
  { id: "jordan", initial: "J", grad: ["#FF8A65", "#FF4D8D"], label: "Jordan" },
  { id: "noor",   initial: "N", grad: ["#FFD580", "#FF9F45"], label: "Noor" },
  { id: "sam",    initial: "S", grad: ["#FFD6E0", "#FF8FB1"], label: "Sam" },
  { id: "tasha",  initial: "T", grad: ["#A0E7E5", "#54B8B5"], label: "Tasha" },
  { id: "leo",    initial: "L", grad: ["#C8B6FF", "#8A7BFF"], label: "Leo" },
];

// Conversation with Jalen — hangout pressure, ambiguous → mild guilt-trip
const jalenThread = [
  { from: "them", text: "yo what u doing later", time: "10:48 PM" },
  { from: "me",   text: "idk prob just chilling, kinda tired tbh", time: "10:51 PM" },
  { from: "them", text: "come thruuu", time: "10:52 PM" },
  { from: "them", text: "my roommate's gone for the weekend", time: "10:52 PM" },
  { from: "me",   text: "hmm maybe. how late we talking", time: "10:55 PM" },
  { from: "them", text: "doesn't matter, whenever. i'll be up 🙂", time: "10:56 PM" },
  { from: "me",   text: "i kinda have stuff in the morning", time: "11:14 PM" },
  { from: "them", text: "u always do this lol", time: "11:21 PM" },
  { from: "them", text: "like i feel like every time i ask u find a reason", time: "11:22 PM" },
  { from: "them", text: "just come for an hour. it's not that deep", time: "11:23 PM" },
];



export default function Embed() {
  const [screen, setScreen] = useState<Screen>("inbox");
  const [tab, setTab] = useState<"map" | "chats" | "camera" | "stories" | "you">("chats");

  return (
    <div
      style={{ background: "#0E0F12", minHeight: "100vh" }}
      className="flex items-center justify-center p-6"
    >
      {/* iPhone 15 Pro frame */}
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
          fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Dynamic Island */}
        <div style={{
          position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)",
          width: 120, height: 34, background: "#000", borderRadius: 20, zIndex: 50,
        }} />

        {/* Status bar */}
        <div style={{
          height: 54, display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", padding: "0 28px 6px", fontSize: 15,
          fontWeight: 600, color: C.text,
        }}>
          <span>9:41</span>
          <span style={{ fontSize: 13 }}>• • • •</span>
        </div>

        {/* Screen content */}
        <div style={{
          position: "absolute", top: 54, left: 0, right: 0, bottom: 78,
          overflow: "hidden",
        }}>
          {screen === "inbox" && <Inbox onOpen={(id) => {
            if (id === "ask-ito") setScreen("ask-ito-direct");
            else if (id === "jalen") setScreen("conversation");
            // other friend rows are non-interactive in this demo
          }} />}
          {screen === "conversation" && <Conversation
            onBack={() => setScreen("inbox")}
            onAskIto={() => setScreen("ito-quickread")}
            onEscalate={() => setScreen("ito-escalation")}
          />}
          {screen === "ask-ito-direct" && <AskItoDirect
            onBack={() => setScreen("inbox")}
            onOpenLive={() => setScreen("conversation")}
          />}
        </div>

        {/* ito bottom sheets */}
        {screen === "ito-quickread" && (
          <ItoQuickRead
            onClose={() => setScreen("conversation")}
            onHelpReply={() => setScreen("ito-reply")}
            onEscalate={() => setScreen("ito-escalation")}
          />
        )}
        {screen === "ito-reply" && (
          <ItoReply
            onBack={() => setScreen("ito-quickread")}
            onClose={() => setScreen("conversation")}
            onEscalate={() => setScreen("ito-escalation")}
          />
        )}
        {screen === "ito-escalation" && (
          <ItoEscalation
            onClose={() => setScreen("conversation")}
            onBack={() => setScreen("ito-quickread")}
          />
        )}

        {/* Bottom tab bar */}
        {(screen === "inbox" || screen === "conversation") && (
          <TabBar tab={tab} onTab={(t) => {
            setTab(t);
            if (t === "chats") setScreen("inbox");
          }} />
        )}
      </div>

      {/* Prototype caption */}
      <div style={{
        position: "fixed", bottom: 16, left: 0, right: 0,
        textAlign: "center", color: "#888", fontSize: 12,
        fontFamily: "system-ui",
      }}>
        Clickchat — concept prototype · ito embedded · isthisok.app/embed
      </div>
    </div>
  );
}

/* ---------------- Inbox ---------------- */

function Inbox({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div style={{ height: "100%", overflowY: "auto", background: C.bg }}>
      {/* Top bar — page title + lightweight actions */}
      <div style={{
        padding: "4px 18px 8px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, letterSpacing: -0.8,
            color: C.text, margin: 0, lineHeight: 1,
          }}>Chats</h1>
          <span style={{ fontSize: 13, color: C.subtext, fontWeight: 500 }}>9</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button style={iconBtn()}>
            <Search size={22} color={C.text} strokeWidth={2.2} />
          </button>
          <button style={iconBtn()}>
            <SquarePen size={21} color={C.text} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Stories rail */}
      <div style={{
        display: "flex", gap: 14, padding: "6px 18px 14px",
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        <AddStory />
        {storyFriends.map((s) => (
          <StoryAvatar key={s.id} grad={s.grad} initial={s.initial} label={s.label} />
        ))}
      </div>

      {/* Ask ito — pinned, distinctly different surface */}
      <div style={{ padding: "0 14px 6px" }}>
        <button
          onClick={() => onOpen("ask-ito")}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "12px 12px", background: C.itoSoft,
            border: `1px solid ${C.itoSoftDeep}`,
            borderRadius: 18, cursor: "pointer", textAlign: "left",
            position: "relative",
          }}
        >
          {/* Pinned dot */}
          <span style={{
            position: "absolute", top: 8, right: 10, fontSize: 10,
            color: "#9B8E73", fontWeight: 600, letterSpacing: 0.4,
            textTransform: "uppercase",
          }}>Pinned</span>

          <ItoMark />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontWeight: 700, fontSize: 15, color: C.itoInk,
                fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.2,
              }}>Ask ito</span>
            </div>
            <div style={{ fontSize: 12.5, color: "#6F6657", marginTop: 2 }}>
              Private help before you reply
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              marginTop: 6, padding: "3px 8px", borderRadius: 999,
              background: "#fff", border: `1px solid ${C.itoSoftDeep}`,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: 3, background: C.online,
                boxShadow: `0 0 0 3px ${C.online}25`,
              }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: C.itoInk, letterSpacing: 0.1 }}>
                Available now
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Section label */}
      <div style={{
        padding: "12px 20px 4px", fontSize: 11, fontWeight: 700,
        color: C.subtext, letterSpacing: 0.8, textTransform: "uppercase",
      }}>
        Recent
      </div>


      {/* Friends list */}
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

/* ito mark — custom badge: a soft rounded square with an inset "pause/bracket" sparkle.
   Original mark, not derivative of any existing brand. */
function ItoMark() {
  return (
    <div style={{
      width: 46, height: 46, borderRadius: 14,
      background: `linear-gradient(160deg, ${C.itoInk} 0%, #1B2C44 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, position: "relative",
      boxShadow: "0 2px 6px rgba(14, 26, 43, 0.18)",
    }}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* enclosing soft bracket pair = "hold / consider" */}
        <path d="M7 6.5 C 5 6.5, 4 8, 4 10 L 4 16 C 4 18, 5 19.5, 7 19.5"
              stroke="#FAF7F0" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M19 6.5 C 21 6.5, 22 8, 22 10 L 22 16 C 22 18, 21 19.5, 19 19.5"
              stroke="#FAF7F0" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* center: small four-point spark (calm, not glitzy) */}
        <path d="M13 8.5 L 13.9 12.1 L 17.5 13 L 13.9 13.9 L 13 17.5 L 12.1 13.9 L 8.5 13 L 12.1 12.1 Z"
              fill={C.accent} />
      </svg>
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

function Conversation({ onBack, onAskIto, onEscalate }: { onBack: () => void; onAskIto: () => void; onEscalate: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg }}>
      {/* Header */}
      <div style={{
        padding: "6px 12px 10px", display: "flex", alignItems: "center",
        gap: 8, borderBottom: `1px solid ${C.border}`,
      }}>
        <button onClick={onBack} style={iconBtn()}>
          <ChevronLeft size={26} color={C.text} />
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: 18,
          background: `linear-gradient(135deg, ${JALEN_GRAD[0]}, ${JALEN_GRAD[1]})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 14, color: "#fff",
          boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.25)",
        }}>J</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>Jalen</div>
          <div style={{ fontSize: 11, color: C.online, fontWeight: 600 }}>● active now</div>
        </div>
        <button onClick={onEscalate} title="This feels more serious" style={iconBtn()}>
          <Shield size={20} color={C.itoInk} />
        </button>
        <button style={iconBtn()}><Phone size={20} color={C.text} /></button>
        <button style={iconBtn()}><Video size={22} color={C.text} /></button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 12px 8px" }}>
        {/* Day divider */}
        <div style={{
          textAlign: "center", fontSize: 11, color: C.subtext,
          fontWeight: 600, margin: "4px 0 10px", letterSpacing: 0.3,
        }}>
          Today
        </div>

        {jalenThread.map((m, i) => {
          const prev = jalenThread[i - 1];
          const grouped = prev && prev.from === m.from;
          const next = jalenThread[i + 1];
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
                  color: m.from === "me" ? "#fff" : C.text,
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

        {/* Typing indicator (subtle continuing pressure) */}
        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 10 }}>
          <div style={{
            background: C.bubbleIn, borderRadius: 18,
            padding: "10px 14px", display: "flex", gap: 4, alignItems: "center",
          }}>
            {[0, 1, 2].map((n) => (
              <span key={n} style={{
                width: 6, height: 6, borderRadius: 3, background: "#A8AEB7",
                display: "inline-block",
                animation: `typing 1.2s ${n * 0.15}s infinite ease-in-out`,
              }} />
            ))}
          </div>
        </div>
        <style>{`
          @keyframes typing {
            0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
            30% { opacity: 1; transform: translateY(-3px); }
          }
        `}</style>
      </div>

      {/* ito inline suggestion — sits right above composer */}
      <div style={{ padding: "4px 12px 8px" }}>
        <button
          onClick={onAskIto}
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
              Ask ito before sending
            </div>
            <div style={{ fontSize: 11.5, color: "#6F6657", marginTop: 1 }}>
              Private. Jalen won't see this.
            </div>
          </div>
          <ArrowRight size={16} color={C.itoInk} />
        </button>
      </div>

      {/* Composer — user has typed a draft */}
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
          <span style={{
            flex: 1, color: C.text, lineHeight: 1.35,
          }}>
            ok fine i'll come for a bit but i can't stay late
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
        <style>{`
          @keyframes caret { 50% { opacity: 0; } }
        `}</style>
      </div>
    </div>
  );
}

/* Tiny ito mark for inline contexts */
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



/* ---------------- ito Quick Read sheet ---------------- */

function ItoQuickRead({
  onClose, onHelpReply, onEscalate,
}: { onClose: () => void; onHelpReply: () => void; onEscalate: () => void }) {
  return (
    <Sheet onClose={onClose}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ItoMarkMedium />
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 700, fontSize: 17, color: C.itoInk,
            fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.3,
          }}>
            Ask ito
          </div>
          <div style={{ fontSize: 12, color: "#6F6657", marginTop: 1 }}>
            What stands out
          </div>
        </div>
        <button onClick={onClose} style={iconBtn()}>
          <X size={20} color={C.subtext} />
        </button>
      </div>

      {/* Bullets — plain language reflection */}
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          "They're still pushing after you sounded unsure.",
          "You already said you weren't sure.",
          "You don't have to answer right away.",
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

      {/* Buttons */}
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={onHelpReply} style={primaryBtn(C.itoInk)}>
          Help me reply
        </button>
        <button onClick={onEscalate} style={ghostBtn()}>
          This feels more serious
        </button>
      </div>

      {/* System boundary line */}
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
          ito only knows what you share here.
        </span>
      </div>
    </Sheet>
  );
}

/* Medium ito mark for sheet headers */
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

/* ---------------- ito Reply suggestions ---------------- */

function ItoReply({ onBack, onClose, onEscalate }: { onBack: () => void; onClose: () => void; onEscalate: () => void }) {
  const [copied, setCopied] = useState<number | null>(null);
  const [used, setUsed] = useState<number | null>(null);

  const options = [
    {
      label: "Set a boundary",
      text: "I'm not comfortable with that tonight.",
      explain: "Best when you want to be direct.",
      tone: "Direct",
    },
    {
      label: "Slow it down",
      text: "I need a minute.",
      explain: "Best when you want space without escalating.",
      tone: "Gentle",
    },
    {
      label: "Exit for now",
      text: "I'm getting off my phone for a bit.",
      explain: "Best when you want to pause the conversation.",
      tone: "Pause",
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
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={iconBtn()}>
          <ChevronLeft size={24} color={C.itoInk} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 700, fontSize: 17, color: C.itoInk,
            fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.3,
          }}>
            Help me reply
          </div>
          <div style={{ fontSize: 12, color: "#6F6657", marginTop: 1 }}>
            Tap one to use as your draft
          </div>
        </div>
        <button onClick={onClose} style={iconBtn()}>
          <X size={20} color={C.subtext} />
        </button>
      </div>

      {/* Subtle reassurance */}
      <div style={{
        marginTop: 8, fontSize: 12, color: "#6F6657", lineHeight: 1.4,
        padding: "8px 10px", background: "#fff", borderRadius: 10,
        border: `1px solid ${C.itoSoftDeep}`,
      }}>
        Nothing sends until you hit send. Edit it first if you want.
      </div>

      {/* Options */}
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
              {/* Label + tone tag */}
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

              {/* Reply text — focal point */}
              <div style={{
                padding: "9px 11px", background: C.itoSoft,
                borderRadius: 10, border: `1px solid ${C.itoSoftDeep}`,
                fontSize: 14.5, color: C.itoInk, lineHeight: 1.4,
                fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.1,
              }}>
                “{o.text}”
              </div>

              {/* Explanation */}
              <div style={{
                marginTop: 5, fontSize: 12, color: "#6F6657", lineHeight: 1.35,
              }}>
                {o.explain}
              </div>

              {/* Actions */}
              <div style={{
                marginTop: 8, display: "flex", alignItems: "center", gap: 6,
              }}>
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
                  {isUsed ? (
                    <>
                      <Check size={13} strokeWidth={2.5} /> Draft ready
                    </>
                  ) : (
                    "Use this"
                  )}
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
                  {copied === i ? (
                    <>
                      <Check size={13} strokeWidth={2.5} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={13} strokeWidth={2.2} /> Copy
                    </>
                  )}
                </button>
                <button
                  style={{
                    padding: "8px 8px", background: "none", border: "none",
                    color: "#6F6657", fontSize: 12, fontWeight: 500,
                    cursor: "pointer", textDecoration: "underline",
                    textUnderlineOffset: 2,
                  }}
                >
                  Edit first
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Escalation path */}
      <button onClick={onEscalate} style={{ ...textBtn(), marginTop: 2, color: C.itoInk, fontWeight: 600 }}>
        This feels more serious than a reply
      </button>

      {/* Bottom close */}
      <button onClick={onClose} style={{ ...textBtn(), marginTop: 4 }}>
        Not now — I'll write my own
      </button>
    </Sheet>
  );
}

/* ---------------- ito Higher-risk Escalation ---------------- */

function ItoEscalation({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const text = jalenThread.map((m) => `${m.from === "me" ? "You" : "Jalen"}: ${m.text}`).join("\n");
    void navigator.clipboard.writeText(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <Sheet onClose={onClose} tall accent={C.itoInk}>
      {/* Header */}
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
            This may be crossing a line
          </div>
          <div style={{ fontSize: 12, color: "#6F6657", marginTop: 1 }}>
            ito takes this seriously
          </div>
        </div>
        <button onClick={onClose} style={iconBtn()}>
          <X size={20} color={C.subtext} />
        </button>
      </div>

      {/* Supporting points — plain, direct, not clinical */}
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          "Repeated pressure after hesitation is not okay.",
          "If someone is threatening, pushing, or ignoring your 'no,' this is serious.",
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

      {/* Actions */}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Make a safety plan */}
        <ActionRow
          icon={<Shield size={18} color={C.itoInk} />}
          label="Make a safety plan"
          isOpen={open === "plan"}
          onToggle={() => setOpen(open === "plan" ? null : "plan")}
        >
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#6F6657", lineHeight: 1.5 }}>
            <li>You do not have to respond right now.</li>
            <li>Think of one person you could sit with or call.</li>
            <li>If you feel unsafe, ask someone you trust to come get you.</li>
          </ul>
        </ActionRow>

        {/* Talk to a trusted adult */}
        <ActionRow
          icon={<Users size={18} color={C.itoInk} />}
          label="Talk to a trusted adult"
          isOpen={open === "adult"}
          onToggle={() => setOpen(open === "adult" ? null : "adult")}
        >
          <div style={{ fontSize: 13, color: "#6F6657", lineHeight: 1.5 }}>
            You don't need to explain everything at once. Try starting with:
            <div style={{
              marginTop: 8, padding: 10, background: C.itoSoft, borderRadius: 10,
              border: `1px solid ${C.itoSoftDeep}`, color: C.itoInk,
              fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.1,
            }}>
              "I need help with a situation. Can you listen?"
            </div>
            <div style={{ marginTop: 8 }}>
              If the first person doesn't get it, try another adult.
            </div>
          </div>
        </ActionRow>

        {/* Get crisis help now */}
        <a href="tel:988" style={primaryBtn(C.itoInk) as any}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <HeartPulse size={18} />
            <span>Get crisis help now — 988</span>
          </div>
        </a>
        <a href="sms:741741?body=HOME" style={ghostBtn() as any}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Phone size={18} />
            <span>Text HOME to 741741</span>
          </div>
        </a>

        {/* Save this conversation */}
        <button
          onClick={handleSave}
          style={{
            ...ghostBtn(),
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {saved ? <Check size={18} color={C.itoInk} /> : <FileText size={18} color={C.itoInk} />}
          <span>{saved ? "Copied to clipboard" : "Save this conversation"}</span>
        </button>
      </div>

      {/* Reassurance footer */}
      <div style={{
        marginTop: 16, padding: "12px 14px", borderRadius: 12,
        background: "#fff", border: `1px solid ${C.itoSoftDeep}`,
        fontSize: 12, color: "#6F6657", lineHeight: 1.45,
      }}>
        This stays on your device. ito doesn't notify anyone, and Clickchat can't see that you opened this.
      </div>

      <button onClick={onBack} style={{ ...textBtn(), marginTop: 4 }}>
        Back to reply options
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

/* ---------------- Ask ito direct (from inbox) ---------------- */

function AskItoDirect({ onBack, onOpenLive }: { onBack: () => void; onOpenLive: () => void }) {
  const [input, setInput] = useState("");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.itoSoft }}>
      <div style={{
        padding: "6px 12px 10px", display: "flex", alignItems: "center",
        gap: 10, borderBottom: `1px solid ${C.itoSoftDeep}`, background: C.itoSoft,
      }}>
        <button onClick={onBack} style={iconBtn()}>
          <ChevronLeft size={26} color={C.itoInk} />
        </button>
        <div style={{
          width: 34, height: 34, borderRadius: 17, background: C.itoInk,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Shield size={17} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 700, fontSize: 16, color: C.itoInk,
            fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.2,
          }}>Ask ito</div>
          <div style={{ fontSize: 11.5, color: "#6F6657" }}>Private. Not stored. Not shared.</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "18px 16px", overflowY: "auto" }}>
        <div style={{
          padding: 14, background: "#fff", borderRadius: 14,
          border: `1px solid ${C.itoSoftDeep}`,
          fontSize: 14.5, color: C.itoInk, lineHeight: 1.5,
          fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.1,
        }}>
          Tell me what's going on. Paste a message, describe a situation, or just say what's on your mind.
        </div>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Someone is pressuring me to send a pic",
            "I'm not sure if what I said was okay",
            "Did I mess up at a party",
            "How do I say no",
          ].map((s, i) => (
            <button key={i} onClick={() => setInput(s)} style={{
              textAlign: "left", padding: "10px 14px", borderRadius: 999,
              border: `1px solid ${C.itoSoftDeep}`, background: "#fff",
              fontSize: 13.5, color: C.itoInk, cursor: "pointer",
            }}>{s}</button>
          ))}
        </div>

        {/* Bridge into the live conversation demo */}
        <button
          onClick={onOpenLive}
          style={{
            marginTop: 18, width: "100%", padding: "12px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 10, background: C.itoInk, color: "#fff", border: "none",
            borderRadius: 14, cursor: "pointer", textAlign: "left",
          }}
        >
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{
              fontSize: 13.5, fontWeight: 700,
              fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.1,
            }}>See it in a live chat</span>
            <span style={{ fontSize: 11.5, opacity: 0.8, marginTop: 1 }}>
              Open the Jalen conversation
            </span>
          </span>
          <ArrowRight size={18} />
        </button>
      </div>

      <div style={{
        padding: "8px 12px 12px", display: "flex", alignItems: "center",
        gap: 8, borderTop: `1px solid ${C.itoSoftDeep}`, background: C.itoSoft,
      }}>
        <div style={{
          flex: 1, background: "#fff", borderRadius: 22,
          padding: "10px 14px", fontSize: 14, display: "flex", alignItems: "center",
          border: `1px solid ${C.itoSoftDeep}`,
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type what's going on…"
            style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              fontSize: 14, color: C.itoInk,
            }}
          />
        </div>
        <button style={{
          width: 42, height: 42, borderRadius: 21, background: C.itoInk,
          color: "#fff", border: "none", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer",
        }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- ito header (shared) ---------------- */

function ItoHeader({ onClose, subtitle }: { onClose: () => void; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 18, background: C.itoInk,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Shield size={18} color="#fff" />
      </div>
        <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 700, fontSize: 16, color: C.itoInk,
          fontFamily: '"Geist", "Inter", system-ui, sans-serif', letterSpacing: -0.2,
        }}>ito</div>
        <div style={{ fontSize: 11.5, color: "#6F6657" }}>{subtitle}</div>
      </div>
      <button onClick={onClose} style={iconBtn()}>
        <X size={20} color={C.subtext} />
      </button>
    </div>
  );
}

/* ---------------- Bottom sheet wrapper ---------------- */

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
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ---------------- Tab bar — camera-first ---------------- */

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

      {/* Camera FAB (center, slightly raised) */}
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

/* ---------------- Buttons ---------------- */

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
function ghostBtnAlert(): React.CSSProperties {
  return {
    padding: "13px 16px", borderRadius: 14, background: "#fff",
    color: C.alert, border: `1.5px solid #F5C2C2`,
    fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "center",
    textDecoration: "none", display: "block",
  };
}
function textBtn(): React.CSSProperties {
  return {
    padding: "10px", background: "none", border: "none",
    color: "#6F6657", fontSize: 13.5, cursor: "pointer", fontWeight: 500,
  };
}
