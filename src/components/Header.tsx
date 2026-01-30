import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/before", label: "Before" },
    { to: "/after", label: "After" },
    { to: "/happened-to-me", label: "Happened to me" },
    { to: "/resources", label: "Resources" },
  ];

  const secondaryLinks = [
    { to: "/about", label: "About" },
    { to: "/install", label: "Add to Home Screen", icon: Smartphone },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
        >
          is this ok?
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(link.to)
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/30 bg-background">
          <div className="container mx-auto px-4 py-2 flex flex-col">
            {/* Primary nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`py-3 px-4 rounded-lg transition-colors ${
                  isActive(link.to)
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Divider */}
            <div className="border-t border-border/30 my-2" />
            
            {/* Secondary links */}
            {secondaryLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`py-3 px-4 rounded-lg transition-colors flex items-center gap-2 ${
                    isActive(link.to)
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
