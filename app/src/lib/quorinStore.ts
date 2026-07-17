import { type AccountRecord } from '@/data/accounts';
import { quorinData } from '@/data/products';
import type { AdminTheme } from '@/components/AdminCenter';

const STORAGE_KEYS = {
  accounts: 'quorin.accounts',
  catalog: 'quorin.catalog',
  checkoutLocks: 'quorin.checkoutLocks',
  clientFingerprint: 'quorin.clientFingerprint',
  currentAccountId: 'quorin.currentAccountId',
  activityLog: 'quorin.activityLog',
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

export interface ActivityRecord {
  id: string;
  type: 'auth' | 'catalog' | 'checkout' | 'order' | 'profile' | 'theme' | 'system';
  title: string;
  detail?: string;
  actor?: string;
  createdAt: string;
}

export const loadAccounts = () =>
  readJson<Record<string, AccountRecord>>(STORAGE_KEYS.accounts, {}) ?? {};

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

const CATALOG_VERSION = 2;
const THEME_VERSION = 1;

interface VersionedStore<T> {
  version: number;
  data: T;
}

export const loadCatalog = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.catalog);
    if (!raw) return null;
    const stored: VersionedStore<Partial<typeof quorinData>> = JSON.parse(raw);
    if (!stored || stored.version !== CATALOG_VERSION) {
      return null;
    }
    return stored.data;
  } catch {
    return null;
  }
};

export const saveCatalog = (catalog: typeof quorinData) => {
  const store: VersionedStore<typeof quorinData> = {
    version: CATALOG_VERSION,
    data: catalog,
  };
  try {
    localStorage.setItem(STORAGE_KEYS.catalog, JSON.stringify(store));
  } catch {
    // Persistence is best-effort in the browser.
  }
};

interface AdminThemeStore {
  version: number;
  data: Partial<AdminTheme>;
}

export const loadTheme = (defaultTheme: AdminTheme) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.theme);
    if (!raw) return defaultTheme;
    const stored: AdminThemeStore = JSON.parse(raw);
    if (!stored || stored.version !== THEME_VERSION) {
      return defaultTheme;
    }
    return { ...defaultTheme, ...stored.data };
  } catch {
    return defaultTheme;
  }
};

export const saveTheme = (theme: AdminTheme) => {
  const store: AdminThemeStore = {
    version: THEME_VERSION,
    data: theme,
  };
  try {
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(store));
  } catch {
    // Persistence is best-effort in the browser.
  }
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

export const loadActivityLog = () =>
  readJson<ActivityRecord[]>(STORAGE_KEYS.activityLog, []);

export const appendActivityLog = (entry: Omit<ActivityRecord, 'id' | 'createdAt'> & { createdAt?: string }) => {
  const next: ActivityRecord = {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: entry.createdAt ?? new Date().toISOString(),
    ...entry,
  };
  const nextLog = [next, ...loadActivityLog()].slice(0, 100);
  writeJson(STORAGE_KEYS.activityLog, nextLog);
  return nextLog;
};
