import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GuidedModeProps {
  onSubmit: (text: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const IDENTITY_OPTIONS = [
  { value: "teen-boy", label: "A teenage guy" },
  { value: "teen-girl", label: "A teenage girl" },
  { value: "teen-nonbinary", label: "A teenager (nonbinary)" },
  { value: "young-adult", label: "A young adult" },
  { value: "other", label: "Something else" },
  { value: "skip", label: "Rather not say" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "partner", label: "My partner / boyfriend / girlfriend" },
  { value: "crush", label: "Someone I like" },
  { value: "friend", label: "A friend" },
  { value: "stranger", label: "Someone I just met" },
  { value: "ex", label: "My ex" },
  { value: "authority", label: "Someone older or in charge" },
  { value: "other", label: "Something else" },
  { value: "skip", label: "Rather not say" },
];

const GuidedMode = ({ onSubmit, onBack, isLoading }: GuidedModeProps) => {
  const [identity, setIdentity] = useState("");
  const [relationship, setRelationship] = useState("");
  const [whatHappened, setWhatHappened] = useState("");
  const [thinkingAbout, setThinkingAbout] = useState("");
  const [worried, setWorried] = useState("");
  const maxLength = 2000;

  const handleSubmit = () => {
    // Serialize guided inputs into narrative text
    const parts: string[] = [];

    if (identity && identity !== "skip") {
      const label = IDENTITY_OPTIONS.find(o => o.value === identity)?.label;
      if (label) parts.push(`I am ${label.toLowerCase()}.`);
    }

    if (relationship && relationship !== "skip") {
      const label = RELATIONSHIP_OPTIONS.find(o => o.value === relationship)?.label;
      if (label) parts.push(`The other person is ${label.toLowerCase()}.`);
    }

    if (whatHappened.trim()) {
      parts.push(`What happened: ${whatHappened.trim()}`);
    }

    if (thinkingAbout.trim()) {
      parts.push(`What I'm thinking about doing: ${thinkingAbout.trim()}`);
    }

    if (worried.trim()) {
      parts.push(`What I'm worried about: ${worried.trim()}`);
    }

    const narrative = parts.join("\n\n");
    if (narrative.trim()) {
      onSubmit(narrative);
    }
  };

  const hasContent = whatHappened.trim() || thinkingAbout.trim() || worried.trim();

  return (
    <div className="space-y-4 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to free write
      </button>

      <Card className="p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">
            Let's walk through it
          </h2>
          <p className="text-muted-foreground text-center text-sm">
            Fill in whatever feels right. Everything is optional and you can skip anything.
          </p>
        </div>

        {/* Identity dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">I am a...</label>
          <Select value={identity} onValueChange={setIdentity}>
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              {IDENTITY_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Relationship dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">The other person is...</label>
          <Select value={relationship} onValueChange={setRelationship}>
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              {RELATIONSHIP_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* What happened */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">What happened or what's the situation?</label>
          <Textarea
            value={whatHappened}
            onChange={(e) => setWhatHappened(e.target.value.slice(0, maxLength))}
            placeholder="Describe what's going on..."
            className="min-h-[100px] resize-none"
            disabled={isLoading}
          />
        </div>

        {/* What I'm thinking about doing */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">What are you thinking about doing?</label>
          <Textarea
            value={thinkingAbout}
            onChange={(e) => setThinkingAbout(e.target.value.slice(0, maxLength))}
            placeholder="Optional — what's your next move?"
            className="min-h-[80px] resize-none"
            disabled={isLoading}
          />
        </div>

        {/* What I'm worried about */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">What are you worried about?</label>
          <Textarea
            value={worried}
            onChange={(e) => setWorried(e.target.value.slice(0, maxLength))}
            placeholder="Optional — what's making you unsure?"
            className="min-h-[80px] resize-none"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!hasContent || isLoading}
            size="lg"
            className="px-8"
          >
            Continue <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default GuidedMode;
