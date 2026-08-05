import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { adminSupabase } from "@/lib/adminSupabase";

const ADMIN_EMAIL = "priya@overridelabsprevention.org";

interface Props {
  children: (session: Session) => React.ReactNode;
}

/**
 * Auth gate for the external eval database. The resulting session and all
 * production-eval queries use this same dedicated client.
 */
export default function AdminAuthGate({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = adminSupabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setChecking(false);
    });
    adminSupabase.auth.getSession().then(({ data }) => {
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
       const { data, error } = await adminSupabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      if (error) setError(error.message);
      setIsAdmin(!!data);
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await adminSupabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password,
    });
    if (error) setError(error.message);
    setBusy(false);
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
          <h1 className="font-serif text-2xl text-foreground">Restricted</h1>
          <p className="text-sm text-muted-foreground">
            Signing in as <span className="font-mono">{ADMIN_EMAIL}</span>.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete="current-password"
            autoFocus
            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground text-sm"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy || !password}
            className="w-full bg-foreground text-background rounded py-2 text-sm disabled:opacity-50"
          >
            {busy ? "signing in..." : "sign in"}
          </button>
        </form>
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

  if (!isAdmin) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="font-serif text-2xl text-foreground">No access</h1>
          <p className="text-sm text-muted-foreground">
            {session.user.email} is signed in but has no admin role, so the database returns
            nothing.
          </p>
          {error && <p className="text-sm text-destructive font-mono">{error}</p>}
          <button
             onClick={() => adminSupabase.auth.signOut()}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            sign out
          </button>
        </div>
      </main>
    );
  }

  return <>{children(session)}</>;
}
