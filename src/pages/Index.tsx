import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { ArrowLeft, ArrowRight, ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { logVisit } from "@/lib/logVisit";
import SEO from "@/components/SEO";
import WelcomePhone, { type WelcomeScreen } from "@/components/WelcomePhone";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FEATURES: { screen: WelcomeScreen; number: string; eyebrow: string; title: string; text: string; link?: string; label?: string }[] = [
  { screen: "messages", number: "01", eyebrow: "How it works", title: "You don’t need the right words.", text: "Write what’s happening in your own words. Sex, dating, and the moments you’re still thinking about." },
  { screen: "pause", number: "02", eyebrow: "How it works", title: "An honest read. Not permission.", text: "A way to pause and notice what you might be missing. Only the other person can tell you what they want." },
  { screen: "bystander", number: "03", eyebrow: "Looking out for someone", title: "For the moments you’re not part of, too.", text: "Something you saw or heard that felt off. Think through what to do next without having to be sure first.", link: "/bystanderbeta", label: "Try the bystander beta" },
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
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => { logVisit(); }, []);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index)); });
    }, { root: trackRef.current, threshold: 0.6 });
    slideRefs.current.forEach((node) => { if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, []);
  const goTo = (index: number) => {
    const i = Math.max(0, Math.min(FEATURES.length - 1, index));
    const track = trackRef.current; const slide = slideRefs.current[i];
    if (track && slide) track.scrollTo({ left: slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2, behavior: "smooth" });
  };
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
          <p className="welcome-hero-footnote">For the moment you think, “Wait… was that weird?”</p>
        </section>

        <section id="how-it-works" className="welcome-story" aria-label="How ito works">
          <div className="welcome-carousel" ref={trackRef}>
            {FEATURES.map((f, i) => <div key={f.screen} className={`welcome-slide${i === active ? " is-active" : ""}`} data-index={i} ref={(n) => { slideRefs.current[i] = n; }} onClick={() => i !== active && goTo(i)}>
              <WelcomePhone screen={f.screen} active={i === active} />
              <div className="welcome-slide-copy"><span className="welcome-eyebrow">{f.number} / {f.eyebrow}</span><h2>{f.title}</h2><p>{f.text}</p>{f.link && <Button asChild variant="link" className="welcome-text-link"><Link to={f.link}>{f.label}<ArrowUpRight /></Link></Button>}</div>
            </div>)}
          </div>
          <div className="welcome-carousel-controls">
            <Button variant="outline" size="icon" aria-label="Previous" disabled={active === 0} onClick={() => goTo(active - 1)}><ArrowLeft /></Button>
            <div className="welcome-dots">{FEATURES.map((f, i) => <button key={f.screen} aria-label={`Show ${f.title}`} aria-current={i === active} className={i === active ? "is-active" : ""} onClick={() => goTo(i)} />)}</div>
            <Button variant="outline" size="icon" aria-label="Next" disabled={active === FEATURES.length - 1} onClick={() => goTo(active + 1)}><ArrowRight /></Button>
          </div>
        </section>

        <section className="welcome-quote" aria-label="What a beta user said">
          <blockquote>
            <hr className="welcome-quote-rule" />
            <p>“It highlighted concerns I had in the moment so articulately I wanted to cry and laugh at the same time.”</p>
            <cite>ito user, November 2026</cite>
          </blockquote>
        </section>

        <section className="welcome-explore" aria-label="Explore ito">
          <Link to="/about" className="welcome-explore-item"><div className="welcome-explore-label"><h2>Why ito exists</h2><ArrowUpRight aria-hidden="true" /></div><p>A way to pause before something goes wrong.</p></Link>
          <Link to="/partner-kit" className="welcome-explore-item"><div className="welcome-explore-label"><h2>Share ito</h2><ArrowUpRight aria-hidden="true" /></div><p>For campuses, communities, and the people looking out for them.</p></Link>
        </section>

        <section id="faq" className="welcome-faq"><div className="welcome-faq-heading"><h2>FAQ</h2><p>More questions?<br /><a href="mailto:priya@overridelabsprevention.org">Send an email <ArrowUpRight size={14} className="inline" /></a></p></div><Accordion type="single" collapsible className="welcome-faq-items">{FAQS.map((faq, index) => <AccordionItem key={faq.question} value={`faq-${index}`}><AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger><AccordionContent className="text-muted-foreground">{faq.answer}{index === 2 && <> <Link to="/privacy" className="underline underline-offset-4">Read the privacy policy.</Link></>}</AccordionContent></AccordionItem>)}</Accordion></section>

        <section className="welcome-close"><span className="welcome-eyebrow">You can start here.</span><h2>You don’t have to<br />figure it out alone.</h2><Button asChild className="welcome-primary-cta"><Link to="/check-in">Get an honest read <ArrowRight /></Link></Button><p>This is a reflection tool, not a ruling.<br />Only the other person can give consent.</p></section>
        <div className="welcome-credit">Built by Override Labs, a nonprofit.</div>
      </main>
    </div>
  );
}
