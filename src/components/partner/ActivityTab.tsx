import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

interface E { id: string; created_at: string; visit_id: string | null; event: string; focus: string | null; theme: string | null; org_text: string | null; detail: string | null }
type Range = "7" | "30" | "all";

const cell = "px-3 py-2 align-top border-b border-border text-[13px]";
const fmt = (d: string) => new Date(d).toLocaleString();

export default function ActivityTab({ db }: { db: SupabaseClient }) {
  const [range, setRange] = useState<Range>("7");
  const [rows, setRows] = useState<E[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setRows(null); setErr(null);
    (async () => {
      const all: E[] = [];
      for (let from = 0; ; from += 1000) {
        let q = db.from("partner_kit_events").select("id,created_at,visit_id,event,focus,theme,org_text,detail").order("created_at", { ascending: false }).range(from, from + 999);
        if (range !== "all") q = q.gte("created_at", new Date(Date.now() - Number(range) * 864e5).toISOString());
        const { data, error } = await q;
        if (error) { if (live) setErr(`Couldn't load activity: ${error.message}. Make sure you're signed in as an admin.`); return; }
        all.push(...((data as E[]) ?? []));
        if (!data || data.length < 1000) break;
      }
      if (live) setRows(all);
    })();
    return () => { live = false; };
  }, [db, range]);

  const stats = useMemo(() => {
    const r = rows ?? [];
    const n = (...ev: string[]) => r.filter((x) => ev.includes(x.event)).length;
    const visits = new Set(r.filter((x) => x.event === "page_view" && x.visit_id).map((x) => x.visit_id)).size;
    const dl = r.filter((x) => x.event === "download_pdf" || x.event === "download_png");
    const by = new Map<string, number>();
    for (const d of dl) { const k = `${d.focus ?? "?"}|${d.theme ?? "?"}`; by.set(k, (by.get(k) ?? 0) + 1); }
    return {
      cards: [["Unique visits", visits], ["Flyer downloads", dl.length], ["Messages copied", n("copy_message")], ["Questions asked", n("question_submitted")], ["Shares/plans reported", n("share_submitted")], ["Calendly clicks", n("calendly_click")]] as const,
      byVT: [...by.entries()].map(([k, c]) => ({ v: k.split("|")[0], t: k.split("|")[1], c })).sort((a, b) => b.c - a.c),
      flyers: dl.filter((d) => d.org_text?.trim()),
      recent: r.slice(0, 100),
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2" role="radiogroup" aria-label="Date range">
        {([["7", "Last 7 days"], ["30", "Last 30 days"], ["all", "All time"]] as const).map(([v, l]) => (
          <button key={v} role="radio" aria-checked={range === v} onClick={() => setRange(v)}
            className={`rounded-lg border px-3 py-1.5 text-[13px] ${range === v ? "border-primary bg-accent text-foreground" : "border-border text-muted-foreground"}`}>{l}</button>
        ))}
      </div>
      {err ? <p className="text-sm text-destructive">{err}</p> : rows === null ? <p className="text-sm text-muted-foreground">Loading activity...</p> : rows.length === 0 ? <p className="text-sm text-muted-foreground">No activity in this range yet.</p> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.cards.map(([l, v]) => (
              <div key={l} className="bg-card shadow-card rounded-lg p-4"><p className="text-[12px] text-muted-foreground">{l}</p><p className="text-2xl font-medium">{v}</p></div>
            ))}
          </div>
          <section className="space-y-2"><h2 className="text-[15px] font-medium">Downloads by version and theme</h2>
            {stats.byVT.length === 0 ? <p className="text-sm text-muted-foreground">No downloads yet.</p> : (
              <table className="text-left"><thead><tr>{["Version", "Theme", "Downloads"].map((h) => <th key={h} className={cell + " font-medium"}>{h}</th>)}</tr></thead>
                <tbody>{stats.byVT.map((x) => <tr key={x.v + x.t}><td className={cell}>{x.v}</td><td className={cell}>{x.t}</td><td className={cell}>{x.c}</td></tr>)}</tbody></table>
            )}
          </section>
          <section className="space-y-2 overflow-x-auto"><h2 className="text-[15px] font-medium">Flyers made</h2>
            {stats.flyers.length === 0 ? <p className="text-sm text-muted-foreground">No flyers with an org name yet.</p> : (
              <table className="w-full text-left"><thead><tr>{["Org", "Version", "Theme", "File", "Date"].map((h) => <th key={h} className={cell + " font-medium"}>{h}</th>)}</tr></thead>
                <tbody>{stats.flyers.map((x) => <tr key={x.id}><td className={cell}>{x.org_text}</td><td className={cell}>{x.focus ?? ""}</td><td className={cell}>{x.theme ?? ""}</td><td className={cell}>{x.event === "download_pdf" ? "PDF" : "PNG"}</td><td className={cell}>{fmt(x.created_at)}</td></tr>)}</tbody></table>
            )}
          </section>
          <section className="space-y-2 overflow-x-auto"><h2 className="text-[15px] font-medium">Recent activity</h2>
            <table className="w-full text-left"><thead><tr>{["Time", "Event", "Version", "Theme", "Org", "Detail"].map((h) => <th key={h} className={cell + " font-medium"}>{h}</th>)}</tr></thead>
              <tbody>{stats.recent.map((x) => <tr key={x.id}><td className={cell}>{fmt(x.created_at)}</td><td className={cell}>{x.event}</td><td className={cell}>{x.focus ?? ""}</td><td className={cell}>{x.theme ?? ""}</td><td className={cell}>{x.org_text ?? ""}</td><td className={cell}>{x.detail ?? ""}</td></tr>)}</tbody></table>
          </section>
        </>
      )}
    </div>
  );
}
