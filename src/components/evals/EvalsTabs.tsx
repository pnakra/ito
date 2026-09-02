import { NavLink } from "react-router-dom";

const base =
  "text-xs uppercase tracking-wider px-3 py-1.5 rounded border transition-colors";

export default function EvalsTabs() {
  return (
    <nav className="flex items-center gap-2" aria-label="Evals sections">
      <NavLink
        to="/admin/evals"
        end
        className={({ isActive }) =>
          `${base} ${
            isActive
              ? "border-foreground/40 text-foreground bg-foreground/5"
              : "border-border text-muted-foreground hover:text-foreground"
          }`
        }
      >
        Suite
      </NavLink>
      <NavLink
        to="/admin/evals/production"
        className={({ isActive }) =>
          `${base} ${
            isActive
              ? "border-foreground/40 text-foreground bg-foreground/5"
              : "border-border text-muted-foreground hover:text-foreground"
          }`
        }
      >
        Production
      </NavLink>
      <NavLink
        to="/admin/evals/growth"
        className={({ isActive }) =>
          `${base} ${
            isActive
              ? "border-foreground/40 text-foreground bg-foreground/5"
              : "border-border text-muted-foreground hover:text-foreground"
          }`
        }
      >
        Growth
      </NavLink>
    </nav>
  );
}
