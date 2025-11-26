import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="border-b border-border bg-card">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          vibecheck
        </Link>
        <div className="flex gap-6">
          <Link 
            to="/avoid-line" 
            className="text-foreground hover:text-foreground/80 transition-colors"
          >
            Check a situation
          </Link>
          <Link 
            to="/crossed-line" 
            className="text-foreground hover:text-foreground/80 transition-colors"
          >
            Reflect on what happened
          </Link>
          <Link 
            to="/about" 
            className="text-foreground hover:text-foreground/80 transition-colors"
          >
            About
          </Link>
          <Link 
            to="/resources" 
            className="text-foreground hover:text-foreground/80 transition-colors"
          >
            Resources
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
