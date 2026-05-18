import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Subtle floating theme toggle for mobile only.
 * Visible <md (max 768px) so mobile readers can switch themes while reading
 * a long response, without scrolling back up to the nav.
 */
const MobileThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="md:hidden fixed z-40 right-3 bottom-3 w-10 h-10 rounded-full
                 bg-card/80 backdrop-blur-sm border border-border
                 text-muted-foreground hover:text-foreground
                 shadow-sm flex items-center justify-center transition-colors
                 [bottom:calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

export default MobileThemeToggle;
