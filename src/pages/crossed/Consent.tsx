import { useNavigate } from "react-router-dom";
import CrossedLayout from "@/components/CrossedLayout";

const Consent = () => {
  const navigate = useNavigate();

  return (
    <CrossedLayout 
      currentStep={3} 
      totalSteps={5}
      onNext={() => navigate("/crossed/next-steps")}
      onBack={() => navigate("/crossed/what-happened")}
    >
      <div className="space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold">Understanding Consent</h1>
        
        <div className="prose prose-lg max-w-none text-foreground space-y-6">
          <p className="text-xl">
            You may have crossed a line if any of the following were true:
          </p>
          
          <ul className="space-y-3 text-lg list-disc pl-6">
            <li>They went silent, froze, or stopped actively participating</li>
            <li>They seemed uncomfortable but didn't say "no" directly</li>
            <li>They were drunk, high, or unable to think clearly</li>
            <li>You felt unsure but kept going</li>
            <li>You relied on pressure, persistence, or "going along with it"</li>
          </ul>

          <div className="bg-card border-2 border-warning/50 rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-bold mb-3">The Freeze Response</h2>
            <p className="text-lg mb-2">
              Many people freeze when scared or overwhelmed.
            </p>
            <p className="text-lg mb-2">
              A freeze is not consent.
            </p>
            <p className="text-lg text-muted-foreground">
              It's a reaction that often looks like passivity, stillness, or silence.
            </p>
          </div>

          <div className="bg-card border-2 border-destructive/50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-3">Alcohol and Consent</h2>
            <p className="text-lg mb-2">
              If someone is intoxicated, they cannot give clear, voluntary consent.
            </p>
            <p className="text-lg text-muted-foreground">
              Continuing sexual activity in that state often causes serious harm.
            </p>
          </div>

          <div className="bg-card border-2 border-primary/50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-3">Intent vs. Impact</h2>
            <p className="text-lg mb-2">
              You may not have meant to hurt anyone — but harm can still occur.
            </p>
            <p className="text-lg text-muted-foreground">
              This step is about recognizing that clearly and honestly.
            </p>
          </div>
        </div>
      </div>
    </CrossedLayout>
  );
};

export default Consent;
