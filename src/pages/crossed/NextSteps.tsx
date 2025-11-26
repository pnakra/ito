import { useNavigate } from "react-router-dom";
import CrossedLayout from "@/components/CrossedLayout";

const NextSteps = () => {
  const navigate = useNavigate();

  return (
    <CrossedLayout 
      currentStep={4} 
      totalSteps={5}
      onNext={() => navigate("/crossed/commit")}
      onBack={() => navigate("/crossed/consent")}
    >
      <div className="space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold">What Do I Do Now?</h1>
        
        <div className="prose prose-lg max-w-none text-foreground space-y-6">
          <p className="text-xl">
            If you believe you crossed a line, the next steps are about taking responsibility and preventing future harm.
          </p>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">1. Should I apologize?</h2>
            <p className="text-lg mb-3">
              An apology can help — but only in specific situations.
            </p>
            <p className="text-lg mb-3">
              In many cases, reaching out can make things worse for the person you harmed, especially if:
            </p>
            <ul className="space-y-2 text-lg list-disc pl-6 mb-4">
              <li>they want distance</li>
              <li>they feel unsafe</li>
              <li>the apology is mostly to reduce your guilt</li>
            </ul>
            <p className="text-lg mb-3">A healthy apology focuses on:</p>
            <ul className="space-y-2 text-lg list-disc pl-6 mb-4">
              <li>naming the harm clearly</li>
              <li>zero excuses</li>
              <li>zero expectations</li>
              <li>respecting their need for space</li>
              <li>NOT seeking forgiveness</li>
            </ul>
            <p className="text-lg text-muted-foreground">
              If you're unsure, talk to a counselor or therapist before reaching out.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">2. Who can I talk to?</h2>
            <p className="text-lg mb-3">You can talk to:</p>
            <ul className="space-y-2 text-lg list-disc pl-6 mb-4">
              <li>a school counselor</li>
              <li>a trusted adult</li>
              <li>a licensed therapist</li>
              <li>a confidential hotline</li>
            </ul>
            <p className="text-lg text-muted-foreground">
              These people can help you navigate next steps safely and respectfully.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">3. How do I make sure this never happens again?</h2>
            <ul className="space-y-2 text-lg list-disc pl-6 mb-4">
              <li>Learn about consent, freeze responses, and pressure dynamics</li>
              <li>Avoid porn scripts that show unrealistic behavior</li>
              <li>Practice pausing and checking in</li>
              <li>Avoid sexual situations when you or the other person has been drinking</li>
              <li>Get support if you're struggling with boundaries or communication</li>
            </ul>
            <p className="text-lg text-muted-foreground">
              Repairing harm starts with honesty and change — not hiding, minimizing, or ignoring what happened.
            </p>
          </div>
        </div>
      </div>
    </CrossedLayout>
  );
};

export default NextSteps;
