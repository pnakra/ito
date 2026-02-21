import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const CONSENT_KEY = "ito_consent_given";
const STORAGE = sessionStorage;

interface ConsentModalProps {
  onConsentGiven: () => void;
}

const ConsentModal = ({ onConsentGiven }: ConsentModalProps) => {
  const [open, setOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [loggingConsent, setLoggingConsent] = useState(false);

  useEffect(() => {
    const hasConsented = STORAGE.getItem(CONSENT_KEY);
    if (!hasConsented) {
      setOpen(true);
    } else {
      onConsentGiven();
    }
  }, [onConsentGiven]);

  const handleAccept = () => {
    STORAGE.setItem(CONSENT_KEY, new Date().toISOString());
    setOpen(false);
    onConsentGiven();
  };

  const canProceed = understood && loggingConsent;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-base">heads up</DialogTitle>
          <DialogDescription className="text-left space-y-2.5 pt-2 text-sm">
            <p>
              this is a <strong className="text-foreground">research prototype</strong> — not a finished product. we're testing how tools like this can help people think through confusing situations.
            </p>
            <p>
              your responses are <strong className="text-foreground">logged anonymously</strong> to improve the tool. no names, emails, or IP addresses.
            </p>
            <p>
              this isn't a crisis service. if you need help now, hit{" "}
              <a href="/resources" className="text-primary underline underline-offset-2 hover:no-underline">
                resources
              </a>.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="understood"
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="understood" className="text-sm font-normal leading-relaxed cursor-pointer">
              I get that this is a prototype, not professional support
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="logging"
              checked={loggingConsent}
              onCheckedChange={(checked) => setLoggingConsent(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="logging" className="text-sm font-normal leading-relaxed cursor-pointer">
              ok with anonymous logging for research
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleAccept} 
            disabled={!canProceed}
            className="w-full"
          >
            got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentModal;
