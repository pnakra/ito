import { forwardRef, useEffect, useId, useState } from "react";
import QRCode from "qrcode";
import type { PartnerFocus } from "@/data/partnerKit";

/* Export artifact: fixed hex colors are intentional (rendered to PDF/PNG, not themed UI). */
export type FlyerTheme = "dark" | "print";
const SANS = "'Inter', sans-serif";
const SERIF = "'Instrument Serif', serif";

const PALETTE = {
  dark: { bg: "#0a0a0a", text: "#fff", sub: "#e8e6e1", quotes: "#f2f0eb", muted: "#a8a29a", pill: "#4a4540", cardBg: "#121212", card: "#3a3a3a", rule: "#333" },
  print: { bg: "#fff", text: "#111", sub: "#333", quotes: "#444", muted: "#666", pill: "#bbb", cardBg: "#fff", card: "#c8c8c8", rule: "#d0d0d0" },
};

const BY_POV = "pov: someone in the group chat posted<br>a photo of a girl passed out at the party.<br>everyone's laughing. you're not.";
const BY_QUOTES = ["is it my place to say something?", "my friend keeps pushing someone who seems uncomfortable.", "someone told me what happened to them at a party."];
const COPY: Record<PartnerFocus, { pov: string; sub: string; heading: string; quotes: string[] }> = {
  bystander: { pov: BY_POV, sub: "a private space to think through something<br>you saw or heard that felt off.", heading: "you don't have to be sure", quotes: BY_QUOTES },
  ito: {
    pov: "pov: it's 2am.<br>they haven't texted back.<br>you're not sure how to feel.",
    sub: "a private space to think through dating, sex,<br>and situations that feel off.",
    heading: "it's natural to have questions",
    quotes: ["they said yes, but something felt off.", "should I try to hook up with them when I see them next?", "did we only kiss because we were drinking?"],
  },
  both: { pov: BY_POV, sub: "a private space to think through dating, sex,<br>and things you saw that felt off.", heading: "you don't have to be sure", quotes: BY_QUOTES },
};

const lines = (s: string) => s.split("<br>").map((l, i, a) => <span key={i}>{l}{i < a.length - 1 && <br />}</span>);

function useQr(url: string) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 0, width: 600, errorCorrectionLevel: "M" }).then(setSrc).catch(() => setSrc(""));
  }, [url]);
  return src;
}

interface Props { focus: PartnerFocus; theme: FlyerTheme; org: string }

/** Letter flyer at 96px/in (816x1056). Same node exports PDF (3x) and image (1.5x). */
const Flyer = forwardRef<HTMLDivElement, Props>(({ focus, theme, org }, ref) => {
  const c = PALETTE[theme];
  const dark = theme === "dark";
  const copy = COPY[focus];
  const gid = "fg" + useId().replace(/:/g, "");
  const qrBy = useQr("https://isthisok.app/bystanderbeta");
  const qrIto = useQr("https://isthisok.app");
  const orgName = org.trim();
  const cards = focus === "both"
    ? [{ q: qrIto, u: "isthisok.app", l: "for your own situations" }, { q: qrBy, u: "isthisok.app/bystanderbeta", l: "for something you saw" }]
    : focus === "bystander"
      ? [{ q: qrBy, u: "isthisok.app/bystanderbeta", l: "anonymous. no sign-in. not linked to you." }]
      : [{ q: qrIto, u: "isthisok.app", l: "personal questions. private answers." }];
  const cardW = focus === "both" ? 250 : 290;
  const bg = dark
    ? "radial-gradient(ellipse 520px 360px at 12% 6%, rgba(120,80,20,.55), transparent 70%), radial-gradient(ellipse 420px 420px at 95% 40%, rgba(90,40,15,.35), transparent 70%), linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px) 0 0 / 48px 48px, linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px) 0 0 / 48px 48px, #0a0a0a"
    : "#fff";

  const title = (
    <svg width={460} height={128} viewBox="0 0 460 128" style={{ display: "block", overflow: "visible" }} aria-label="is this ok?">
      {dark && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f7a23b" /><stop offset="45%" stopColor="#ef6a2b" />
            <stop offset="75%" stopColor="#d9a24a" /><stop offset="100%" stopColor="#b9b04a" />
          </linearGradient>
        </defs>
      )}
      <text x="230" y="98" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={112} letterSpacing={-2}
        fill={dark ? `url(#${gid})` : "#111"} stroke={dark ? undefined : "#111"} strokeWidth={dark ? undefined : 2.2}>is this ok?</text>
    </svg>
  );

  return (
    <div ref={ref} style={{ width: 816, height: 1056, position: "relative", overflow: "hidden", background: bg, color: c.text, fontFamily: SANS, textAlign: "center", boxSizing: "border-box" }}>
      <div style={{ paddingTop: 52, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {focus !== "ito" && (
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, border: `1px solid ${c.pill}`, borderRadius: 999, padding: "6px 14px", lineHeight: 1.2, marginBottom: 18 }}>BYSTANDER BETA</span>
        )}
        <div style={{ fontWeight: 500, fontSize: 34, lineHeight: 1.15, letterSpacing: -0.5 }}>{lines(copy.pov)}</div>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          {dark ? (
            <div style={{ width: 420, borderTop: "1px solid #5a5550", borderLeft: "1px solid #5a5550", borderRight: "1px solid #5a5550", display: "flex", justifyContent: "center" }}>
              <div style={{ margin: "0 -20px" }}>{title}</div>
            </div>
          ) : title}
        </div>
        <div style={{ marginTop: 18, fontSize: 18, lineHeight: 1.65, color: c.sub }}>{lines(copy.sub)}</div>
        <div style={{ marginTop: focus === "both" ? 32 : 40, fontWeight: 500, fontSize: 34, lineHeight: 1.15 }}>{copy.heading}</div>
        <div style={{ marginTop: 14, fontSize: 15.5, lineHeight: 2.05, color: c.quotes }}>
          {copy.quotes.map((q) => <div key={q}>"{q}"</div>)}
        </div>
        <div style={{ marginTop: focus === "both" ? 30 : 36, display: "flex", gap: 20, justifyContent: "center" }}>
          {cards.map((x) => (
            <div key={x.u} style={{ width: cardW, boxSizing: "border-box", border: `1px solid ${c.card}`, borderRadius: 16, padding: "24px 0 22px", background: c.cardBg, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ background: "#fff", borderRadius: 12, padding: dark ? 10 : 0, lineHeight: 0 }}>
                {x.q && <img src={x.q} alt="" style={{ width: 122, height: 122, display: "block" }} />}
              </div>
              <div style={{ marginTop: 14, fontWeight: 500, fontSize: 17 }}>{x.u}</div>
              <div style={{ marginTop: 6, fontSize: 12.5, color: c.muted }}>{x.l}</div>
            </div>
          ))}
        </div>
      </div>
      {orgName && <div style={{ position: "absolute", left: 52, right: 52, bottom: 30 + 40 + 24, fontSize: 13, color: c.muted }}>shared by {orgName}</div>}
      <div style={{ position: "absolute", left: 52, right: 52, bottom: 30, borderTop: `1px solid ${c.rule}`, paddingTop: 12, display: "flex", justifyContent: "space-between", gap: 24, fontSize: 10.5, lineHeight: 1.4, color: c.muted, textAlign: "left" }}>
        <span>ito is an AI tool, not a crisis line, and it never contacts anyone for you. in an emergency, call 911.</span>
        <span style={{ whiteSpace: "nowrap" }}>built by Override Labs, a nonprofit</span>
      </div>
    </div>
  );
});
Flyer.displayName = "Flyer";
export default Flyer;
