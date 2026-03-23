import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "ito_consent_given";
const STORAGE = sessionStorage;

interface ConsentModalProps {
  onConsentGiven: () => void;
}

const ConsentModal = ({ onConsentGiven }: ConsentModalProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasConsented = STORAGE.getItem(CONSENT_KEY);
    if (!hasConsented) {
      setShow(true);
    } else {
      onConsentGiven();
    }
  }, [onConsentGiven]);

  const handleAccept = () => {
    STORAGE.setItem(CONSENT_KEY, new Date().toISOString());
    setShow(false);
    onConsentGiven();
  };

  const handleDecline = () => {
    window.location.href = "/";
  };

  if (!show) return null;

  return (
    <div className="flex flex-col justify-start pt-[4vh] animate-fade-in">
      <div className="max-w-md mx-auto w-full space-y-4">
        <h2
          className="text-foreground"
          style={{
            fontFamily: '"Newsreader", "Georgia", serif',
            fontSize: '22px',
            fontWeight: 400,
            lineHeight: 1.3,
            letterSpacing: '-0.2px',
            fontStyle: 'italic',
          }}
        >
          Before you start
        </h2>

        <p className="text-[14px] text-muted-foreground mb-4">
          ito helps you think through situations involving other people — physically, romantically, or in between.
        </p>

        <ul className="space-y-2.5 text-[13.5px] text-muted-foreground leading-relaxed list-disc pl-4">
          <li>
            ito is an AI, not a real person. It can help you think, but it can get things wrong and doesn't know your full situation.
          </li>
          <li>
            This isn't therapy or a crisis line. If you're in danger or crisis, call or text{" "}
            <a href="tel:988" className="text-primary underline underline-offset-2 hover:no-underline font-medium">988</a>.
          </li>
          <li>
            Anonymous and private. Nothing you share is linked to you or sold.
          </li>
        </ul>

        <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
          By continuing, you're saying you understand what ito is and how your info may be used.
        </p>

        <div className="space-y-2.5 pt-1">
          <Button onClick={handleAccept}>
            I agree & continue
          </Button>
          <Button variant="ghost" onClick={handleDecline} className="w-full text-muted-foreground">
            I don't want to continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
