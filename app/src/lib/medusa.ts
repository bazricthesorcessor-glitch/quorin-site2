import Client from "@medusajs/js-sdk";

const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || "";

const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("No VITE_MEDUSA_PUBLISHABLE_KEY found. Medusa integration disabled. Set the env var or disable the integration.");
}

const client = PUBLISHABLE_KEY
  ? new Client({
      baseUrl: MEDUSA_BACKEND_URL,
      publishableKey: PUBLISHABLE_KEY,
    })
  : null;

const ensureClient = () => {
  if (!client) {
    throw new Error(
      "Medusa client is not initialized. Set VITE_MEDUSA_PUBLISHABLE_KEY in your environment."
    );
  }
  return client;
};

export const medusaApi = {
  async getProducts(params = {}) {
    try {
      const { products } = await ensureClient().store.product.list({
        ...params,
        fields: "id,title,handle,description,tags,variants.prices,variants.id,variants.title,variants.options,variants.sku,variants.manage_inventory,variants.allow_backorder,variants.thumbnail,*images",
      });
      return { products };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async getProduct(id: string) {
    try {
      const { product } = await ensureClient().store.product.retrieve(id);
      return { product };
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  async createProduct(data: Record<string, unknown>) {
    try {
      const { product } = await ensureClient().admin.product.create(data);
      return { product };
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  async updateProduct(id: string, data: Record<string, unknown>) {
    try {
      const { product } = await ensureClient().admin.product.update(id, data);
      return { product };
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    try {
      await ensureClient().admin.product.delete(id);
      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  async getRegions() {
    try {
      const { regions } = await ensureClient().store.region.list();
      return { regions };
    } catch (error) {
      console.error("Error fetching regions:", error);
      throw error;
    }
  },

  async createCart() {
    try {
      const { cart } = await ensureClient().store.cart.create({});
      return { cart };
    } catch (error) {
      console.error("Error creating cart:", error);
      throw error;
    }
  },

  async getCart(id: string) {
    try {
      const { cart } = await ensureClient().store.cart.retrieve(id);
      return { cart };
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  },

  async addCartItem(cartId: string, variantId: string, quantity: number = 1) {
    try {
      const { cart } = await ensureClient().store.cart.createLineItem(cartId, {
        variant_id: variantId,
        quantity,
      });
      return { cart };
    } catch (error) {
      console.error("Error adding cart item:", error);
      throw error;
    }
  },

  async updateCartItem(cartId: string, itemId: string, quantity: number) {
    try {
      const { cart } = await ensureClient().store.cart.updateLineItem(cartId, itemId, {
        quantity,
      });
      return { cart };
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  },

  async removeCartItem(cartId: string, itemId: string) {
    try {
      const { deleted } = await ensureClient().store.cart.deleteLineItem(cartId, itemId);
      return { deleted, success: true };
    } catch (error) {
      console.error("Error removing cart item:", error);
      throw error;
    }
  },

  async updateCart(cartId: string, data: Record<string, unknown>) {
    try {
      const { cart } = await ensureClient().store.cart.update(cartId, data);
      return { cart };
    } catch (error) {
      console.error("Error updating cart:", error);
      throw error;
    }
  },

  async completeCart(cartId: string) {
    try {
      const result = await ensureClient().store.cart.complete(cartId);
      return result;
    } catch (error) {
      console.error("Error completing cart:", error);
      throw error;
    }
  },

  async createCustomer(data: { email: string; password: string }) {
    try {
      const token = await ensureClient().auth.register("customer", "emailpass", {
        email: data.email,
        password: data.password,
      });
      // Now create customer with token
      const { customer } = await ensureClient().store.customer.create(
        { email: data.email },
        {},
        { Authorization: `Bearer ${token}` }
      );
      return { success: true, customer };
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  async authenticate(email: string, password: string) {
    try {
      const result = await ensureClient().auth.login("customer", "emailpass", {
        email,
        password,
      });
      if (typeof result === "string") {
        localStorage.setItem("medusa_auth_token", result);
        return { token: result };
      }
      throw new Error("Authentication requires additional steps (MFA, OAuth, etc.)");
    } catch (error) {
      console.error("Error authenticating:", error);
      throw error;
    }
  },

  async getCustomer() {
    const token = localStorage.getItem("medusa_auth_token");
    if (!token) return null;
    try {
      const res = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY ?? "",
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.customer ?? null;
    } catch {
      return null;
    }
  },

  async updateCustomer(body: Record<string, unknown>) {
    const token = localStorage.getItem("medusa_auth_token");
    if (!token) return null;
    try {
      const res = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY ?? "",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.customer ?? null;
    } catch {
      return null;
    }
  },

  // --- Google OAuth ---

  async googleAuthLogin(callbackUrl: string) {
    const result = await ensureClient().auth.login("customer", "google", {
      callback_url: callbackUrl,
    });
    if (typeof result === "object" && result !== null && "location" in result) {
      return { location: result.location as string };
    }
    throw new Error("Google login did not return a redirect URL");
  },

  async googleAuthCallback(code: string, state: string) {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/auth/customer/google/callback-plus?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY ?? "",
        },
      }
    );
    if (!res.ok) {
      throw new Error("Google OAuth callback failed");
    }
    return res.json() as Promise<{
      token: string;
      user: { email: string; name: string; picture: string };
    }>;
  },

  async getOrCreateCustomerFromGoogleAuth(
    token: string,
    user: { email: string; name?: string }
  ) {
    localStorage.setItem("medusa_auth_token", token);

    const existing = await this.getCustomer();
    if (existing) return { customer: existing, created: false };

    const parts = (user.name || "").split(" ");
    const { customer } = await ensureClient().store.customer.create(
      {
        email: user.email,
        first_name: parts[0] || "",
        last_name: parts.slice(1).join(" ") || "",
      },
      {},
      { Authorization: `Bearer ${token}` }
    );
    return { customer, created: true };
  },

  async clearAuth() {
    localStorage.removeItem("medusa_auth_token");
  },
};

