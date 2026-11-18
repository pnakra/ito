import { forwardRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import { FLYERS, type PartnerFocus } from "@/data/partnerKit";

/* Print artifact: fixed brand colors are intentional (always a white page). */
const ORANGE = "#E4572E";
const HEAD = "'Space Grotesk', sans-serif";
const BODY = "'Inter', sans-serif";

function useQr(url: string) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 0, width: 600, errorCorrectionLevel: "M" }).then(setSrc).catch(() => setSrc(""));
  }, [url]);
  return src;
}

interface Props { focus: PartnerFocus; org: string; width: number; height: number }

/** Flyer at 96px/in. Letter = 816x1056; image variant = 864x1080 (exported at 1.25x). */
const Flyer = forwardRef<HTMLDivElement, Props>(({ focus, org, width, height }, ref) => {
  const f = FLYERS[focus];
  const qrBy = useQr("https://isthisok.app/bystanderbeta");
  const qrIto = useQr("https://isthisok.app");
  const orgName = org.trim();
  return (
    <div ref={ref} style={{ width, height, background: "#fff", color: "#000", fontFamily: BODY, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <div style={{ height: 24, background: ORANGE, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: "48px 72px 72px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 28 }}>is this ok?</span>
          {f.pill && <span style={{ background: "#000", color: "#fff", borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em" }}>BYSTANDER BETA</span>}
        </div>
        <h1 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 84, lineHeight: 0.98, letterSpacing: "-0.02em", margin: "40px 0 0" }}>{f.headline}</h1>
        <p style={{ fontSize: 24, lineHeight: 1.35, color: "#333", margin: "24px 0 0" }}>{f.sub}</p>
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", margin: "32px 0 12px" }}>LIKE WHEN</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {f.examples.map((e) => (
            <div key={e} style={{ border: "2px solid #000", borderRadius: 10, padding: "14px 18px", fontSize: 20, lineHeight: 1.3 }}>{e}</div>
          ))}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 28 }}>
          {focus === "both" ? (
            <div style={{ display: "flex", gap: 40 }}>
              {[{ l: "For you", u: "isthisok.app", q: qrIto }, { l: "For a friend", u: "isthisok.app/bystanderbeta", q: qrBy }].map((x) => (
                <div key={x.l} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 20 }}>{x.l}</span>
                  {x.q && <img src={x.q} alt="" style={{ width: 154, height: 154 }} />}
                  <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 16 }}>{x.u}</span>
                </div>
              ))}
              <div style={{ alignSelf: "flex-end", fontSize: 16, color: "#333", paddingBottom: 2 }}>Free. Anonymous.<br />No sign-in.</div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {(focus === "bystander" ? qrBy : qrIto) && <img src={focus === "bystander" ? qrBy : qrIto} alt="" style={{ width: 200, height: 200 }} />}
              <div>
                <div style={{ fontSize: 18, color: "#333" }}>Scan or go to</div>
                <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: focus === "bystander" ? 30 : 40, margin: "4px 0 8px", wordBreak: "break-word" }}>
                  {focus === "bystander" ? "isthisok.app/bystanderbeta" : "isthisok.app"}
                </div>
                <div style={{ fontSize: 18, color: "#333" }}>Free. Anonymous. No sign-in.</div>
              </div>
            </div>
          )}
          {orgName && <div style={{ fontSize: 18, fontWeight: 600, marginTop: 24 }}>Shared by {orgName}</div>}
          <div style={{ borderTop: "2px solid #000", marginTop: orgName ? 10 : 24, paddingTop: 12, display: "flex", justifyContent: "space-between", gap: 24, fontSize: 12, lineHeight: 1.4, color: "#333" }}>
            <span style={{ maxWidth: "65%" }}>is this ok? is an AI tool, not a crisis line, and it never contacts anyone for you. In an emergency, call 911.</span>
            <span style={{ textAlign: "right" }}>Built by Override Labs, a nonprofit</span>
          </div>
        </div>
      </div>
    </div>
  );
});
Flyer.displayName = "Flyer";
export default Flyer;
