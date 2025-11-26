import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CrossedLayout from "@/components/CrossedLayout";
import { Textarea } from "@/components/ui/textarea";

const WhatHappened = () => {
  const navigate = useNavigate();
  const [journalText, setJournalText] = useState("");

  return (
    <CrossedLayout 
      currentStep={2} 
      totalSteps={5}
      onNext={() => navigate("/crossed/consent")}
      onBack={() => navigate("/crossed/start")}
    >
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold">What Happened?</h1>
        
        <div className="prose prose-lg max-w-none text-foreground space-y-4">
          <p className="text-xl">
            Take a quiet moment and write down what happened in your own words.
          </p>
          <p className="text-lg">
            This is for you — not for anyone else.
          </p>
          <p className="text-lg">
            It will help you see the situation more clearly.
          </p>
        </div>

        <div className="mt-8">
          <Textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Write what happened. Include what led up to it, how the other person reacted, and what you did next…"
            className="min-h-[200px] text-base"
          />
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mt-8 space-y-4">
          <p className="font-semibold text-lg">Think about these questions:</p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-primary">•</span>
              <span>Where were you and what was happening before things became physical?</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">•</span>
              <span>Did they ever hesitate, freeze, go quiet, or pull away?</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">•</span>
              <span>Did alcohol, drugs, or pressure play a role?</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">•</span>
              <span>What did you do after noticing any hesitation or discomfort?</span>
            </li>
          </ul>
        </div>
      </div>
    </CrossedLayout>
  );
};

export default WhatHappened;
