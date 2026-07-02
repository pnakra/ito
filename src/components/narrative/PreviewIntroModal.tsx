import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { logSubmission } from "@/lib/submissionLogger";

const STORAGE_KEY = "ito_preview_intro_seen_v1";
// Set when the user clicked "Try it" (vs dismissed via X / backdrop).
// Read by NarrativeInput to suppress the pulsing preview chip for users
// who already saw the preview — the pulse would be noise for them.
export const PREVIEW_CTA_TAKEN_KEY = "ito_preview_cta_taken_v1";

/**
 * First-visit modal that offers the interactive preview before the user
 * commits to writing their own situation. Dismisses forever after any
 * interaction (localStorage). Never blocks — always skippable.
 */
const PreviewIntroModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Defer so it doesn't race the page mount / consent modal
    const t = setTimeout(() => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setOpen(true);
        }
      } catch {
        /* noop */
      }
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
    setOpen(false);
  };

  const goToPreview = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
      localStorage.setItem(PREVIEW_CTA_TAKEN_KEY, "1");
    } catch { /* noop */ }
    logSubmission({
      flowType: "before",
      stepName: "preview_modal_cta_clicked",
      stepType: "choice",
      metadata: { surface: "check-in" },
    });
    window.location.href = "/preview";
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="max-w-[380px] rounded-2xl text-center">
        <DialogHeader className="space-y-2 items-center text-center">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            new here?
          </div>
          <DialogTitle
            className="text-[22px] leading-tight text-center"
            style={{ fontFamily: '"Newsreader", "Georgia", serif', fontStyle: "italic", fontWeight: 400 }}
          >
            see how ito works
          </DialogTitle>
          <DialogDescription className="text-[14px] leading-relaxed text-muted-foreground text-center">
            preview common scenarios people ask, respond on your own, and compare it to how ito responds
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col items-center gap-2">
          <Button onClick={goToPreview} className="w-full h-11">
            Try it <ArrowRight className="ml-1.5 w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewIntroModal;


