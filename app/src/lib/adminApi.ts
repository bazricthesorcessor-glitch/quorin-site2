/**
 * Admin API client for the QUORIN admin panel.
 *
 * Talks directly to the Medusa v2 backend's /admin and /auth endpoints using a
 * JWT issued by the user (admin) email/password auth flow. The token is stored
 * in localStorage and attached as `Authorization: Bearer <token>` on every call.
 *
 * All data returned here is persisted in the Postgres database that backs
 * Medusa, so changes survive page refreshes, browser restarts, and server
 * restarts.
 */

const MEDUSA_BACKEND_URL =
  import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000";

const TOKEN_KEY = "quorin.admin.token";
const USER_KEY = "quorin.admin.user";

export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  metadata: Record<string, unknown> | null;
}

export interface AdminProductImage {
  id: string;
  url: string;
  rank?: number;
}

export interface AdminProductVariant {
  id: string;
  title?: string | null;
  sku?: string | null;
  prices?: Array<{ id?: string; currency_code: string; amount: number }>;
  options?: Record<string, unknown>;
  inventory_quantity?: number;
  manage_inventory?: boolean;
  allow_backorder?: boolean;
}

export interface AdminProductOption {
  id: string;
  title: string;
  values: Array<{ id: string; value: string }>;
}

export interface AdminProduct {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  handle: string;
  status: "draft" | "proposed" | "published" | "rejected";
  thumbnail: string | null;
  collection_id: string | null;
  type_id: string | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;
  origin_country: string | null;
  hs_code: string | null;
  mid_code: string | null;
  material: string | null;
  metadata: Record<string, unknown> | null;
  images?: AdminProductImage[];
  tags?: Array<{ id: string; value: string }>;
  categories?: Array<{ id: string; name?: string }>;
  options?: AdminProductOption[];
  variants?: AdminProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  description: string | null;
  handle: string;
  is_active: boolean;
  is_internal: boolean;
  rank: number | null;
  parent_category_id: string | null;
  category_children?: AdminCategory[];
}

export interface AdminCollection {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminOrder {
  id: string;
  display_id?: number;
  status: string;
  version?: number;
  fulfillment_status: string | null;
  payment_status: string | null;
  currency_code: string;
  customer_id: string | null;
  email: string | null;
  created_at: string;
  items?: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    thumbnail?: string | null;
  }>;
  /** Totals are returned inside the `summary` object when we avoid computed total fields */
  summary?: {
    total: number;
    subtotal: number;
    tax_total: number;
    item_total: number;
    discount_total: number;
    original_total: number;
    shipping_total: number;
    original_item_total: number;
    shipping_total_with_tax: number;
    shipping_total_with_discounts: number;
  };
}

export interface AdminCustomer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
  orders?: number;
}

export interface AdminInventoryItem {
  id: string;
  sku: string | null;
  title: string | null;
  description: string | null;
  requires_shipping: boolean;
  stocked_quantity: number;
  reserved_quantity: number;
  weight: number | null;
}

export interface AdminPromotion {
  id: string;
  code: string;
  is_automatic: boolean;
  status: string;
  created_at: string;
}

interface ListResponse<T> {
  count: number;
  offset: number;
  limit: number;
}

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/** When true, adminApi returns empty/fallback data instead of hitting the backend. */
export let localMode = false;

const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const setToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
};

const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
};

const getCachedUser = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
};

const setCachedUser = (user: AdminUser) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${MEDUSA_BACKEND_URL}${path}`, { ...options, headers });
  } catch (e) {
    if (adminApi.localMode) return {} as T;
    throw new ApiError(`Network error contacting backend: ${(e as Error).message}`);
  }

  if (res.status === 401) {
    clearToken();
    if (adminApi.localMode) return {} as T;
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    if (adminApi.localMode) return {} as T;
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return body as T;
};

export const adminApi = {
  /** When true, API calls return empty data instead of throwing (used for local fallback mode). */
  localMode: false,

  /* ---------- Auth ---------- */
  async login(email: string, password: string): Promise<{ user: AdminUser; token: string }> {
    const result = await request<{ token: string }>("/auth/user/emailpass", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const token = result.token;
    setToken(token);
    // Fetch the user profile with the fresh token.
    const { user } = await request<{ user: AdminUser }>("/admin/users/me", {
      method: "GET",
    });
    setCachedUser(user);
    return { user, token };
  },

  logout() {
    clearToken();
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },

  getCachedUser,

  async me(): Promise<AdminUser> {
    const { user } = await request<{ user: AdminUser }>("/admin/users/me");
    setCachedUser(user);
    return user;
  },

  /* ---------- Products ---------- */
  async listProducts(params: { limit?: number; offset?: number; q?: string; status?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.offset) qs.set("offset", String(params.offset));
    if (params.q) qs.set("q", params.q);
    if (params.status) qs.set("status", params.status);
    qs.set("order", "-created_at");
    const query = qs.toString();
    return request<{ products: AdminProduct[] } & ListResponse<AdminProduct>>(
      `/admin/products${query ? `?${query}` : ""}`
    );
  },

  async getProduct(id: string) {
    return request<{ product: AdminProduct }>(`/admin/products/${id}`);
  },

  async createProduct(data: Record<string, unknown>) {
    return request<{ product: AdminProduct }>("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: Record<string, unknown>) {
    return request<{ product: AdminProduct }>(`/admin/products/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string) {
    return request<{ id: string; object: string; deleted: boolean }>(`/admin/products/${id}`, {
      method: "DELETE",
    });
  },

  async setProductStatus(id: string, status: "published" | "draft") {
    return this.updateProduct(id, { status });
  },

  /* ---------- Categories ---------- */
  async listCategories() {
    return request<{ product_categories: AdminCategory[] } & ListResponse<AdminCategory>>(
      "/admin/product-categories?limit=100&order=-created_at"
    );
  },

  async createCategory(data: { name: string; description?: string; handle?: string; is_active?: boolean; parent_category_id?: string | null }) {
    return request<{ product_category: AdminCategory }>("/admin/product-categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: Partial<{ name: string; description?: string; handle: string; is_active: boolean }>) {
    return request<{ product_category: AdminCategory }>(`/admin/product-categories/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string) {
    return request<{ id: string; object: string; deleted: boolean }>(`/admin/product-categories/${id}`, {
      method: "DELETE",
    });
  },

  /* ---------- Collections ---------- */
  async listCollections() {
    return request<{ collections: AdminCollection[] } & ListResponse<AdminCollection>>(
      "/admin/collections?limit=100&order=-created_at"
    );
  },

  async createCollection(data: { title: string; handle?: string; description?: string }) {
    return request<{ collection: AdminCollection }>("/admin/collections", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteCollection(id: string) {
    return request<{ id: string; object: string; deleted: boolean }>(`/admin/collections/${id}`, {
      method: "DELETE",
    });
  },

  /* ---------- Orders ---------- */
  async listOrders(params: { limit?: number; offset?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.offset) qs.set("offset", String(params.offset));
    qs.set("order", "-created_at");
    // Explicit fields to avoid Medusa v2 computed total bug — totals come via `summary`
    qs.set("fields", "id,display_id,status,version,summary,metadata,locale,created_at,updated_at,email,customer_id,currency_code,payment_status,fulfillment_status,items");
    return request<{ orders: AdminOrder[] } & ListResponse<AdminOrder>>(
      `/admin/orders?${qs.toString()}`
    );
  },

  async getOrder(id: string) {
    return request<{ order: AdminOrder }>(`/admin/orders/${id}?fields=id,display_id,status,version,summary,metadata,locale,created_at,updated_at,email,customer_id,currency_code,items`);
  },

  async updateOrderStatus(id: string, status: string) {
    // Medusa fulfillment/cancel workflows vary by version; this is a best-effort
    // status transition used by the orders page.
    return request<{ order: AdminOrder }>(`/admin/orders/${id}`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  },

  /* ---------- Customers ---------- */
  async listCustomers(params: { limit?: number; offset?: number; q?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.offset) qs.set("offset", String(params.offset));
    if (params.q) qs.set("q", params.q);
    return request<{ customers: AdminCustomer[] } & ListResponse<AdminCustomer>>(
      `/admin/customers?${qs.toString()}`
    );
  },

  /* ---------- Inventory ---------- */
  async listInventory() {
    return request<{ inventory_items: AdminInventoryItem[] } & ListResponse<AdminInventoryItem>>(
      "/admin/inventory-items?limit=100"
    );
  },

  async updateInventoryItem(id: string, data: { stocked_quantity?: number; sku?: string; title?: string }) {
    return request<{ inventory_item: AdminInventoryItem }>(`/admin/inventory-items/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /* ---------- Promotions ---------- */
  async listPromotions() {
    return request<{ promotions: AdminPromotion[] } & ListResponse<AdminPromotion>>(
      "/admin/promotions?limit=100"
    );
  },

  /* ---------- File uploads ---------- */
  async uploadFiles(files: File[]): Promise<{ id: string; url: string }[]> {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const token = getToken();
    const res = await fetch(`${MEDUSA_BACKEND_URL}/admin/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      throw new ApiError(`Upload failed (${res.status})`, res.status);
    }
    const json = (await res.json()) as { files: Array<{ id: string; url: string }> };
    return json.files;
  },
};

export { ApiError };
