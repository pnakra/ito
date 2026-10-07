import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import type { PracticeMsg, PracticeScenario, PracticeTurn } from "./types";

export interface ThreadItem {
  role: "user" | "assistant";
  text: string;
  turn?: PracticeTurn;
}

interface Props {
  scenario: PracticeScenario;
  thread: ThreadItem[];
  loading: boolean;
  error: boolean;
  ended: boolean;
  closed: boolean;
  onSend: (message: string) => Promise<boolean>;
  onEnd: () => void;
  onDebrief: () => void;
}

export const toHistory = (thread: ThreadItem[]): PracticeMsg[] =>
  thread.map((t) => ({ role: t.role, content: t.text }));

const PracticeScene = ({ scenario, thread, loading, error, ended, closed, onSend, onEnd, onDebrief }: Props) => {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const sentCount = thread.filter((t) => t.role === "user").length;
  const locked = ended || closed;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [thread, loading]);

  const submit = async () => {
    const msg = input.trim();
    if (!msg || loading || locked) return;
    const ok = await onSend(msg);
    if (ok) setInput("");
  };

  const bubble = (name: string, text: string, key: string) => (
    <div key={key} className="flex flex-col items-start">
      <span className="text-[12px] text-muted-foreground mb-1 ml-1">{name}</span>
      <div className="max-w-[85%] p-4 rounded-lg text-body bg-card shadow-card">
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-card shadow-card rounded-lg p-5 space-y-2">
        <p className="text-[13px] text-muted-foreground">The scene</p>
        <p className="text-body whitespace-pre-wrap">{scenario.setup}</p>
      </div>

      <div className="space-y-3">
        {bubble(scenario.name, scenario.opening, "opening")}
        {thread.map((t, i) => {
          if (t.role === "user") {
            return (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] p-4 rounded-lg text-body bg-primary text-primary-foreground">
                  <p className="whitespace-pre-wrap">{t.text}</p>
                </div>
              </div>
            );
          }
          const turn = t.turn;
          if (turn?.kind === "note") {
            return (
              <div key={i} className="space-y-3">
                <div className="w-full border border-border rounded-lg p-4 text-body text-muted-foreground">
                  <p className="whitespace-pre-wrap">{t.text}</p>
                </div>
                {turn.handoff === "real" && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/check-in">Take it to ito</Link>
                  </Button>
                )}
                {turn.handoff === "distress" && (
                  <div className="flex flex-wrap gap-4 text-[14px]">
                    <a href="tel:988" className="underline text-foreground">Call or text 988</a>
                    <a href="sms:741741" className="underline text-foreground">Text HOME to 741741</a>
                  </div>
                )}
              </div>
            );
          }
          return bubble(turn?.name || scenario.name, t.text, String(i));
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card shadow-card p-4 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {ended && !closed && (
        <Button size="lg" className="w-full" onClick={onDebrief}>See your debrief</Button>
      )}
      {closed && (
        <Button asChild size="lg" className="w-full">
          <Link to="/check-in">Go to ito</Link>
        </Button>
      )}

      {!locked && (
        <div className="space-y-3">
          {sentCount === 0 && (
            <p className="text-[13px] text-muted-foreground">Type what you'd really say. The scene is short.</p>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 500))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type what you'd say or do..."
            className="min-h-[80px] resize-none text-body"
            disabled={loading}
          />
          {error && <p className="text-[13px] text-destructive">That didn't send. Try again.</p>}
          <div className="flex items-center justify-between">
            <span className="text-caption text-muted-foreground">{input.length} / 500</span>
            <div className="flex items-center gap-2">
              {sentCount > 0 && (
                <Button variant="outline" size="sm" onClick={onEnd} disabled={loading}>End scene</Button>
              )}
              <Button size="sm" onClick={submit} disabled={!input.trim() || loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><Send className="w-4 h-4 mr-1.5" />Send</>)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeScene;
