import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-background sticky top-0 z-50">
      <nav className="container mx-auto px-5 py-3 flex items-center justify-between">
        <Link 
          to="/" 
          className="hover:opacity-80 transition-opacity"
        >
          <span className="font-serif text-[22px] font-bold tracking-[-0.5px] text-foreground">ito</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link
            to="/demo"
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Demo
          </Link>
          <Link
            to="/about"
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
