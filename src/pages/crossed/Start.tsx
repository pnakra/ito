import { useNavigate } from "react-router-dom";
import CrossedLayout from "@/components/CrossedLayout";

const Start = () => {
  const navigate = useNavigate();

  return (
    <CrossedLayout 
      currentStep={1} 
      totalSteps={5}
      onNext={() => navigate("/crossed/what-happened")}
      showBack={false}
    >
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold">Before You Start</h1>
        
        <div className="prose prose-lg max-w-none text-foreground space-y-4">
          <p className="text-xl">
            This space is here to help you slow down, understand what happened, and think clearly about next steps.
          </p>
          
          <p className="text-lg">
            It cannot give legal advice, and it cannot tell you that everything is "fine."
          </p>
          
          <p className="text-lg">Its purpose is simple:</p>
          
          <ul className="text-lg space-y-2 list-disc pl-6">
            <li>help you understand whether harm occurred,</li>
            <li>help you learn why it happened,</li>
            <li>and help you figure out what responsible next steps look like.</li>
          </ul>
          
          <div className="bg-card border border-border rounded-lg p-6 mt-8">
            <p className="text-lg font-semibold mb-2">Important:</p>
            <p className="text-muted-foreground">
              Nothing you write here is stored. It stays in your browser only.
            </p>
          </div>
        </div>
      </div>
    </CrossedLayout>
  );
};

export default Start;
