import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/about", label: "about" },
    { to: "/resources", label: "resources" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border/40 bg-background/90 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link 
          to="/" 
          className="hover:opacity-80 transition-opacity"
        >
          <span className="text-base font-semibold text-foreground tracking-tight">ito</span>
        </Link>
        
        <div className="hidden md:flex gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive(link.to)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <div className="container mx-auto px-4 py-1.5 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`py-2.5 px-3 rounded-md text-sm transition-colors ${
                  isActive(link.to)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
