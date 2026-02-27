import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { CalendarDays } from "lucide-react";

interface ReleaseEntry {
  week: string;
  date: string;
  highlights: string[];
  details: {
    category: string;
    items: string[];
  }[];
}

const releases: ReleaseEntry[] = [
  {
    week: "Week of Feb 24",
    date: "2026-02-27",
    highlights: [
      "Unified all AI calls to Claude (Anthropic) across every edge function",
      "Fixed consecutive-message protocol bug in analyze-narrative",
    ],
    details: [
      {
        category: "AI & Backend",
        items: [
          "Migrated analyze-narrative, analyze-ito, and ito-followup from Lovable AI Gateway (Gemini) back to direct Anthropic API (Claude claude-sonnet-4-20250514)",
          "Fixed protocol error where consecutive 'user' role messages violated Anthropic's message alternation requirement",
          "Added retry loop (up to 2 retries) in analyze-ito for transient API failures",
          "Added JSON normalization layer in analyze-narrative to sanitize Claude output",
          "All 7 edge functions now consistently use Claude: analyze-ito, ito-followup, analyze-narrative, analyze-crossed-line, analyze-someone-crossed, crossed-line-followup, analyze-language",
        ],
      },
    ],
  },
  {
    week: "Week of Feb 17",
    date: "2026-02-21",
    highlights: [
      "Launched interactive demo with three guided scenarios",
      "New 'Two-Act' homepage with typewriter hero and entry point cards",
    ],
    details: [
      {
        category: "Demo & Onboarding",
        items: [
          "Built /demo page with three walkthrough scenarios (green, yellow, red) so stakeholders and new users can experience ito without submitting real data",
          "Added DemoStep and ScenarioSection components for structured demo playback",
          "Homepage redesigned with typewriter 'is this ok?' hero animation, HomepageDemo preview, and a 'Try it out' transition that reveals 'Write it out' and 'Answer a few questions' entry cards",
        ],
      },
      {
        category: "UX & Navigation",
        items: [
          "Introduced minimal header with 'ito' serif wordmark and quiet nav links (Demo, About) at 13px",
          "Added BackButton component for consistent in-app navigation",
          "Commented out orphaned /before and /after routes pending ethical review",
        ],
      },
    ],
  },
  {
    week: "Week of Feb 10",
    date: "2026-02-14",
    highlights: [
      "Shipped guided mode for users who aren't sure where to start",
      "Built follow-up chat with conversation history",
    ],
    details: [
      {
        category: "Core Flows",
        items: [
          "Added 'Answer a few questions' guided mode (/check-in?mode=guided) with step-by-step prompts using GuidedMode and AdaptiveFollowUp components",
          "Built NarrativeInput for free-write entry with narrative gap detection",
          "Implemented FollowUpChat with 12-message sliding window and conversation context preservation",
          "Created ConversationalChat component for continued dialogue after initial assessment",
        ],
      },
      {
        category: "AI & Safety",
        items: [
          "Implemented three-tier risk classification: deterministic regex (Layer 1) and AI analysis (Layer 2) with risk-stratified system prompts (green/yellow/red)",
          "Built StopMoment component with enforced pause UI and countdown for red-level assessments",
          "Added SessionPatternWarning for tracking escalating behavior across a session",
          "Created SignalFloor component to ensure baseline safety messaging on all outcomes",
        ],
      },
    ],
  },
  {
    week: "Week of Feb 3",
    date: "2026-02-07",
    highlights: [
      "Set up database and submission logging",
      "Established design system and component library",
    ],
    details: [
      {
        category: "Database & Infrastructure",
        items: [
          "Created submissions table for anonymous analytics logging (no PII stored)",
          "Implemented RLS policies: deny anon/authenticated access, service_role only",
          "Built submissionLogger utility and logVisit edge function for anonymous traffic tracking",
          "Set up rate limiting (5-15 req/min per IP) across all edge functions",
        ],
      },
      {
        category: "Design System",
        items: [
          "Established warm parchment color palette with deep teal (#2d6a5f) primary",
          "Configured Instrument Serif for headlines, Inter for body text",
          "Built semantic token system: signal-stop (red), signal-pause (yellow), signal-clear (green)",
          "Created custom card, button, and input components with rounded-[14px] and shadow-card styling",
        ],
      },
      {
        category: "Pages & Routing",
        items: [
          "Created About page with product philosophy and safety architecture overview",
          "Built Resources page with crisis hotlines (Crisis Text Line, RAINN, Teen Line, Love Is Respect) and educational links",
          "Set up React Router with catch-all 404 handling",
        ],
      },
    ],
  },
];

const categoryColor = (category: string) => {
  if (category.includes("AI") || category.includes("Backend")) return "bg-primary/10 text-primary";
  if (category.includes("UX") || category.includes("Design") || category.includes("Navigation")) return "bg-accent text-accent-foreground";
  if (category.includes("Safety")) return "bg-destructive/10 text-destructive";
  if (category.includes("Database") || category.includes("Infrastructure")) return "bg-warm text-warm-foreground";
  if (category.includes("Demo") || category.includes("Onboarding")) return "bg-secondary text-secondary-foreground";
  return "bg-muted text-muted-foreground";
};

const ReleaseNotes = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-5 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <BackButton to="/" />
          <h1 className="text-h1 mb-2">Release Notes</h1>
          <p className="text-muted-foreground text-body mb-10">
            Weekly updates on what changed in ito.
          </p>

          <div className="space-y-10">
            {releases.map((release, i) => (
              <article key={release.date} className="relative">
                {/* Timeline dot */}
                {i < releases.length - 1 && (
                  <div className="absolute left-[7px] top-[28px] bottom-[-40px] w-px bg-border hidden sm:block" />
                )}

                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex items-center justify-center w-4 h-4 mt-1.5 rounded-full bg-primary/20 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground sm:hidden" />
                      <span className="text-caption font-medium text-muted-foreground">
                        {release.week}
                      </span>
                    </div>

                    {/* Highlights */}
                    <ul className="mb-4 space-y-1">
                      {release.highlights.map((h, j) => (
                        <li key={j} className="text-body text-foreground font-medium">
                          {h}
                        </li>
                      ))}
                    </ul>

                    {/* Detail sections */}
                    <div className="space-y-3">
                      {release.details.map((section) => (
                        <div key={section.category} className="bg-card shadow-card rounded-[12px] p-4">
                          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2 ${categoryColor(section.category)}`}>
                            {section.category}
                          </span>
                          <ul className="space-y-1.5">
                            {section.items.map((item, k) => (
                              <li key={k} className="text-caption text-muted-foreground leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-1 before:h-1 before:rounded-full before:bg-muted-foreground/40">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReleaseNotes;
