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
    <div className="min-h-[calc(100vh-60px)] flex flex-col justify-start pt-[10vh] animate-fade-in">
      <div className="max-w-md mx-auto w-full space-y-6">
        <h1
          className="text-foreground"
          style={{
            fontFamily: '"Newsreader", "Georgia", serif',
            fontSize: '26px',
            fontWeight: 400,
            lineHeight: 1.3,
            letterSpacing: '-0.2px',
            fontStyle: 'italic',
          }}
        >
          Before you start with ito
        </h1>

        <div className="space-y-4 text-[14.5px] text-muted-foreground leading-relaxed">
          <p>
            ito is an AI, not a real person. It can be helpful to talk to, but it can also get things wrong sometimes. It doesn't have all the information about you or your life.
          </p>
          <p>
            ito is here to help you think about safer relationships, consent, and how to support friends. It is not therapy and it is not an emergency or crisis service.
          </p>
          <p>
            Please don't share your full name, address, school, phone number, or anything else that could identify you or someone you know.
          </p>
          <p>
            We may look at anonymized conversations to make ito better and to understand what kinds of support are most helpful for teens. We will not sell your information or use it for advertising.
          </p>
          <p>
            If you are in immediate danger, or if you feel like you might hurt yourself or someone else, please do not rely on ito. In the U.S., you can call or text{" "}
            <a href="tel:988" className="text-primary underline underline-offset-2 hover:no-underline font-medium">988</a>
            {" "}for mental health support, or call{" "}
            <a href="tel:911" className="text-primary underline underline-offset-2 hover:no-underline font-medium">911</a>
            {" "}in an emergency. (If you are outside the U.S., use the emergency number in your country.)
          </p>
          <p className="text-muted-foreground/70 text-[13px]">
            By tapping "I agree & continue," you're saying you understand what ito is, how your information may be used, and that you want to keep going.
          </p>
        </div>

        <div className="space-y-3 pt-2">
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
