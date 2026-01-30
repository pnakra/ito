import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-background mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/resources" className="hover:text-foreground transition-colors">
            Resources
          </Link>
          <a 
            href="https://rainn.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Crisis Support
          </a>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          This isn't permission. It's a pause.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
