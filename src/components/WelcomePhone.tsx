import { ArrowUp, ChevronLeft, LockKeyhole, Signal, Wifi, BatteryFull } from "lucide-react";

const MESSAGES = [
  "we were hooking up and they pushed me away, do i bring it up next time i see them?",
  "they got quiet halfway through and i kept going, should i say something?",
  "they're texting me again after last weekend and i don't know what they want",
];

/** Presentation only: this phone never invokes the check-in engine. */
export default function WelcomePhone({ screen = "messages" }: { screen?: "messages" | "pause" | "bystander" | "privacy" }) {
  return (
    <div className="welcome-phone" aria-label="An illustration of ito on a phone">
      <div className="welcome-phone-status" aria-hidden="true"><span>9:41</span><span className="welcome-phone-island" /><span className="flex items-center gap-1"><Signal size={13} /><Wifi size={13} /><BatteryFull size={17} /></span></div>
      <div className="welcome-phone-header"><ChevronLeft size={18} aria-hidden="true" /><span>is this ok?</span><LockKeyhole size={15} aria-hidden="true" /></div>
      <div className="welcome-phone-content" key={screen}>
        {screen === "messages" && <><p className="welcome-phone-caption">It’s natural to have questions.</p><div className="welcome-messages">{MESSAGES.map((text, i) => <p className={`welcome-message welcome-message-${i}`} key={text}>{text}</p>)}</div><p className="welcome-phone-caption mt-6">Anonymous. Not linked to you.</p></>}
        {screen === "pause" && <div className="welcome-phone-note"><span className="welcome-note-label">A moment to pause</span><h3>Only the other person can tell you what they want.</h3><p>This is a reflection tool, not a ruling. Only the other person can give consent.</p><div className="welcome-note-rule" /><p>The absence of a red flag is not the presence of consent.</p></div>}
        {screen === "bystander" && <><p className="welcome-phone-caption">For something you saw or heard.</p><p className="welcome-message welcome-message-0">is it my place to say something?</p><div className="welcome-phone-note"><span className="welcome-note-label">You don’t have to be sure</span><h3>A private place to think it through.</h3><p>Something in the group chat. Something at a party. Something a friend told you.</p></div></>}
        {screen === "privacy" && <div className="welcome-phone-note welcome-phone-private"><LockKeyhole size={40} strokeWidth={1} aria-hidden="true" /><h3>No name.<br />No account.<br />Not linked to you.</h3><p>What you type is anonymous. It may be reviewed to make ito better.</p></div>}
      </div>
      <div className="welcome-phone-compose" aria-hidden="true"><span>What’s going on?</span><ArrowUp size={20} /></div>
      <div className="welcome-phone-home" aria-hidden="true" />
    </div>
  );
}