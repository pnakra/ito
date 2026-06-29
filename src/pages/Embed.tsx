import { useState, useEffect, useRef } from "react";
import {
  Search, Camera, MessageCircle, User, MapPin,
  Send, ChevronLeft, Plus, Image as ImageIcon,
  Smile, Mic, Phone, Video, Shield,
  ArrowRight, X, Pause, Hand, Sticker, SquarePen,
} from "lucide-react";

/**
 * Loop — fictional consumer messaging app with embedded ITO.
 * Standalone mobile-first clickable prototype at /embed.
 * Camera-first youth-social vibe; ITO is the calmer help layer inside it.
 */

type Screen =
  | "inbox"
  | "conversation"
  | "ito-quickread"
  | "ito-reply"
  | "ito-escalation"
  | "ask-ito-direct";

// Loop host app — vivid aqua, youthful and fast. Not Snap yellow, not generic startup blue.
const C = {
  bg: "#FFFFFF",
  surface: "#F4F6F8",
  surface2: "#EEF1F4",
  text: "#0B1220",
  subtext: "#6A7280",
  border: "#E7EAEE",
  // Loop host accent
  accent: "#00C7B7",        // vivid aqua
  accentDeep: "#019A8E",
  accentSoft: "#DEFBF7",
  pop: "#FF4D8D",           // secondary pop pink for unread + accents
  // Bubbles
  bubbleIn: "#F1F2F4",
  bubbleOut: "#00C7B7",
  online: "#22D07A",
  // ITO sub-brand — softer, grounded, calmer
  itoInk: "#0E1A2B",
  itoSoft: "#F5F1EA",       // warm sand, distinct from Loop's cool greys
  itoSoftDeep: "#EBE4D6",
  itoAccent: "#3D5E8C",
  warn: "#C97A1A",
  alert: "#C73838",
};

const friends = [
  { id: "jordan",  name: "Jordan M.",      initial: "J", grad: ["#FF8A65", "#FF4D8D"], last: "haha you up?", time: "now", unread: 2, online: true,  story: true,  delivered: false },
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

// Conversation with Jordan — ambiguous → pressuring
const jordanThread = [
  { from: "them", text: "you home rn?", time: "11:42 PM" },
  { from: "me",   text: "yeah just got back", time: "11:43 PM" },
  { from: "them", text: "parents asleep?", time: "11:43 PM" },
  { from: "me",   text: "ya why", time: "11:44 PM" },
  { from: "them", text: "send me something", time: "11:45 PM" },
  { from: "them", text: "you know what i mean 😉", time: "11:45 PM" },
  { from: "them", text: "cmon don't be weird about it. i've sent you stuff before", time: "11:46 PM" },
  { from: "them", text: "no one's gonna see it it's literally just me", time: "11:46 PM" },
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
            else setScreen("conversation");
          }} />}
          {screen === "conversation" && <Conversation
            onBack={() => setScreen("inbox")}
            onAskIto={() => setScreen("ito-quickread")}
          />}
          {screen === "ask-ito-direct" && <AskItoDirect onBack={() => setScreen("inbox")} />}
        </div>

        {/* ITO bottom sheets */}
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
        Loop — concept prototype · ITO embedded · isthisok.app/embed
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

      {/* Ask ITO — pinned, distinctly different surface */}
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
                fontFamily: '"Newsreader", Georgia, serif', letterSpacing: -0.2,
              }}>Ask ITO</span>
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
      {friends.map((f) => (
        <button
          key={f.id}
          onClick={() => onOpen(f.id)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "9px 18px", background: "transparent", border: "none",
            cursor: "pointer", textAlign: "left",
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: C.text, letterSpacing: -0.2 }}>{f.name}</span>
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
      ))}
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

function Conversation({ onBack, onAskIto }: { onBack: () => void; onAskIto: () => void }) {
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
          width: 34, height: 34, borderRadius: 17,
          background: "linear-gradient(135deg,#FF8A65,#FF4D8D)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 14, color: "#fff",
        }}>J</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>Jordan M.</div>
          <div style={{ fontSize: 11, color: C.online, fontWeight: 600 }}>● active now</div>
        </div>
        <button style={iconBtn()}><Phone size={20} color={C.text} /></button>
        <button style={iconBtn()}><Video size={22} color={C.text} /></button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 12px" }}>
        {jordanThread.map((m, i) => {
          const prev = jordanThread[i - 1];
          const grouped = prev && prev.from === m.from;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.from === "me" ? "flex-end" : "flex-start",
                marginBottom: 3,
                marginTop: grouped ? 0 : 6,
              }}
            >
              <div style={{
                maxWidth: "76%",
                padding: "9px 14px",
                borderRadius: 22,
                borderBottomRightRadius: m.from === "me" && !grouped ? 6 : 22,
                borderBottomLeftRadius: m.from === "them" && !grouped ? 6 : 22,
                background: m.from === "me" ? C.bubbleOut : C.bubbleIn,
                color: m.from === "me" ? "#fff" : C.text,
                fontSize: 14.5,
                lineHeight: 1.35,
                fontWeight: m.from === "me" ? 500 : 400,
              }}>
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* ITO inline suggestion */}
      <div style={{ padding: "0 12px 8px" }}>
        <button
          onClick={onAskIto}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", background: C.itoSoft,
            border: `1px solid ${C.itoSoftDeep}`, borderRadius: 14,
            cursor: "pointer", textAlign: "left",
          }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 15, background: C.itoInk,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Shield size={15} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13.5, fontWeight: 600, color: C.itoInk,
              fontFamily: '"Newsreader", Georgia, serif', letterSpacing: -0.1,
            }}>
              Ask ITO before you reply
            </div>
            <div style={{ fontSize: 11.5, color: "#6F6657", marginTop: 1 }}>
              Private. Jordan won't see this.
            </div>
          </div>
          <ArrowRight size={16} color={C.itoInk} />
        </button>
      </div>

      {/* Composer */}
      <div style={{
        padding: "8px 10px 10px", display: "flex", alignItems: "center",
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
          flex: 1, background: C.surface, borderRadius: 22,
          padding: "9px 14px", fontSize: 14, color: C.subtext,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ flex: 1 }}>Message…</span>
          <Sticker size={18} />
          <ImageIcon size={18} />
          <Mic size={18} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- ITO Quick Read sheet ---------------- */

function ItoQuickRead({
  onClose, onHelpReply, onEscalate,
}: { onClose: () => void; onHelpReply: () => void; onEscalate: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <ItoHeader onClose={onClose} subtitle="Only you can see this" />

      <div style={{ marginTop: 16 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 10px", borderRadius: 999,
          background: "#F6E8D4", color: "#8A5A12",
          fontSize: 11.5, fontWeight: 700, marginBottom: 12,
          letterSpacing: 0.2,
        }}>
          <Pause size={12} /> Something's off
        </div>

        <div style={{
          fontSize: 18, fontWeight: 500, lineHeight: 1.4, color: C.itoInk,
          fontFamily: '"Newsreader", Georgia, serif', letterSpacing: -0.3,
        }}>
          Jordan's pushing for an image late at night and saying you owe them because they sent one before.
        </div>

        <div style={{
          marginTop: 14, padding: 14, background: C.itoSoft,
          border: `1px solid ${C.itoSoftDeep}`,
          borderRadius: 14, fontSize: 13.5, lineHeight: 1.55, color: "#3D3528",
        }}>
          A few things to notice:
          <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
            <li>"no one's gonna see it" isn't something Jordan can actually promise.</li>
            <li>"I've sent you stuff before" is pressure, not a reason.</li>
            <li>You don't owe a reply right now.</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={onHelpReply} style={primaryBtn(C.itoInk)}>
          Help me reply
        </button>
        <button onClick={onEscalate} style={ghostBtn()}>
          This feels worse than it looks
        </button>
        <button onClick={onClose} style={textBtn()}>
          Just close — I'll sit with it
        </button>
      </div>
    </Sheet>
  );
}

/* ---------------- ITO Reply suggestions ---------------- */

function ItoReply({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const options = [
    { label: "Hold the line", text: "not sending anything tonight. if that's a problem that's on you." },
    { label: "Name what's happening", text: "you're pushing pretty hard rn and it doesn't feel good. i'm gonna stop." },
    { label: "Exit the conversation", text: "going to sleep. ttyl." },
  ];

  return (
    <Sheet onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={iconBtn()}>
          <ChevronLeft size={22} color={C.itoInk} />
        </button>
        <div style={{
          flex: 1, fontWeight: 700, fontSize: 16, color: C.itoInk,
          fontFamily: '"Newsreader", Georgia, serif', letterSpacing: -0.2,
        }}>Three ways to reply</div>
        <button onClick={onClose} style={iconBtn()}>
          <X size={20} color={C.subtext} />
        </button>
      </div>

      <div style={{ fontSize: 13, color: "#6F6657", marginTop: 6, lineHeight: 1.4 }}>
        Pick one or use it as a starting point. Nothing sends until you tap send in your own chat.
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((o, i) => (
          <button
            key={i}
            onClick={() => setPicked(i)}
            style={{
              textAlign: "left", padding: 14, borderRadius: 14,
              border: `1.5px solid ${picked === i ? C.itoInk : C.itoSoftDeep}`,
              background: picked === i ? C.itoSoft : "#fff",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: C.itoAccent, letterSpacing: 0.5 }}>
              {o.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 14.5, color: C.itoInk, marginTop: 4, lineHeight: 1.4 }}>
              "{o.text}"
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          style={primaryBtn(C.itoInk)}
          disabled={picked === null}
          onClick={onClose}
        >
          Use this draft
        </button>
        <button onClick={onClose} style={textBtn()}>
          Not now
        </button>
      </div>
    </Sheet>
  );
}

/* ---------------- ITO Higher-risk Escalation ---------------- */

function ItoEscalation({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  return (
    <Sheet onClose={onClose} accent={C.alert}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={iconBtn()}>
          <ChevronLeft size={22} color={C.itoInk} />
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: 16, background: "#FBE3E3",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Hand size={16} color={C.alert} />
        </div>
        <div style={{
          flex: 1, fontWeight: 700, fontSize: 16, color: C.itoInk,
          fontFamily: '"Newsreader", Georgia, serif', letterSpacing: -0.2,
        }}>Hold on a sec</div>
        <button onClick={onClose} style={iconBtn()}>
          <X size={20} color={C.subtext} />
        </button>
      </div>

      <div style={{
        marginTop: 14, fontSize: 16.5, fontWeight: 500, lineHeight: 1.45, color: C.itoInk,
        fontFamily: '"Newsreader", Georgia, serif', letterSpacing: -0.2,
      }}>
        What you're describing — being pressured for images, being told you owe it — that's coercion. It's not a normal ask, and you're not overreacting.
      </div>

      <div style={{
        marginTop: 14, padding: 14, borderRadius: 14,
        background: "#FBE3E3", color: "#7A1D1D", fontSize: 13.5, lineHeight: 1.5,
      }}>
        If Jordan has sent you images before and is threatening to share them, or if you're under 18 and being asked for images, there are people who can help — right now, free, and they don't need your name.
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <a href="tel:18008435678" style={primaryBtn(C.alert) as any}>
          Call Take It Down — 1-800-843-5678
        </a>
        <a href="sms:741741?body=HELLO" style={ghostBtnAlert() as any}>
          Text HOME to 741741 — Crisis Text Line
        </a>
        <button onClick={onBack} style={textBtn()}>
          Back to reply options
        </button>
      </div>
    </Sheet>
  );
}

/* ---------------- Ask ITO direct (from inbox) ---------------- */

function AskItoDirect({ onBack }: { onBack: () => void }) {
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
            fontFamily: '"Newsreader", Georgia, serif', letterSpacing: -0.2,
          }}>Ask ITO</div>
          <div style={{ fontSize: 11.5, color: "#6F6657" }}>Private. Not stored. Not shared.</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "18px 16px", overflowY: "auto" }}>
        <div style={{
          padding: 14, background: "#fff", borderRadius: 14,
          border: `1px solid ${C.itoSoftDeep}`,
          fontSize: 14.5, color: C.itoInk, lineHeight: 1.5,
          fontFamily: '"Newsreader", Georgia, serif', letterSpacing: -0.1,
        }}>
          Hey. Tell me what's going on. You can paste a message someone sent, describe a situation, or just type what's bugging you.
        </div>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Someone is pressuring me to send a pic",
            "I'm not sure if what I said was okay",
            "Did I mess up at a party",
            "How do I tell someone no",
          ].map((s, i) => (
            <button key={i} onClick={() => setInput(s)} style={{
              textAlign: "left", padding: "10px 14px", borderRadius: 999,
              border: `1px solid ${C.itoSoftDeep}`, background: "#fff",
              fontSize: 13.5, color: C.itoInk, cursor: "pointer",
            }}>{s}</button>
          ))}
        </div>
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

/* ---------------- ITO header (shared) ---------------- */

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
          fontFamily: '"Newsreader", Georgia, serif', letterSpacing: -0.2,
        }}>ITO</div>
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
  children, onClose, accent,
}: { children: React.ReactNode; onClose: () => void; accent?: string }) {
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
          maxHeight: "85%", overflowY: "auto",
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
