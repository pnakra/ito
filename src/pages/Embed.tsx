import { useState, useEffect, useRef } from "react";
import {
  Search, Camera, MessageCircle, User, Home,
  Send, ChevronLeft, Sparkles, Plus, Image as ImageIcon,
  Smile, Mic, Phone, Video, MoreVertical, Shield,
  ArrowRight, X, Heart, Pause, Hand,
} from "lucide-react";

/**
 * Loop — fictional consumer messaging app with embedded ITO.
 * Standalone mobile-first clickable prototype at /embed.
 * Self-contained styling (light theme, no inheritance from app design system).
 */

type Screen =
  | "inbox"
  | "conversation"
  | "ito-quickread"
  | "ito-reply"
  | "ito-escalation"
  | "ask-ito-direct";

const COLORS = {
  bg: "#FFFFFF",
  surface: "#F5F6F8",
  text: "#0E1116",
  subtext: "#6B7280",
  border: "#ECEEF1",
  accent: "#FF5A3C", // Loop brand — warm coral, not Snap yellow
  accentSoft: "#FFE9E3",
  bubbleIn: "#F1F2F4",
  bubbleOut: "#FF5A3C",
  // ITO sub-brand inside Loop — calmer, slate
  itoBg: "#0F1B2D",
  itoSoft: "#EEF2F7",
  itoAccent: "#3E6FA8",
  warn: "#E8A23C",
  alert: "#D14545",
};

const friends = [
  { id: "jordan", name: "Jordan M.", initial: "J", color: "#FFB347", last: "haha you up?", time: "now", unread: 2, online: true },
  { id: "maya", name: "Maya", initial: "M", color: "#9EC5FF", last: "ok see u there 🩷", time: "2m", unread: 0, online: true },
  { id: "devon", name: "Devon", initial: "D", color: "#C8B6FF", last: "send the pic lol", time: "12m", unread: 1, online: false },
  { id: "riley", name: "Riley + 4", initial: "R", color: "#A8E6CF", last: "Maya: pulling up in 10", time: "28m", unread: 0, online: false },
  { id: "sam", name: "Sam", initial: "S", color: "#FFD6E0", last: "you: lol fr", time: "1h", unread: 0, online: false },
  { id: "alex", name: "Alex K.", initial: "A", color: "#B5E48C", last: "🎥 sent a snap", time: "3h", unread: 0, online: false },
];

// Conversation with Jordan — ambiguous → pressuring
const jordanThread = [
  { from: "them", text: "you home rn?", time: "11:42 PM" },
  { from: "me", text: "yeah just got back", time: "11:43 PM" },
  { from: "them", text: "parents asleep?", time: "11:43 PM" },
  { from: "me", text: "ya why", time: "11:44 PM" },
  { from: "them", text: "send me something", time: "11:45 PM" },
  { from: "them", text: "you know what i mean 😉", time: "11:45 PM" },
  { from: "them", text: "cmon don't be weird about it. i've sent you stuff before", time: "11:46 PM" },
  { from: "them", text: "no one's gonna see it it's literally just me", time: "11:46 PM" },
];

export default function Embed() {
  const [screen, setScreen] = useState<Screen>("inbox");
  const [tab, setTab] = useState<"feed" | "camera" | "chats" | "you">("chats");

  return (
    <div
      style={{ background: "#1a1a1a", minHeight: "100vh" }}
      className="flex items-center justify-center p-6"
    >
      {/* iPhone 15 Pro frame: 393 x 852 css px */}
      <div
        style={{
          width: 393,
          height: 852,
          background: COLORS.bg,
          borderRadius: 48,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 12px #111 inset, 0 0 0 14px #2a2a2a",
          overflow: "hidden",
          position: "relative",
          color: COLORS.text,
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
          fontWeight: 600, color: COLORS.text,
        }}>
          <span>9:41</span>
          <span style={{ fontSize: 13 }}>• • • •</span>
        </div>

        {/* Screen content */}
        <div style={{
          position: "absolute", top: 54, left: 0, right: 0, bottom: 84,
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

        {/* ITO bottom sheets — overlay above conversation */}
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
    <div style={{ height: "100%", overflowY: "auto", background: COLORS.bg }}>
      {/* Header */}
      <div style={{
        padding: "8px 20px 12px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 18, background: "#222",
          color: "#fff", display: "flex", alignItems: "center",
          justifyContent: "center", fontWeight: 700, fontSize: 14,
        }}>YO</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 14, background: COLORS.accent,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 13, fontWeight: 800,
          }}>L</span>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>Loop</span>
        </div>
        <Search size={22} color={COLORS.text} />
      </div>

      {/* Search */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{
          background: COLORS.surface, borderRadius: 14, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10, color: COLORS.subtext,
          fontSize: 14,
        }}>
          <Search size={16} />
          <span>Search friends</span>
        </div>
      </div>

      {/* Ask ITO pinned */}
      <div style={{ padding: "0 12px 6px" }}>
        <button
          onClick={() => onOpen("ask-ito")}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "12px 12px", background: COLORS.itoSoft, border: "none",
            borderRadius: 16, cursor: "pointer", textAlign: "left",
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 24, background: COLORS.itoBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", flexShrink: 0,
          }}>
            <Shield size={22} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>Ask ITO</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 6px",
                background: COLORS.itoBg, color: "#fff", borderRadius: 6,
                letterSpacing: 0.3,
              }}>PRIVATE</span>
            </div>
            <div style={{ fontSize: 13, color: COLORS.subtext, marginTop: 2 }}>
              Private help before you reply.
            </div>
          </div>
          <ArrowRight size={18} color={COLORS.subtext} />
        </button>
      </div>

      <div style={{
        padding: "14px 20px 6px", fontSize: 12, fontWeight: 700,
        color: COLORS.subtext, letterSpacing: 0.5, textTransform: "uppercase",
      }}>Chats</div>

      {/* Friends list */}
      {friends.map((f) => (
        <button
          key={f.id}
          onClick={() => onOpen(f.id)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "10px 16px", background: "transparent", border: "none",
            cursor: "pointer", textAlign: "left",
          }}
        >
          <div style={{ position: "relative" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 26, background: f.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, color: "#1a1a1a", fontSize: 18,
            }}>{f.initial}</div>
            {f.online && (
              <div style={{
                position: "absolute", bottom: 1, right: 1, width: 13, height: 13,
                borderRadius: 7, background: "#3DD68C", border: "2px solid #fff",
              }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: COLORS.text }}>{f.name}</span>
              <span style={{ fontSize: 12, color: COLORS.subtext }}>{f.time}</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginTop: 2,
            }}>
              <span style={{
                fontSize: 13.5, color: f.unread ? COLORS.text : COLORS.subtext,
                fontWeight: f.unread ? 600 : 400,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: 220,
              }}>{f.last}</span>
              {f.unread > 0 && (
                <span style={{
                  background: COLORS.accent, color: "#fff", borderRadius: 10,
                  minWidth: 20, height: 20, padding: "0 6px", fontSize: 12,
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

/* ---------------- Conversation ---------------- */

function Conversation({ onBack, onAskIto }: { onBack: () => void; onAskIto: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: COLORS.bg }}>
      {/* Header */}
      <div style={{
        padding: "8px 16px 10px", display: "flex", alignItems: "center",
        gap: 10, borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", padding: 4, cursor: "pointer" }}>
          <ChevronLeft size={26} color={COLORS.text} />
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: 18, background: "#FFB347",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 14,
        }}>J</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Jordan M.</div>
          <div style={{ fontSize: 11, color: "#3DD68C", fontWeight: 600 }}>● active now</div>
        </div>
        <Phone size={20} color={COLORS.text} />
        <Video size={22} color={COLORS.text} style={{ marginLeft: 14 }} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }}>
        {jordanThread.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.from === "me" ? "flex-end" : "flex-start",
              marginBottom: 6,
            }}
          >
            <div style={{
              maxWidth: "75%",
              padding: "9px 14px",
              borderRadius: 20,
              background: m.from === "me" ? COLORS.bubbleOut : COLORS.bubbleIn,
              color: m.from === "me" ? "#fff" : COLORS.text,
              fontSize: 14.5,
              lineHeight: 1.35,
            }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* ITO inline suggestion (because last messages are pressuring) */}
      <div style={{ padding: "0 14px 8px" }}>
        <button
          onClick={onAskIto}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", background: COLORS.itoSoft,
            border: `1px solid ${COLORS.border}`, borderRadius: 14,
            cursor: "pointer", textAlign: "left",
          }}
        >
          <Shield size={18} color={COLORS.itoBg} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.itoBg }}>
              Ask ITO before sending
            </div>
            <div style={{ fontSize: 11.5, color: COLORS.subtext, marginTop: 1 }}>
              Private. Jordan won't see this.
            </div>
          </div>
          <ArrowRight size={16} color={COLORS.itoBg} />
        </button>
      </div>

      {/* Composer */}
      <div style={{
        padding: "8px 12px 12px", display: "flex", alignItems: "center",
        gap: 8, borderTop: `1px solid ${COLORS.border}`,
      }}>
        <Camera size={26} color={COLORS.accent} />
        <div style={{
          flex: 1, background: COLORS.surface, borderRadius: 22,
          padding: "10px 14px", fontSize: 14, color: COLORS.subtext,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ flex: 1 }}>Message…</span>
          <Smile size={18} />
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
      <div style={{ padding: "8px 4px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 18, background: COLORS.itoBg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Shield size={18} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>ITO</div>
          <div style={{ fontSize: 11.5, color: COLORS.subtext }}>Only you can see this</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <X size={20} color={COLORS.subtext} />
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 10px", borderRadius: 999,
          background: "#FFF4E0", color: "#8A5A00",
          fontSize: 12, fontWeight: 700, marginBottom: 12,
        }}>
          <Pause size={12} /> Something's off
        </div>

        <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35, color: COLORS.text }}>
          Jordan is pushing you for an image late at night and saying you owe them because they sent one before.
        </div>

        <div style={{
          marginTop: 14, padding: 14, background: COLORS.itoSoft,
          borderRadius: 14, fontSize: 13.5, lineHeight: 1.5, color: COLORS.text,
        }}>
          A few things to notice:
          <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
            <li>“no one's gonna see it” isn't something Jordan can actually promise.</li>
            <li>“I've sent you stuff before” is pressure, not a reason.</li>
            <li>You don't owe a reply right now.</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={onHelpReply} style={primaryBtn(COLORS.itoBg)}>
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
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <ChevronLeft size={22} color={COLORS.text} />
        </button>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>Three ways to reply</div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <X size={20} color={COLORS.subtext} />
        </button>
      </div>

      <div style={{ fontSize: 13, color: COLORS.subtext, marginTop: 6 }}>
        Pick one or use it as a starting point. Nothing sends until you tap send in your own chat.
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((o, i) => (
          <button
            key={i}
            onClick={() => setPicked(i)}
            style={{
              textAlign: "left", padding: 14, borderRadius: 14,
              border: `1.5px solid ${picked === i ? COLORS.itoBg : COLORS.border}`,
              background: picked === i ? COLORS.itoSoft : "#fff",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.itoAccent, letterSpacing: 0.3 }}>
              {o.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 14.5, color: COLORS.text, marginTop: 4, lineHeight: 1.4 }}>
              "{o.text}"
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          style={primaryBtn(COLORS.itoBg)}
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
    <Sheet onClose={onClose} accent={COLORS.alert}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <ChevronLeft size={22} color={COLORS.text} />
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: 16, background: "#FDECEC",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Hand size={16} color={COLORS.alert} />
        </div>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>Hold on a sec</div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <X size={20} color={COLORS.subtext} />
        </button>
      </div>

      <div style={{ marginTop: 14, fontSize: 16, fontWeight: 600, lineHeight: 1.4, color: COLORS.text }}>
        What you're describing — being pressured for images, being told you owe it — that's coercion. It's not a normal ask, and you're not overreacting.
      </div>

      <div style={{
        marginTop: 14, padding: 14, borderRadius: 14,
        background: "#FDECEC", color: "#7A1D1D", fontSize: 13.5, lineHeight: 1.5,
      }}>
        If Jordan has sent you images before and is threatening to share them, or if you're under 18 and being asked for images, there are people who can help — right now, free, and they don't need your name.
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <a href="tel:18008435678" style={primaryBtn(COLORS.alert) as any}>
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
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: COLORS.bg }}>
      <div style={{
        padding: "8px 16px 10px", display: "flex", alignItems: "center",
        gap: 10, borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ChevronLeft size={26} color={COLORS.text} />
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: 18, background: COLORS.itoBg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Shield size={18} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Ask ITO</div>
          <div style={{ fontSize: 11.5, color: COLORS.subtext }}>Private. Not stored. Not shared.</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px 18px", overflowY: "auto" }}>
        <div style={{
          padding: 14, background: COLORS.itoSoft, borderRadius: 14,
          fontSize: 14.5, color: COLORS.text, lineHeight: 1.45,
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
              border: `1px solid ${COLORS.border}`, background: "#fff",
              fontSize: 13.5, color: COLORS.text, cursor: "pointer",
            }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{
        padding: "8px 12px 12px", display: "flex", alignItems: "center",
        gap: 8, borderTop: `1px solid ${COLORS.border}`,
      }}>
        <div style={{
          flex: 1, background: COLORS.surface, borderRadius: 22,
          padding: "10px 14px", fontSize: 14, display: "flex", alignItems: "center",
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type what's going on…"
            style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              fontSize: 14, color: COLORS.text,
            }}
          />
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: 20, background: COLORS.itoBg,
          color: "#fff", border: "none", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer",
        }}>
          <Send size={18} />
        </button>
      </div>
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
      background: "rgba(10, 14, 22, 0.45)",
      display: "flex", alignItems: "flex-end",
    }}
    onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", background: "#fff",
          borderTopLeftRadius: 26, borderTopRightRadius: 26,
          padding: "12px 20px 28px",
          maxHeight: "85%", overflowY: "auto",
          borderTop: accent ? `3px solid ${accent}` : "none",
          animation: "slideUp 280ms cubic-bezier(.2,.9,.3,1)",
        }}
      >
        <div style={{
          width: 40, height: 4, background: "#D9DDE3", borderRadius: 2,
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

/* ---------------- Tab bar ---------------- */

function TabBar({ tab, onTab }: { tab: string; onTab: (t: any) => void }) {
  const items = [
    { id: "feed", label: "Feed", icon: Home },
    { id: "camera", label: "Camera", icon: Camera },
    { id: "chats", label: "Chats", icon: MessageCircle },
    { id: "you", label: "You", icon: User },
  ];
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 84,
      background: "#fff", borderTop: `1px solid ${COLORS.border}`,
      display: "flex", justifyContent: "space-around",
      paddingTop: 10, paddingBottom: 26,
    }}>
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onTab(it.id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, background: "none", border: "none", cursor: "pointer",
              color: active ? COLORS.accent : "#8A92A0",
            }}
          >
            <Icon size={24} strokeWidth={active ? 2.4 : 2} />
            <span style={{ fontSize: 10.5, fontWeight: 600 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Buttons ---------------- */

function primaryBtn(bg: string): React.CSSProperties {
  return {
    padding: "14px 16px", borderRadius: 14, background: bg, color: "#fff",
    border: "none", fontWeight: 700, fontSize: 14.5, cursor: "pointer",
    textAlign: "center", textDecoration: "none", display: "block",
  };
}
function ghostBtn(): React.CSSProperties {
  return {
    padding: "13px 16px", borderRadius: 14, background: "#fff",
    color: COLORS.text, border: `1.5px solid ${COLORS.border}`,
    fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "center",
  };
}
function ghostBtnAlert(): React.CSSProperties {
  return {
    padding: "13px 16px", borderRadius: 14, background: "#fff",
    color: COLORS.alert, border: `1.5px solid #F5C2C2`,
    fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "center",
    textDecoration: "none", display: "block",
  };
}
function textBtn(): React.CSSProperties {
  return {
    padding: "10px", background: "none", border: "none",
    color: COLORS.subtext, fontSize: 13.5, cursor: "pointer", fontWeight: 500,
  };
}
