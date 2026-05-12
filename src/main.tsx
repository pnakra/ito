import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Capture ?src/?pid/?sid referral params on first load, before React Router
// navigation can strip them from the URL. Side-effect import.
import "./lib/referralMeta";

createRoot(document.getElementById("root")!).render(<App />);
