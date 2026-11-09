import type { StructuredSignals } from "@/types/signals";
import { getWitnessSafetyNotes } from "@/lib/interventionActions";

interface WitnessSafetyGuidanceProps {
  signals?: Partial<StructuredSignals> | null;
  online?: boolean;
}

const WitnessSafetyGuidance = ({ signals, online = false }: WitnessSafetyGuidanceProps) => {
  const notes = getWitnessSafetyNotes(signals);
  if (!online && notes.length === 0) return null;
  return (
    <div className="w-full space-y-2 text-left">
      {online && (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-[13px] font-medium text-foreground">Do not help the post spread.</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Do not reply, quote, repost, or tag the person. Report it in the app, save evidence privately, and ask the person targeted what they want shared.
          </p>
        </div>
      )}
      {notes.map((note) => (
        <p key={note} className="rounded-lg border border-border px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">{note}</p>
      ))}
    </div>
  );
};

export default WitnessSafetyGuidance;
