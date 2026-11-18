import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import AdminAuthGate from "@/components/evals/AdminAuthGate";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminSupabase } from "@/lib/adminSupabase";
import ActivityTab from "@/components/partner/ActivityTab";

/** Untyped view of the admin client: holds the gate's session, never the public client's storage. */
const db = adminSupabase as unknown as SupabaseClient;

interface Q { id: string; created_at: string; question: string; asker_org: string | null; asker_email: string | null; answer: string | null; status: string; answered_at: string | null }
interface S { id: string; created_at: string; org: string; where_shared: string; reach: string | null; focus: string | null; contact_email: string | null; notes: string | null; share_status: string | null; share_date: string | null }
interface R { flow: string; source: string; org_text: string | null }

/** Upcoming planned shares first (soonest date first), then everything else newest first. */
function sortShares(list: S[]): S[] {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (s: S) => s.share_status === "planned" && (!s.share_date || s.share_date >= today);
  const up = list.filter(upcoming).sort((a, b) => (a.share_date ?? "9999").localeCompare(b.share_date ?? "9999"));
  return [...up, ...list.filter((s) => !upcoming(s))];
}

const fmt = (d: string) => new Date(d).toLocaleString();

function Inner({ session }: { session: Session }) {
  const [err, setErr] = useState<string | null>(null);
  const [qs, setQs] = useState<Q[]>([]); const [shares, setShares] = useState<S[]>([]); const [refs, setRefs] = useState<R[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const [a, b, c] = await Promise.all([
      db.from("partner_questions").select("*").order("created_at", { ascending: false }),
      db.from("partner_shares").select("*").order("created_at", { ascending: false }),
      db.from("referral_sources").select("flow,source,org_text"),
    ]);
    setErr(a.error?.message ?? b.error?.message ?? c.error?.message ?? null);
    const list = (a.data as Q[] | null) ?? [];
    setQs([...list.filter((q) => q.status === "pending"), ...list.filter((q) => q.status !== "pending")]);
    setDrafts(Object.fromEntries(list.map((q) => [q.id, q.answer ?? ""])));
    setShares(sortShares((b.data as S[] | null) ?? [])); setRefs((c.data as R[] | null) ?? []);
  }, []);
  useEffect(() => { load(); }, [load, session]);

  const update = async (id: string, patch: Record<string, unknown>) => {
    const { error } = await db.from("partner_questions").update(patch).eq("id", id);
    if (error) setErr(error.message); else load();
  };

  const grouped = useMemo(() => {
    const m = new Map<string, { flow: string; source: string; org: string; n: number }>();
    for (const r of refs) {
      const org = (r.org_text ?? "").trim().toLowerCase();
      const k = `${r.flow}|${r.source}|${org}`;
      const cur = m.get(k) ?? { flow: r.flow, source: r.source, org, n: 0 };
      cur.n++; m.set(k, cur);
    }
    return [...m.values()].sort((x, y) => y.n - x.n);
  }, [refs]);

  const cell = "px-3 py-2 align-top border-b border-border text-[13px]";
  return (
    <main className="min-h-[100dvh] bg-background container mx-auto px-5 py-8">
      <SEO title="Partner kit admin" description="Admin" path="/partner-kit/admin" noindex />
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="font-serif text-3xl">Partner kit admin</h1>
        {err && <p className="text-sm text-destructive font-mono">{err}</p>}
        <Tabs defaultValue="activity">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="questions">Questions ({qs.filter((q) => q.status === "pending").length} pending)</TabsTrigger>
            <TabsTrigger value="shares">Shares ({shares.length})</TabsTrigger>
            <TabsTrigger value="heard">Where people heard ({refs.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="activity"><ActivityTab db={db} /></TabsContent>
          <TabsContent value="questions" className="space-y-4">
            {qs.length === 0 && <p className="text-sm text-muted-foreground">No questions yet.</p>}
            {qs.map((q) => (
              <div key={q.id} className="bg-card shadow-card rounded-lg p-4 space-y-3">
                <div className="flex flex-wrap justify-between gap-2 text-[12px] text-muted-foreground">
                  <span>{fmt(q.created_at)} · {q.asker_org || "no org"} · {q.asker_email || "no email"}</span>
                  <span className="uppercase tracking-wide">{q.status}</span>
                </div>
                <p className="text-[15px] whitespace-pre-line">{q.question}</p>
                <textarea rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[14px]" value={drafts[q.id] ?? ""} onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))} placeholder="Answer" />
                <div className="flex gap-2">
                  <button className="rounded-lg bg-primary px-4 py-2 text-[13px] text-primary-foreground disabled:opacity-50" disabled={!drafts[q.id]?.trim()}
                    onClick={() => update(q.id, { answer: drafts[q.id].trim(), status: "published", answered_at: new Date().toISOString() })}>Publish</button>
                  <button className="rounded-lg border border-border px-4 py-2 text-[13px]" onClick={() => update(q.id, { status: "hidden" })}>Hide</button>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="shares" className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr>{["Submitted", "Status", "Share date", "Org", "Where", "Reach", "Version", "Email", "Notes"].map((h) => <th key={h} className={cell + " font-medium"}>{h}</th>)}</tr></thead>
              <tbody>{shares.map((s) => (
                <tr key={s.id}><td className={cell}>{fmt(s.created_at)}</td><td className={cell}>{s.share_status ?? ""}</td><td className={cell}>{s.share_date ?? ""}</td><td className={cell}>{s.org}</td><td className={cell}>{s.where_shared}</td><td className={cell}>{s.reach ?? ""}</td><td className={cell}>{s.focus ?? ""}</td><td className={cell}>{s.contact_email ?? ""}</td><td className={cell + " whitespace-pre-line"}>{s.notes ?? ""}</td></tr>
              ))}</tbody>
            </table>
          </TabsContent>
          <TabsContent value="heard" className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr>{["Flow", "Source", "Org", "Count"].map((h) => <th key={h} className={cell + " font-medium"}>{h}</th>)}</tr></thead>
              <tbody>{grouped.map((g) => (
                <tr key={`${g.flow}|${g.source}|${g.org}`}><td className={cell}>{g.flow}</td><td className={cell}>{g.source}</td><td className={cell}>{g.org}</td><td className={cell}>{g.n}</td></tr>
              ))}</tbody>
            </table>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

export default function PartnerKitAdmin() {
  return <AdminAuthGate>{(session) => <Inner session={session} />}</AdminAuthGate>;
}
