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
const STORAGE = sessionStorage; // Clears on browser close — no persistent trace

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
          <DialogTitle className="text-lg">Before you begin</DialogTitle>
          <DialogDescription className="text-left space-y-3 pt-2">
            <p>
              <strong className="text-foreground">This is a research prototype</strong>, not a production product. 
              It's being tested to understand how AI can help people think through difficult situations.
            </p>
            <p>
              <strong className="text-foreground">Your responses are logged anonymously</strong> to help us 
              evaluate and improve the tool. No personally identifiable information (name, email, IP address) 
              is collected or stored.
            </p>
            <p>
              <strong className="text-foreground">This is not a crisis service.</strong> If you need immediate 
              support, please contact a{" "}
              <a href="/resources" className="text-primary underline underline-offset-2 hover:no-underline">
                crisis resource
              </a>.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="understood"
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="understood" className="text-sm font-normal leading-relaxed cursor-pointer">
              I understand this is a <strong>research prototype</strong> and not a substitute for professional support
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
              I consent to my <strong>anonymous responses</strong> being logged for research purposes
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleAccept} 
            disabled={!canProceed}
            className="w-full"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentModal;
