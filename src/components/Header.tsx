import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="border-b border-border bg-card">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          vibecheck
        </Link>
        <div className="flex gap-6 lowercase">
          <Link 
            to="/about" 
            className="text-foreground hover:text-foreground/80 transition-colors"
          >
            about
          </Link>
          <Link 
            to="/resources" 
            className="text-foreground hover:text-foreground/80 transition-colors"
          >
            resources
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
