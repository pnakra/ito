import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const STORAGE_KEY = "ito_preview_intro_seen_v1";

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
        if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
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
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
    window.location.href = "/preview";
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="max-w-[380px] rounded-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            new here?
          </div>
          <DialogTitle
            className="text-[22px] leading-tight"
            style={{ fontFamily: '"Newsreader", "Georgia", serif', fontStyle: "italic", fontWeight: 400 }}
          >
            see how ito responds first
          </DialogTitle>
          <DialogDescription className="text-[14px] leading-relaxed text-muted-foreground">
            pick a vibe, see the read, compare it to yours. takes 30 seconds — no writing required.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-2">
          <Button onClick={goToPreview} className="w-full h-11">
            Try a scenario <ArrowRight className="ml-1.5 w-4 h-4" />
          </Button>
          <button
            onClick={dismiss}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            skip — I'll write my own
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewIntroModal;
