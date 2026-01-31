import { Card } from "@/components/ui/card";
import ScenarioSection from "@/components/demo/ScenarioSection";

// To add real screenshots:
// 1. Take screenshots from the live app at each step (mobile viewport: 390x844)
// 2. Save them to public/demo/ folder (e.g., public/demo/s1-home.png)
// 3. Update the paths below to point to your screenshots
//
// Example: home: "/demo/s1-home.png"

const SCREENSHOTS = {
  scenario1: {
    home: "",  // /demo/s1-01-home.png
    intro: "", // /demo/s1-02-intro.png
    situation: "", // /demo/s1-03-situation.png
    consent: "", // /demo/s1-04-consent.png
    context: "", // /demo/s1-05-context.png
    momentum: "", // /demo/s1-06-momentum.png
    freetext: "", // /demo/s1-07-freetext.png
    result: "", // /demo/s1-08-result.png
  },
};

interface ScreenshotFrameProps {
  src: string;
  alt: string;
  caption?: string;
  stepLabel?: string;
}

const ScreenshotFrame = ({ src, alt, caption, stepLabel }: ScreenshotFrameProps) => (
  <div className="flex flex-col items-center flex-shrink-0">
    <div 
      className="border-2 border-gray-300 rounded-2xl overflow-hidden shadow-xl bg-gray-100 flex items-center justify-center" 
      style={{ width: '180px', height: '390px' }}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📱</div>
          <p className="text-xs text-gray-500 font-medium">{stepLabel || alt}</p>
          <p className="text-[10px] text-gray-400 mt-1">Screenshot placeholder</p>
        </div>
      )}
    </div>
    {caption && (
      <p className="mt-2 text-xs text-gray-500 text-center max-w-[180px]">{caption}</p>
    )}
  </div>
);

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
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
          <p className="text-sm text-blue-700">
            📱 Screenshots captured from mobile viewport (390×844)
          </p>
        </div>
      </header>

      {/* Scenario 1: Green Signal */}
      <ScenarioSection number={1} title="Green Signal (No Red Flags)" signalColor="green">
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Context</h3>
          <p className="text-gray-700">
            A user is considering making a move with someone they've been seeing. 
            All signals are positive—clear verbal consent, no power imbalances, 
            and the situation is progressing naturally.
          </p>
        </div>

        {/* Step-by-step flow with screenshots */}
        <div className="space-y-8">
          {/* Step 1: Home */}
          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Step 1: Entry Point</h4>
                <p className="text-gray-600 mb-4">
                  User opens ITO and sees three clear entry points. For this scenario, they select 
                  <strong> "I'm thinking about making a move"</strong>.
                </p>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <p className="font-medium">UI Elements:</p>
                  <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                    <li>Clean, minimal home screen</li>
                    <li>Three card-based entry options</li>
                    <li>Subtle supportive tone ("Not sure if it's okay? Pause and check.")</li>
                  </ul>
                </div>
              </div>
              <ScreenshotFrame 
                src={SCREENSHOTS.scenario1.home}
                alt="ITO Home Screen"
                caption="Home screen with three flow options"
                stepLabel="Step 1: Home"
              />
            </div>
          </Card>

          {/* Step 2: Intro */}
          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Step 2: Flow Introduction</h4>
                <p className="text-gray-600 mb-4">
                  A brief orientation screen sets expectations: answer a few questions, see what comes up. 
                  Emphasizes <strong>"Nothing is saved"</strong> for privacy.
                </p>
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-green-800 text-sm">
                    <strong>Privacy-first:</strong> Users are reassured their responses aren't stored.
                  </p>
                </div>
              </div>
              <ScreenshotFrame 
                src={SCREENSHOTS.scenario1.intro}
                alt="Before flow introduction"
                caption="Flow intro with privacy reassurance"
                stepLabel="Step 2: Intro"
              />
            </div>
          </Card>

          {/* Step 3: Situation */}
          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Step 3: Situation Assessment</h4>
                <p className="text-gray-600 mb-2">
                  <strong>Question:</strong> "What's the situation?"
                </p>
                <div className="bg-green-50 p-3 rounded border border-green-200 mb-3">
                  <p className="font-medium text-green-800">✓ Selected: "We're together in person"</p>
                </div>
                <p className="text-gray-600 text-sm">
                  Options include texting, in-person, party setting, and uncertainty options.
                  The step counter (1/5) shows progress.
                </p>
              </div>
              <ScreenshotFrame 
                src={SCREENSHOTS.scenario1.situation}
                alt="Situation question"
                caption="Q1: What's the situation?"
                stepLabel="Step 3: Situation"
              />
            </div>
          </Card>

          {/* Step 4: Consent */}
          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Step 4: Observed Consent Signals</h4>
                <p className="text-gray-600 mb-2">
                  <strong>Question:</strong> "What are they doing or saying?"
                </p>
                <div className="bg-green-50 p-3 rounded border border-green-200 mb-3">
                  <p className="font-medium text-green-800">✓ Selected: "They said yes or told me they want to"</p>
                </div>
                <p className="text-gray-600 text-sm">
                  This is the most positive consent signal—explicit verbal affirmation.
                  Other options range from "going along" to "said no."
                </p>
              </div>
              <ScreenshotFrame 
                src={SCREENSHOTS.scenario1.consent}
                alt="Consent signals question"
                caption="Q2: What are they doing or saying?"
                stepLabel="Step 4: Consent"
              />
            </div>
          </Card>

          {/* Step 5: Context */}
          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Step 5: Context Factors</h4>
                <p className="text-gray-600 mb-2">
                  <strong>Question:</strong> "Is anything else going on?" (Multi-select)
                </p>
                <div className="bg-green-50 p-3 rounded border border-green-200 mb-3">
                  <p className="font-medium text-green-800">✓ Selected: "None of these"</p>
                </div>
                <p className="text-gray-600 text-sm">
                  This step surfaces potential red flags: alcohol, power imbalances, pressure.
                  "None of these" is the cleanest signal.
                </p>
              </div>
              <ScreenshotFrame 
                src={SCREENSHOTS.scenario1.context}
                alt="Context factors question"
                caption="Q3: Is anything else going on?"
                stepLabel="Step 5: Context"
              />
            </div>
          </Card>

          {/* Step 6: Momentum */}
          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Step 6: Momentum Check</h4>
                <p className="text-gray-600 mb-2">
                  <strong>Question:</strong> "Where is this going?"
                </p>
                <div className="bg-green-50 p-3 rounded border border-green-200 mb-3">
                  <p className="font-medium text-green-800">✓ Selected: "Just flirting or talking"</p>
                </div>
                <p className="text-gray-600 text-sm">
                  Helps calibrate the assessment—things are still early stage, 
                  which means there's plenty of room to keep checking in.
                </p>
              </div>
              <ScreenshotFrame 
                src={SCREENSHOTS.scenario1.momentum}
                alt="Momentum question"
                caption="Q4: Where is this going?"
                stepLabel="Step 6: Momentum"
              />
            </div>
          </Card>

          {/* Step 7: Free text */}
          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Step 7: Optional Context</h4>
                <p className="text-gray-600 mb-2">
                  <strong>Prompt:</strong> "Anything else?" (Optional free-text)
                </p>
                <div className="bg-gray-100 p-3 rounded border border-gray-300 italic mb-3">
                  "We've been hanging out for a few weeks and they seem really into it. 
                  They keep moving closer and smiling."
                </div>
                <p className="text-gray-600 text-sm">
                  Users can skip this, but adding context helps the AI give more 
                  personalized feedback. Character limit visible (0/800).
                </p>
              </div>
              <ScreenshotFrame 
                src={SCREENSHOTS.scenario1.freetext}
                alt="Free text input"
                caption="Optional context input"
                stepLabel="Step 7: Free Text"
              />
            </div>
          </Card>

          {/* Step 8: Result */}
          <Card className="p-6 border-l-4 border-green-500 bg-green-50">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Step 8: Assessment Result</h4>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                    🟢 No clear red flags right now
                  </span>
                </div>
                <p className="text-gray-700 mb-4">
                  The AI acknowledges the positive signals while reminding the user that consent is ongoing.
                </p>
                <div className="bg-white p-4 rounded border">
                  <p className="font-medium mb-2">Sample AI Response:</p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• They're showing interest through words and body language</li>
                    <li>• You've been building connection over time</li>
                    <li>• <strong>Keep in mind:</strong> Consent can change at any time</li>
                  </ul>
                </div>
              </div>
              <ScreenshotFrame 
                src={SCREENSHOTS.scenario1.result}
                alt="Green signal result"
                caption="Assessment: No red flags"
                stepLabel="Step 8: Result"
              />
            </div>
          </Card>

          {/* Follow-up section */}
          <Card className="p-6 border-l-4 border-purple-500">
            <h4 className="font-semibold text-lg mb-2">Step 9: Follow-up Conversation (Optional)</h4>
            <p className="text-gray-600 mb-4">
              After the assessment, users can ask follow-up questions or get more context.
            </p>
            <div className="space-y-3 max-w-lg">
              <div className="flex justify-end">
                <div className="bg-[#5a9a8a] text-white p-3 rounded-lg max-w-xs text-sm">
                  "What if they change their mind later?"
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-200 p-3 rounded-lg max-w-md text-sm">
                  "Great question. Consent isn't a one-time thing—it's ongoing. If at any point they seem hesitant, 
                  pull back, or say stop, that's your cue to pause and check in."
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-[#5a9a8a] text-white p-3 rounded-lg max-w-xs text-sm">
                  "How do I check in without making it awkward?"
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-200 p-3 rounded-lg max-w-md text-sm">
                  "It doesn't have to be formal. Things like 'Is this okay?' or 'Do you want to keep going?' 
                  can feel natural in the moment. Most people appreciate being asked."
                </div>
              </div>
            </div>
          </Card>
        </div>
      </ScenarioSection>

      {/* Scenario 2: Yellow Signal - Placeholder */}
      <ScenarioSection number={2} title="Yellow Signal (Pause & Check)" signalColor="yellow">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
          <p className="text-yellow-800 font-medium text-lg">To be captured</p>
          <p className="text-yellow-600 mt-2">
            Mixed signals scenario with alcohol involvement
          </p>
          <div className="mt-4 text-sm text-yellow-700">
            <p><strong>Planned selections:</strong></p>
            <ul className="mt-2 space-y-1">
              <li>• "We're at a party or with other people"</li>
              <li>• "They're starting things or going along with it"</li>
              <li>• "Alcohol or drugs are involved"</li>
              <li>• "Heading toward something physical"</li>
            </ul>
          </div>
        </div>
      </ScenarioSection>

      {/* Scenario 3: Red Signal - Placeholder */}
      <ScenarioSection number={3} title="Red Signal (Wait)" signalColor="red">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
          <p className="text-red-800 font-medium text-lg">To be captured</p>
          <p className="text-red-600 mt-2">
            Clear warning signs scenario requiring immediate pause
          </p>
          <div className="mt-4 text-sm text-red-700">
            <p><strong>Planned selections:</strong></p>
            <ul className="mt-2 space-y-1">
              <li>• "We're together in person"</li>
              <li>• "They're quiet or not really responding"</li>
              <li>• "Someone feels pressured" + "Alcohol or drugs are involved"</li>
              <li>• "Heading toward something physical"</li>
            </ul>
          </div>
        </div>
      </ScenarioSection>

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
