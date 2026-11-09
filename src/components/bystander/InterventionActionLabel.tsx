import { getInterventionAction } from "@/lib/interventionActions";

const InterventionActionLabel = ({ text }: { text: string }) => {
  const action = getInterventionAction(text);
  return (
    <div className="mt-3 border-t border-callout-foreground/10 pt-3 space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
        <span className="rounded-full bg-muted px-2.5 py-1 text-foreground">5 D: {action.fiveD}</span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">5 C: {action.fiveC}</span>
      </div>
      <p className="text-[12px] leading-relaxed text-muted-foreground">{action.reason}</p>
    </div>
  );
};

export default InterventionActionLabel;
