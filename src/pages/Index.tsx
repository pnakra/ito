import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { ArrowRight, ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { logVisit } from "@/lib/logVisit";
import SEO from "@/components/SEO";
import WelcomePhone from "@/components/WelcomePhone";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import flyerAsset from "@/assets/welcome-partner-flyer.png.asset.json";
import itoLogo from "@/assets/ito-logo.png";

const FEATURES = [
  { screen: "messages" as const, number: "01", title: "You don’t need the right words.", text: "Write what’s happening in your own words. Sex, dating, and the moments you’re still thinking about. Start wherever you are." },
  { screen: "pause" as const, number: "02", title: "An honest read. Not permission.", text: "A way to pause and notice what you might be missing, before something goes wrong. Only the other person can tell you what they want." },
  { screen: "bystander" as const, number: "03", title: "For the moments you’re not part of, too.", text: "Something you saw. Something you heard. Something that felt off. Think through what to do next without having to be sure first.", link: "/bystanderbeta", label: "Try the bystander beta" },
  { screen: "privacy" as const, number: "04", title: "Anonymous. Not linked to you.", text: "No login. No account. No name or email. What you type is anonymous and may be reviewed to make ito better.", link: "/privacy", label: "Read the privacy policy" },
];
const FAQS = [
  { question: "What is ito?", answer: "ito is for the moment when you’re not sure if something was okay, or if something you’re about to do is okay. You write what’s going on and get an honest read on things you might be missing." },
  { question: "Can ito tell you if something is okay to do?", answer: "It can help you think through a situation, but it won’t give you permission. This is a reflection tool, not a ruling. Only the other person can give consent." },
  { question: "Is this actually anonymous?", answer: "There’s no login, account, name, or email required. What you type isn’t linked to your identity. Anonymous conversations may be reviewed to improve ito. The privacy policy explains what is collected." },
  { question: "What if something already happened?", answer: "You can think through that too. Write what happened in your own words. ito can help you notice the impact of what happened and think about what to do differently." },
  { question: "What if you’re worried about someone else?", answer: "The bystander beta is for something you saw or heard that felt off. It’s a private place to think through your next step. ito never contacts anyone for you." },
  { question: "Is ito a crisis line?", answer: "No. ito is an AI reflection tool, not a crisis line or a replacement for professional help. In an emergency, call 911. For crisis support in the US, call or text 988. RAINN is available at 800-656-4673." },
];

export default function Index() {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<(typeof FEATURES)[number]["screen"]>("messages");
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => { logVisit(); }, []);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const feature = FEATURES[Number((entry.target as HTMLElement).dataset.index)];
        if (feature) setActiveScreen(feature.screen);
      });
    }, { rootMargin: "-30% 0px -30% 0px", threshold: 0 });
    featureRefs.current.forEach((node) => { if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, []);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="welcome-page">
      <SEO title="is this ok? — An anonymous perspective on sex and dating" description="Get an honest perspective on sex, dating, and everything in between. Anonymous. No account. A way to pause and think through what’s happening." path="/welcome" />
      <a className="welcome-skip" href="#welcome-main">Skip to content</a>
      <header className="welcome-header">
        <nav className="welcome-nav" aria-label="Welcome navigation">
          <div className="welcome-nav-left"><Button asChild variant="link" size="sm"><a href="#how-it-works">How it works</a></Button><Button asChild variant="link" size="sm"><Link to="/about">About</Link></Button></div>
          <Link to="/welcome" className="welcome-wordmark" aria-label="ito welcome">ito</Link>
          <div className="welcome-nav-right"><Button asChild variant="link" size="sm" className="welcome-desktop-link"><Link to="/partner-kit">Partners</Link></Button><Button asChild variant="link" size="sm" className="welcome-desktop-link"><Link to="/blog">Resources</Link></Button><Button asChild size="sm" className="welcome-small-cta"><Link to="/check-in">Try ito <ArrowUpRight /></Link></Button><Button size="icon" variant="ghost" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun /> : <Moon />}</Button><Button variant="ghost" size="icon" className="welcome-menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button><Button variant="ghost" size="sm" className="welcome-exit" onClick={() => window.location.replace("https://weather.com")}>Exit</Button></div>
        </nav>
        {menuOpen && <nav className="welcome-mobile-menu" aria-label="Mobile welcome navigation"><Button asChild variant="link"><a href="#how-it-works" onClick={closeMenu}>How it works</a></Button><Button asChild variant="link"><Link to="/about" onClick={closeMenu}>About</Link></Button><Button asChild variant="link"><Link to="/partner-kit" onClick={closeMenu}>Partners</Link></Button><Button asChild variant="link"><Link to="/blog" onClick={closeMenu}>Resources</Link></Button></nav>}
      </header>
      <main id="welcome-main" tabIndex={-1}>
        <section className="welcome-hero" aria-labelledby="welcome-title">
          <p className="welcome-eyebrow">A moment to pause.</p>
          <h1 id="welcome-title">is this ok?<svg viewBox="0 0 330 18" aria-hidden="true"><path d="M4 10 C70 3 105 15 160 9 S265 4 324 10 M35 15 Q175 8 300 14" /></svg></h1>
          <p className="welcome-intro">Get an honest perspective on sex, dating,<br className="hidden sm:block" /> and everything in between.</p>
          <p className="welcome-anonymous">Anonymous. No sign-in. Not linked to you.</p>
          <Button asChild className="welcome-primary-cta"><Link to="/check-in">Get an honest read <ArrowRight /></Link></Button>
          <div className="welcome-hero-phone"><WelcomePhone /></div>
          <p className="welcome-hero-footnote">For the moment you think, “Wait… was that weird?”</p>
        </section>

        <section id="how-it-works" className="welcome-story" aria-label="How ito works">
          <div className="welcome-story-inner">
            <div className="welcome-story-copy">{FEATURES.map((feature, index) => <div className="welcome-feature" key={feature.screen} data-index={index} ref={(node) => { featureRefs.current[index] = node; }}><span className="welcome-eyebrow">{feature.number} / {feature.screen === "privacy" ? "Your privacy" : feature.screen === "bystander" ? "Looking out for someone" : "How it works"}</span><h2>{feature.title}</h2><p>{feature.text}</p>{feature.link && <Button asChild variant="link" className="welcome-text-link"><Link to={feature.link}>{feature.label}<ArrowUpRight /></Link></Button>}<div className="welcome-mobile-phone"><WelcomePhone screen={feature.screen} /></div></div>)}</div>
            <div className="welcome-sticky-phone"><WelcomePhone screen={activeScreen} /></div>
          </div>
        </section>

        <section className="welcome-quote" aria-label="What a beta user said">
          <blockquote>
            <hr className="welcome-quote-rule" />
            <p>“It highlighted concerns I had in the moment so articulately I wanted to cry and laugh at the same time.”</p>
            <p className="welcome-quote-support">“It gave very reasonable responses that still allowed for individual decision, but still treated red flags with unwavering seriousness.”</p>
            <cite>From ito beta feedback</cite>
          </blockquote>
        </section>

        <section className="welcome-explore" aria-label="Explore ito">
          <Link to="/about" className="welcome-explore-item"><div className="welcome-explore-visual welcome-about-visual"><img src={itoLogo} alt="ito" loading="lazy" /><span>is this ok?</span></div><div className="welcome-explore-label"><h2>Why ito exists</h2><ArrowUpRight aria-hidden="true" /></div><p>A way to pause before something goes wrong.</p></Link>
          <Link to="/partner-kit" className="welcome-explore-item"><div className="welcome-explore-visual welcome-partner-visual"><img src={flyerAsset.url} alt="The ito bystander flyer available in the partner kit" loading="lazy" /></div><div className="welcome-explore-label"><h2>Share ito</h2><ArrowUpRight aria-hidden="true" /></div><p>For campuses, communities, and the people looking out for them.</p></Link>
        </section>

        <section id="faq" className="welcome-faq"><div className="welcome-faq-heading"><h2>FAQ</h2><p>More questions?<br /><a href="mailto:priya@overridelabsprevention.org">Send an email <ArrowUpRight size={14} className="inline" /></a></p></div><Accordion type="single" collapsible className="welcome-faq-items">{FAQS.map((faq, index) => <AccordionItem key={faq.question} value={`faq-${index}`}><AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger><AccordionContent className="text-muted-foreground">{faq.answer}{index === 2 && <> <Link to="/privacy" className="underline underline-offset-4">Read the privacy policy.</Link></>}</AccordionContent></AccordionItem>)}</Accordion></section>

        <section className="welcome-close"><span className="welcome-eyebrow">You can start here.</span><h2>You don’t have to<br />figure it out alone.</h2><Button asChild className="welcome-primary-cta"><Link to="/check-in">Get an honest read <ArrowRight /></Link></Button><p>This is a reflection tool, not a ruling.<br />Only the other person can give consent.</p></section>
        <div className="welcome-credit">Built by Override Labs, a nonprofit.</div>
      </main>
    </div>
  );
}
