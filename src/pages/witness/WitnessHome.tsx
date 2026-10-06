import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { GUIDES } from "@/data/witness";

const MAIN = [
  { to: "/check-in?role=other", title: "Tell ito what you saw", body: "Describe it in your own words and get an honest read on what to do." },
  { to: "/witness/practice", title: "Practice", body: "Short rounds where you practice stepping in, before it's real." },
  { to: "/witness/report", title: "What a report looks like", body: "Practice only. See how your story would reach someone who can act, without your name." },
  { to: "/witness/tip", title: "Write an anonymous tip", body: "Turn what you saw into a short summary you can paste into a police tip form." },
];

const WitnessHome = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <SEO
      title="ito for witnesses — saw something that didn't sit right?"
      description="Anonymous help for people who saw or heard about something at a party. Anonymous, nothing saved that identifies you."
      path="/witness"
      noindex
    />
    <Header />
    <main className="flex-1 container mx-auto px-5 py-8 sm:py-12 pb-12">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="space-y-3">
          <h1 className="font-serif italic text-[40px] leading-tight text-foreground">saw something?</h1>
          <p className="text-[18px] font-semibold text-foreground">A message in the chat. Someone being walked upstairs. A story at breakfast that didn't sit right.</p>
          <p className="text-muted-foreground">Anonymous. Nothing saved that identifies you.</p>
        </div>

        <div className="space-y-3">
          {MAIN.map((m) => (
            <Link key={m.to} to={m.to} className="block rounded-lg border border-border bg-card p-5 hover:border-foreground/40 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-foreground">{m.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{m.body}</div>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-[22px] text-foreground">Quick guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {GUIDES.map((g) => (
              <Link key={g.slug} to={`/witness/guide/${g.slug}`} className="rounded-lg border border-border p-4 hover:border-foreground/40 transition-colors">
                <div className="font-medium text-foreground">{g.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{g.short}</div>
              </Link>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground border-t border-border pt-6">
          If someone is in danger right now, call <a className="underline" href="tel:911">911</a>. For support, call or text <a className="underline" href="tel:988">988</a> or RAINN at <a className="underline" href="tel:18006564673">1-800-656-4673</a>.
        </p>
      </div>
    </main>
  </div>
);

export default WitnessHome;
