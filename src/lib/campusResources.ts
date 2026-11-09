export interface CampusResourceConfig {
  campus?: string;
  supportUrl?: string;
  titleIxUrl?: string;
  reportUrl?: string;
}

const STORAGE_KEY = "ito_campus_resources_v1";

function cleanCampus(value: string | null): string | undefined {
  const campus = value?.trim().slice(0, 80);
  return campus || undefined;
}

function cleanHttpsUrl(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return url.toString().slice(0, 2048);
  } catch {
    return undefined;
  }
}

export function parseCampusResources(search: string): CampusResourceConfig {
  const params = new URLSearchParams(search);
  const config: CampusResourceConfig = {
    campus: cleanCampus(params.get("campus")),
    supportUrl: cleanHttpsUrl(params.get("support_url")),
    titleIxUrl: cleanHttpsUrl(params.get("title_ix_url")),
    reportUrl: cleanHttpsUrl(params.get("report_url")),
  };
  return Object.fromEntries(Object.entries(config).filter(([, value]) => Boolean(value)));
}

export function hasCampusResourceLinks(config: CampusResourceConfig | null): boolean {
  return Boolean(config && (config.supportUrl || config.titleIxUrl || config.reportUrl));
}

/** Read a pilot's links once, then keep them for in-app navigation in this tab. */
export function loadCampusResources(): CampusResourceConfig | null {
  if (typeof window === "undefined") return null;
  let stored: CampusResourceConfig = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}") as CampusResourceConfig;
  } catch {
    stored = {};
  }
  const fromUrl = parseCampusResources(window.location.search);
  if (Object.keys(fromUrl).length > 0) {
    const merged = { ...stored, ...fromUrl };
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch { /* storage unavailable */ }
    return merged;
  }
  return Object.keys(stored).length > 0 ? stored : null;
}
