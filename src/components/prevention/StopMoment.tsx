import { Button } from "@/components/ui/button";
import { Hand, Pause, X, Eye } from "lucide-react";
import type { RiskLevel } from "@/types/risk";

export type ReporterRole = "self" | "other" | "unsure";
export type WitnessTiming = "now" | "soon" | "already";

interface StopMomentProps {
  riskLevel: RiskLevel;
  stopMessage: string;
  onAcknowledge: () => void;
  onDismiss?: () => void;
  isCrisis?: boolean;
  /** Resolved role (controlled by the parent). When null, the role question is asked first. */
  role?: ReporterRole | null;
  onRoleSelect?: (role: ReporterRole) => void;
  witnessTiming?: WitnessTiming | null;
  onWitnessTiming?: (timing: WitnessTiming) => void;
}

const TIMING_OPTIONS: { value: WitnessTiming; label: string }[] = [
  { value: "now", label: "Happening right now" },
  { value: "soon", label: "It might happen soon" },
  { value: "already", label: "It already happened" },
];

const ROLE_OPTIONS: { value: ReporterRole; label: string }[] = [
  { value: "self", label: "Something I'm doing, or might do" },
  { value: "other", label: "Something someone else is doing, or did" },
  { value: "unsure", label: "Not sure" },
];

const linkClass =
  "flex items-center justify-center w-full py-3 rounded-lg border border-signal-stop/20 text-signal-stop text-[14px] font-medium hover:bg-signal-stop/5 transition-colors";

const StopMoment = ({ riskLevel, stopMessage, onAcknowledge, onDismiss, isCrisis, role = null, onRoleSelect, witnessTiming = null, onWitnessTiming }: StopMomentProps) => {
  const isRed = riskLevel === "red";
  // Crisis (self-harm) keeps its own frame; no role or timing question.
  const needsRole = !isCrisis && role === null;
  const isWitness = !isCrisis && role === "other";
  const needsTiming = isWitness && witnessTiming === null;

  const pickRole = (r: ReporterRole) => onRoleSelect?.(r);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-background/95 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="max-w-lg w-full p-8 rounded-lg relative bg-card shadow-card animate-scale-in">
        {!isRed && onDismiss && !needsRole && !needsTiming && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {needsRole ? (
          <div className="flex flex-col space-y-5">
            <h2 className="text-h2 text-foreground">Quick question first</h2>
            <p className="text-body text-foreground/90">Is this about something you're doing, or something someone else is doing?</p>
            <div className="flex flex-col gap-3">
              {ROLE_OPTIONS.map((o) => (
                <Button key={o.value} variant="outline" size="lg" className="w-full justify-start py-5 text-left whitespace-normal h-auto" onClick={() => pickRole(o.value)}>
                  {o.label}
                </Button>
              ))}
            </div>
          </div>
        ) : needsTiming ? (
          <div className="flex flex-col space-y-5">
            <h2 className="text-h2 text-foreground">When is this?</h2>
            <div className="flex flex-col gap-3">
              {TIMING_OPTIONS.map((o) => (
                <Button key={o.value} variant="outline" size="lg" className="w-full justify-start py-5 text-left whitespace-normal h-auto" onClick={() => onWitnessTiming?.(o.value)}>
                  {o.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className={`p-5 rounded-xl ${isRed ? "bg-signal-stop/10" : "bg-signal-pause/10"}`}>
              {isWitness ? (
                <Eye className={`w-12 h-12 ${isRed ? "text-signal-stop" : "text-signal-pause"}`} strokeWidth={1.5} />
              ) : isRed ? (
                <Hand className="w-12 h-12 text-signal-stop" strokeWidth={1.5} />
              ) : (
                <Pause className="w-12 h-12 text-signal-pause" strokeWidth={1.5} />
              )}
            </div>

            <h2 className={`text-h2 ${isRed ? "text-signal-stop" : "text-signal-pause"}`}>
              {isCrisis
                ? "Hey — we see you."
                : isWitness
                  ? isRed ? "This sounds serious" : "Something about this is off"
                  : isRed ? "Hold on" : "Something feels off"}
            </h2>

            {isWitness ? (
              <div className="text-body text-foreground/90 space-y-3 text-left w-full">
                {witnessTiming === "now" && (
                  <div className="space-y-2">
                    <a href="tel:911" className={linkClass}>Call 911</a>
                    <p className="text-[14px]">If someone is passed out, can't respond, or is in danger, call 911.</p>
                  </div>
                )}
                <p>What other people say someone wants isn't that person saying it. What can help:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {witnessTiming === "now" && <li>Interrupt. Make an excuse, get their friends, get them out of there.</li>}
                  {witnessTiming === "soon" && (
                    <>
                      <li>Say something plainly to the person planning it.</li>
                      <li>Tell the person at risk, or someone close to them, if you can.</li>
                    </>
                  )}
                  {witnessTiming === "already" && (
                    <>
                      <li>Check on them if you know them. Keep it short and let them lead.</li>
                      <li>Tell someone who can act: an adult you trust, or RAINN at 1-800-656-4673.</li>
                    </>
                  )}
                  <li>Save any messages. On Snapchat, take a photo of the screen with another phone. A screenshot or a save tells the group.</li>
                </ul>
              </div>
            ) : (
              <p className="text-body text-foreground/90">{stopMessage}</p>
            )}

            <Button
              onClick={onAcknowledge}
              size="lg"
              variant="outline"
              className={`w-full py-5 font-medium transition-all ${
                isRed
                  ? "border-signal-stop/30 text-signal-stop hover:bg-signal-stop/5"
                  : "border-signal-pause/30 text-signal-pause hover:bg-signal-pause/5"
              }`}
            >
              Show me what you see
            </Button>
            {isRed && (
              <div className="w-full space-y-2 pt-2">
                <p className="text-[12px] text-muted-foreground text-center">
                  {isCrisis ? "You can talk to someone right now:" : "If someone is in danger right now:"}
                </p>
                {isWitness && witnessTiming !== "now" && <a href="tel:911" className={linkClass}>Call 911</a>}
                <a href="tel:988" className={linkClass}>Call or text 988 — Crisis Lifeline</a>
                <a href="tel:18006564673" className={linkClass}>Call RAINN — 1-800-656-4673</a>
                <a href="sms:741741?body=HELLO" className={linkClass}>Text HOME to 741741 — Crisis Text Line</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StopMoment;
