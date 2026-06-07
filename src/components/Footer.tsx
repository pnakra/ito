import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 mt-auto">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-y-2">
        <p className="text-xs text-muted-foreground">
          © 2026
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href="https://988lifeline.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            988
          </a>
          <a
            href="https://www.rainn.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            RAINN
          </a>
          <Link to="/blog" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Resources
          </Link>
          <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
