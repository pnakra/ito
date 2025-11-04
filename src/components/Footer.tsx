import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground lowercase">
          <Link to="/about" className="hover:text-foreground transition-colors">
            about
          </Link>
          <span className="text-border">•</span>
          <Link to="/resources" className="hover:text-foreground transition-colors">
            resources
          </Link>
          <span className="text-border">•</span>
          <a href="#" className="hover:text-foreground transition-colors">
            privacy
          </a>
          <span className="text-border">•</span>
          <a href="#" className="hover:text-foreground transition-colors">
            crisis support
          </a>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6 lowercase">
          100% anonymous. we don't store identifying info.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
