import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: (session: Session) => React.ReactNode;
}

/**
 * Email + password gate for admin-only evals routes.
 * Server-side RLS is the real boundary; this only shapes the UI.
 */
export default function AdminAuthGate({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!cancelled) setIsAdmin(!!data);
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin/evals/production` },
        });
        if (error) setError(error.message);
        else if (!data.session) setNotice("Check your email to confirm the account, then sign in.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center bg-background text-muted-foreground text-sm">
        loading...
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center px-6 bg-background">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <h1 className="font-serif text-2xl text-foreground">Admin sign-in</h1>
          <p className="text-sm text-muted-foreground">
            Production evals are restricted to admin accounts.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            autoComplete="email"
            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground text-sm"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
          <button
            type="submit"
            disabled={busy || !email || !password}
            className="w-full bg-foreground text-background rounded py-2 text-sm disabled:opacity-50"
          >
            {busy ? "working..." : mode === "signin" ? "sign in" : "create account"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
            className="w-full text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            {mode === "signin" ? "create an account" : "back to sign in"}
          </button>
        </form>
      </main>
    );
  }

  if (isAdmin === false) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="font-serif text-2xl text-foreground">No access</h1>
          <p className="text-sm text-muted-foreground">
            {session.user.email} is signed in but isn't an admin yet.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            sign out
          </button>
        </div>
      </main>
    );
  }

  if (isAdmin === null) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center bg-background text-muted-foreground text-sm">
        checking access...
      </main>
    );
  }

  return <>{children(session)}</>;
}
