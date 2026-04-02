import { useState, useEffect } from "react";
import { logVisit } from "@/lib/logVisit";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { ArrowRight } from "lucide-react";

const MESSAGES = [
  { text: "We were hooking up but then they pushed me away", align: "left" as const },
  { text: "Do they want me to kiss them when I see them next?", align: "right" as const },
  { text: "My friend had sex with them and thinks I can too", align: "left" as const },
];

const Index = () => {
  const [visibleMessages, setVisibleMessages] = useState(0);

  useEffect(() => {
    logVisit();
  }, []);

  // Stagger message appearance
  useEffect(() => {
    if (visibleMessages < MESSAGES.length) {
      const delay = visibleMessages === 0 ? 600 : 1200;
      const t = setTimeout(() => setVisibleMessages((v) => v + 1), delay);
      return () => clearTimeout(t);
    }
  }, [visibleMessages]);

  return (
    <div className="flex flex-col bg-background" style={{ height: "100dvh" }}>
      <Header />

      <main className="flex-1 flex flex-col justify-between px-5 pb-6 pt-4 container mx-auto max-w-md">
        {/* Top: headline + subtitle */}
        <div>
          <h1
            className="text-foreground"
            style={{
              fontFamily: '"Newsreader", "Georgia", serif',
              fontSize: "42px",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.5px",
              fontStyle: "italic",
            }}
          >
            is this ok?
          </h1>

          <p
            className="text-foreground mt-4 font-semibold"
            style={{ fontSize: "20px", lineHeight: 1.35 }}
          >
            Get an honest perspective on sex, dating, and everything in between.
          </p>

          <p className="text-muted-foreground mt-2 text-[15px]">
            <span className="font-bold text-foreground">100% anonymous.</span>
          </p>
        </div>

        {/* Middle: iMessage-style bubbles */}
        <div className="flex flex-col gap-3 my-6">
          {MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.align === "right" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-[15px] leading-snug transition-all duration-500 ${
                  i < visibleMessages
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                } ${
                  msg.align === "right"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: input hint + CTA */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-3 opacity-50">
            <span className="text-muted-foreground text-[15px]">
              ✏️ What's on your mind? Type here...
            </span>
          </div>

          <Link
            to="/check-in"
            className="flex items-center justify-center gap-2 bg-foreground text-background rounded-2xl px-6 py-4 text-[16px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Get an honest read <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
