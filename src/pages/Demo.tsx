import { Card } from "@/components/ui/card";

const Demo = () => {
  return (
    <div className="min-h-screen bg-white text-black p-8 print:p-4">
      {/* Header */}
      <header className="text-center mb-12 print:mb-8">
        <h1 className="text-4xl font-bold mb-2">ITO – Interactive Demo Walkthrough</h1>
        <p className="text-lg text-gray-600">
          Three scenarios demonstrating the "Before" flow for stakeholder review
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Generated: {new Date().toLocaleDateString()}
        </p>
      </header>

      {/* Scenario 1: Green Signal */}
      <section className="mb-16 print:mb-12 page-break-after">
        <h2 className="text-2xl font-bold mb-6 border-b-2 border-green-500 pb-2">
          Scenario 1: Green Signal (No Red Flags)
        </h2>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Context</h3>
          <p className="text-gray-700">
            A user is considering making a move with someone they've been seeing. 
            All signals are positive—clear verbal consent, no power imbalances, 
            and the situation is progressing naturally.
          </p>
        </div>

        {/* Step-by-step flow */}
        <div className="space-y-8">
          {/* Step 1: Landing */}
          <Card className="p-6 border-l-4 border-blue-500">
            <h4 className="font-semibold text-lg mb-2">Step 1: Entry Point</h4>
            <p className="text-gray-600 mb-4">
              User selects "I'm thinking about making a move" from the home screen.
            </p>
            <div className="bg-gray-100 p-4 rounded text-center text-gray-500">
              <p className="font-medium">Welcome Screen</p>
              <p className="text-sm">"Before anything happens"</p>
              <p className="text-sm">"Answer a few questions. See what comes up."</p>
            </div>
          </Card>

          {/* Step 2: Orientation */}
          <Card className="p-6 border-l-4 border-blue-500">
            <h4 className="font-semibold text-lg mb-2">Step 2: Orientation</h4>
            <p className="text-gray-600 mb-4">
              <strong>Question:</strong> "What's the situation?"
            </p>
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="font-medium text-green-800">✓ Selected: "We're together in person"</p>
            </div>
          </Card>

          {/* Step 3: Consent Signal */}
          <Card className="p-6 border-l-4 border-blue-500">
            <h4 className="font-semibold text-lg mb-2">Step 3: Observed Consent Signals</h4>
            <p className="text-gray-600 mb-4">
              <strong>Question:</strong> "What are they doing or saying?"
            </p>
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="font-medium text-green-800">✓ Selected: "They said yes or told me they want to"</p>
            </div>
          </Card>

          {/* Step 4: Context Factors */}
          <Card className="p-6 border-l-4 border-blue-500">
            <h4 className="font-semibold text-lg mb-2">Step 4: Context Factors</h4>
            <p className="text-gray-600 mb-4">
              <strong>Question:</strong> "Is anything else going on?" (Multi-select)
            </p>
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="font-medium text-green-800">✓ Selected: "None of these"</p>
            </div>
          </Card>

          {/* Step 5: Momentum */}
          <Card className="p-6 border-l-4 border-blue-500">
            <h4 className="font-semibold text-lg mb-2">Step 5: Momentum Check</h4>
            <p className="text-gray-600 mb-4">
              <strong>Question:</strong> "Where is this going?"
            </p>
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="font-medium text-green-800">✓ Selected: "Just flirting or talking"</p>
            </div>
          </Card>

          {/* Step 6: Additional Context */}
          <Card className="p-6 border-l-4 border-blue-500">
            <h4 className="font-semibold text-lg mb-2">Step 6: Optional Context</h4>
            <p className="text-gray-600 mb-4">
              <strong>Prompt:</strong> "Anything else you want to share?"
            </p>
            <div className="bg-gray-100 p-3 rounded border border-gray-300 italic">
              "We've been hanging out for a few weeks and they seem really into it. They keep moving closer and smiling."
            </div>
          </Card>

          {/* Step 7: Assessment */}
          <Card className="p-6 border-l-4 border-green-500 bg-green-50">
            <h4 className="font-semibold text-lg mb-2">Step 7: Assessment Result</h4>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                🟢 No clear red flags right now
              </span>
            </div>
            <p className="text-gray-700 mb-4">
              The AI provides context-aware feedback acknowledging the positive signals while reminding the user that consent is ongoing.
            </p>
            <div className="bg-white p-4 rounded border">
              <p className="font-medium mb-2">Sample AI Response:</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><strong>What's happening:</strong> They're showing clear interest through words and body language</li>
                <li><strong>What to keep doing:</strong> Continue checking in as things progress</li>
                <li><strong>Remember:</strong> Consent can be withdrawn at any time—keep communicating</li>
              </ul>
            </div>
          </Card>

          {/* Step 8: Follow-up Chat */}
          <Card className="p-6 border-l-4 border-purple-500">
            <h4 className="font-semibold text-lg mb-2">Step 8: Follow-up Conversation</h4>
            <p className="text-gray-600 mb-4">
              User has the option to ask follow-up questions or get more context.
            </p>
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                  "What if they change their mind later?"
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-200 p-3 rounded-lg max-w-md text-sm">
                  "Great question. Consent isn't a one-time thing—it's ongoing. If at any point they seem hesitant, pull back, or say stop, that's your cue to pause and check in. A simple 'Are you still okay with this?' goes a long way."
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                  "How do I check in without making it awkward?"
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-200 p-3 rounded-lg max-w-md text-sm">
                  "It doesn't have to be formal. Things like 'Is this okay?' or 'Do you want to keep going?' can feel natural in the moment. Most people appreciate being asked."
                </div>
              </div>
            </div>
          </Card>

          {/* Step 9: Outcome */}
          <Card className="p-6 border-l-4 border-gray-400">
            <h4 className="font-semibold text-lg mb-2">Step 9: Outcome Check</h4>
            <p className="text-gray-600 mb-4">
              Before exiting, the tool asks how the user is feeling about the situation.
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <p className="font-medium mb-2">Options presented:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• I feel clearer now</li>
                <li>• I'm going to slow down</li>
                <li>• I'm still not sure</li>
                <li>• I need more help</li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      {/* Scenario 2: Yellow Signal - Placeholder */}
      <section className="mb-16 print:mb-12 page-break-after">
        <h2 className="text-2xl font-bold mb-6 border-b-2 border-yellow-500 pb-2">
          Scenario 2: Yellow Signal (Pause & Check)
        </h2>
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
          <p className="text-yellow-800 font-medium">To be captured</p>
          <p className="text-sm text-yellow-600 mt-2">
            Mixed signals scenario with alcohol involvement
          </p>
        </div>
      </section>

      {/* Scenario 3: Red Signal - Placeholder */}
      <section className="mb-16 print:mb-12">
        <h2 className="text-2xl font-bold mb-6 border-b-2 border-red-500 pb-2">
          Scenario 3: Red Signal (Wait)
        </h2>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
          <p className="text-red-800 font-medium">To be captured</p>
          <p className="text-sm text-red-600 mt-2">
            Clear warning signs scenario requiring immediate pause
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm border-t pt-6 print:pt-4">
        <p>ITO – Confidential Demo Asset</p>
        <p>For stakeholder review only</p>
      </footer>

      {/* Print styles */}
      <style>{`
        @media print {
          .page-break-after {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
};

export default Demo;
