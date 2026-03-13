import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const Header = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-background sticky top-0 z-50">
      <nav className="container mx-auto px-5 py-3 flex items-center justify-between">
        <Link 
          to="/" 
          className="hover:opacity-80 transition-opacity"
        >
          <span className="text-[20px] font-medium tracking-[-0.5px] text-foreground">ito</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link
            to="/about"
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
