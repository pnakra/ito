import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { hasCampusResourceLinks, loadCampusResources } from "@/lib/campusResources";
import type { StructuredSignals } from "@/types/signals";

const CampusResources = ({ targetPreference }: { targetPreference?: StructuredSignals["targetPreference"] }) => {
  const [config] = useState(loadCampusResources);
  if (!hasCampusResourceLinks(config) || !config) return null;
  const limitReporting = targetPreference === "no-report" || targetPreference === "no-share";
  const links = [
    { url: config.supportUrl, label: "Campus support" },
    { url: limitReporting ? undefined : config.titleIxUrl, label: "Title IX information" },
    { url: limitReporting ? undefined : config.reportUrl, label: "Campus reporting or tip form" },
  ].filter((link) => Boolean(link.url));
  if (links.length === 0) return null;

  return (
    <section className="w-full rounded-lg border border-border bg-card p-4 text-left space-y-3">
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">{config.campus ? `${config.campus}: ` : ""}Support and reporting</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">Check each office's confidentiality and reporting rules before sharing names.</p>
      </div>
      <div className="space-y-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-[14px] text-foreground hover:border-foreground/40 transition-colors"
          >
            {link.label}
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">These links came from this pilot link and have not been checked by ito.</p>
    </section>
  );
};

export default CampusResources;
