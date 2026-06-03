import { hydrateAccounts, type AccountRecord } from '@/data/accounts';
import { quorinData } from '@/data/products';
import type { AdminTheme } from '@/components/AdminCenter';

const STORAGE_KEYS = {
  accounts: 'quorin.accounts',
  catalog: 'quorin.catalog',
  checkoutLocks: 'quorin.checkoutLocks',
  clientFingerprint: 'quorin.clientFingerprint',
  currentAccountId: 'quorin.currentAccountId',
  customRequests: 'quorin.customRequests',
  theme: 'quorin.theme',
} as const;

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort in the browser.
  }
};

export interface CustomRequestRecord {
  id: string;
  accountId: string;
  message: string;
  createdAt: string;
}

export const loadAccounts = () =>
  hydrateAccounts(readJson<Record<string, Partial<AccountRecord>>>(STORAGE_KEYS.accounts, {}));

export const saveAccounts = (accounts: Record<string, AccountRecord>) => {
  writeJson(STORAGE_KEYS.accounts, accounts);
};

export const loadCurrentAccountId = () => readJson<string | null>(STORAGE_KEYS.currentAccountId, null);

export const saveCurrentAccountId = (accountId: string | null) => {
  if (accountId) {
    writeJson(STORAGE_KEYS.currentAccountId, accountId);
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.currentAccountId);
  } catch {
    // Persistence is best-effort in the browser.
  }
};

export const loadCatalog = () => readJson<Partial<typeof quorinData> | null>(STORAGE_KEYS.catalog, null);

export const saveCatalog = (catalog: typeof quorinData) => {
  writeJson(STORAGE_KEYS.catalog, catalog);
};

export const loadTheme = (defaultTheme: AdminTheme) => {
  const persisted = readJson<Partial<AdminTheme>>(STORAGE_KEYS.theme, {});
  return { ...defaultTheme, ...persisted };
};

export const saveTheme = (theme: AdminTheme) => {
  writeJson(STORAGE_KEYS.theme, theme);
};

export const loadClientFingerprint = () => {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEYS.clientFingerprint);
    if (existing) return existing;

    const next = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEYS.clientFingerprint, next);
    return next;
  } catch {
    return `fingerprint-${Date.now()}`;
  }
};

export const loadCheckoutLocks = () =>
  readJson<Record<string, boolean>>(STORAGE_KEYS.checkoutLocks, {});

export const saveCheckoutLocks = (checkoutLocks: Record<string, boolean>) => {
  writeJson(STORAGE_KEYS.checkoutLocks, checkoutLocks);
};

export const loadCustomRequests = () =>
  readJson<CustomRequestRecord[]>(STORAGE_KEYS.customRequests, []);

export const appendCustomRequest = (entry: CustomRequestRecord) => {
  const next = [entry, ...loadCustomRequests()];
  writeJson(STORAGE_KEYS.customRequests, next);
  return next;
};
