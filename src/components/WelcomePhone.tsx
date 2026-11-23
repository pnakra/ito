import { useEffect, useState } from "react";
import { ArrowUp, ChevronLeft, LockKeyhole, Signal, Wifi, BatteryFull } from "lucide-react";

export type WelcomeScreen = "messages" | "pause" | "bystander";
type Bubble = { from: "you" | "ito"; text: string; label?: string };

const SCRIPTS: Record<WelcomeScreen, { caption: string; bubbles: Bubble[] }> = {
  messages: { caption: "It’s natural to have questions.", bubbles: [
    { from: "you", text: "we were hooking up and they pushed me away, do i bring it up next time i see them?" },
    { from: "you", text: "they got quiet halfway through and i kept going, should i say something?" },
    { from: "you", text: "they're texting me again after last weekend and i don't know what they want" },
  ] },
  pause: { caption: "An honest read. Not permission.", bubbles: [
    { from: "you", text: "she said maybe. that's basically a yes right?" },
    { from: "ito", label: "A moment to pause", text: "Maybe isn’t a yes. Only the other person can tell you what they want, so slowing down and asking is the move." },
  ] },
  bystander: { caption: "For something you saw or heard.", bubbles: [
    { from: "you", text: "my friend left with someone who could barely stand. is it my place to say something?" },
    { from: "ito", label: "You don’t have to be sure", text: "Checking in is never overstepping. A quick text to your friend is a good first step." },
  ] },
};

/** Presentation only: this phone never invokes the check-in engine. */
export default function WelcomePhone({ screen = "messages", active = true }: { screen?: WelcomeScreen; active?: boolean }) {
  const script = SCRIPTS[screen];
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!active) { setShown(0); setTyping(false); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(script.bubbles.length); return; }
    const timers: number[] = [];
    let t = 400;
    script.bubbles.forEach((bubble, i) => {
      if (bubble.from === "ito") { timers.push(window.setTimeout(() => setTyping(true), t)); t += 1300; }
      timers.push(window.setTimeout(() => { setTyping(false); setShown(i + 1); }, t));
      t += bubble.from === "you" ? 1100 : 900;
    });
    return () => timers.forEach(clearTimeout);
  }, [active, screen, script.bubbles]);

  return (
    <div className="welcome-phone" aria-label="An illustration of ito on a phone">
      <div className="welcome-phone-status" aria-hidden="true"><span>9:41</span><span className="welcome-phone-island" /><span className="flex items-center gap-1"><Signal size={13} /><Wifi size={13} /><BatteryFull size={17} /></span></div>
      <div className="welcome-phone-header"><ChevronLeft size={18} aria-hidden="true" /><span>is this ok?</span><LockKeyhole size={15} aria-hidden="true" /></div>
      <div className="welcome-phone-content">
        <p className="welcome-phone-caption">{script.caption}</p>
        <div className="welcome-messages">
          {script.bubbles.slice(0, shown).map((b, i) => b.from === "you"
            ? <p className="welcome-message welcome-message-you" key={i}>{b.text}</p>
            : <div className="welcome-message welcome-message-ito" key={i}>{b.label && <span className="welcome-note-label">{b.label}</span>}<p>{b.text}</p></div>)}
          {typing && <div className="welcome-typing" aria-hidden="true"><span /><span /><span /></div>}
        </div>
      </div>
      <div className="welcome-phone-compose" aria-hidden="true"><span>What’s going on?</span><ArrowUp size={20} /></div>
      <div className="welcome-phone-home" aria-hidden="true" />
    </div>
  );
}
