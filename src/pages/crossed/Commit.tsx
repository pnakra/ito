import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CrossedLayout from "@/components/CrossedLayout";
import { Textarea } from "@/components/ui/textarea";

const Commit = () => {
  const navigate = useNavigate();
  const [commitmentText, setCommitmentText] = useState("");

  return (
    <CrossedLayout 
      currentStep={5} 
      totalSteps={5}
      onNext={() => navigate("/")}
      onBack={() => navigate("/crossed/next-steps")}
      nextLabel="Finish"
    >
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold">Reflection & Commitment</h1>
        
        <div className="prose prose-lg max-w-none text-foreground space-y-4">
          <p className="text-xl">
            Take a moment to write down what you want to do differently going forward.
          </p>
          <p className="text-lg">
            This is not about guilt — it's about clarity.
          </p>
        </div>

        <div className="mt-8">
          <Textarea
            value={commitmentText}
            onChange={(e) => setCommitmentText(e.target.value)}
            placeholder="What will I change to make sure I never repeat this harm?"
            className="min-h-[200px] text-base"
          />
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mt-8 space-y-4">
          <p className="font-semibold text-lg">Consider these questions:</p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-primary">•</span>
              <span>"What will I do when I feel unsure in the moment?"</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">•</span>
              <span>"How will I make sure the other person is fully comfortable and participating?"</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">•</span>
              <span>"What support do I need to stick to this?"</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-primary/10 border-2 border-primary/50 rounded-lg p-8 mt-8">
          <p className="text-lg text-center">
            You've taken an important step by being honest with yourself.
            If you caused harm, accountability and change are possible — but they require continued effort, learning, and support.
          </p>
        </div>
      </div>
    </CrossedLayout>
  );
};

export default Commit;
