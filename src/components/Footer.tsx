import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-12 sm:mt-20">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <span className="text-border hidden sm:inline">•</span>
          <Link to="/resources" className="hover:text-foreground transition-colors">
            Resources
          </Link>
          <span className="text-border hidden sm:inline">•</span>
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy
          </a>
          <span className="text-border hidden sm:inline">•</span>
          <a href="#" className="hover:text-foreground transition-colors">
            Crisis Support
          </a>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          100% anonymous. We don't store identifying info.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
