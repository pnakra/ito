import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import BackButton from "@/components/BackButton";
import { GUIDES } from "@/data/witness";
import NotFound from "@/pages/NotFound";

const WitnessGuide = () => {
  const { slug } = useParams();
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) return <NotFound />;
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title={`${guide.title} | ito for witnesses`} description={guide.short} path={`/witness/guide/${guide.slug}`} noindex />
      <Header />
      <main className="flex-1 container mx-auto px-5 py-8 sm:py-12 pb-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <BackButton to="/witness" />
          <div className="space-y-3">
            <h1 className="text-h1 text-foreground">{guide.title}</h1>
            <p className="text-body text-foreground/90">{guide.intro}</p>
          </div>
          {guide.sections.map((s) => (
            <section key={s.heading} className="space-y-3">
              <h2 className="font-serif text-[22px] text-foreground">{s.heading}</h2>
              <ul className="space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="border-l-2 border-border pl-4 text-foreground/90">{p}</li>
                ))}
              </ul>
            </section>
          ))}
          <div className="rounded-lg border border-border p-5 space-y-2">
            <div className="font-medium text-foreground">Want a read on your situation?</div>
            <Link to="/check-in?role=other" className="text-sm underline text-foreground">Tell ito what you saw</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WitnessGuide;
