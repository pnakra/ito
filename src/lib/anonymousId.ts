const STORAGE_KEY = "ito_anon_id";
const EXPIRY_KEY = "ito_anon_id_expiry";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function getAnonymousId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY);

    if (existing && expiry && Date.now() < Number(expiry)) {
      return existing;
    }

    const newId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, newId);
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + THIRTY_DAYS_MS));
    return newId;
  } catch {
    return crypto.randomUUID();
  }
}
