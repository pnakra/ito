import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 mt-auto">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground/60">
          © 2026 Override Labs
        </p>
        <div className="flex items-center gap-4">
          <Link to="/blog" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            Resources
          </Link>
          <Link to="/privacy" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;