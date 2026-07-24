import Client from "@medusajs/js-sdk";

const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000";

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

  async createCustomer(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    try {
      const token = await ensureClient().auth.register(
        "customer",
        "emailpass",
        {
          email: data.email,
          password: data.password,
        }
      );

      if (typeof token !== "string") {
        throw new Error("Registration requires additional authentication steps.");
      }

      const { customer } = await ensureClient().store.customer.create(
        {
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
        },
        {},
        { Authorization: `Bearer ${token}` }
      );

      localStorage.setItem("medusa_auth_token", token);

      return { success: true, customer, token };
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

  async googleAuthCallback(search: string) {
    const callbackUrl =
      `${MEDUSA_BACKEND_URL}/auth/customer/google/callback${search}`;

    const res = await fetch(callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY ?? "",
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.token) {
      throw new Error(
        data?.message || "Google authentication callback failed."
      );
    }

    let token = data.token as string;

    localStorage.setItem("medusa_auth_token", token);
    ensureClient().client.setToken(token);

    const decodeJwt = (jwt: string) => {
      const payload = jwt.split(".")[1];

      if (!payload) {
        throw new Error("Invalid authentication token.");
      }

      const normalized = payload
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const decoded = decodeURIComponent(
        atob(normalized)
          .split("")
          .map(
            (character) =>
              "%" +
              character
                .charCodeAt(0)
                .toString(16)
                .padStart(2, "0")
          )
          .join("")
      );

      return JSON.parse(decoded) as {
        actor_id?: string;
        user_metadata?: {
          email?: string;
          name?: string;
          given_name?: string;
          family_name?: string;
          picture?: string;
        };
      };
    };

    const decoded = decodeJwt(token);
    const metadata = decoded.user_metadata ?? {};

    if (!decoded.actor_id) {
      if (!metadata.email) {
        throw new Error(
          "Google did not provide an email address."
        );
      }

      const fullName = metadata.name?.trim() ?? "";
      const nameParts = fullName.split(/\s+/).filter(Boolean);

      const firstName =
        metadata.given_name ||
        nameParts[0] ||
        "";

      const lastName =
        metadata.family_name ||
        nameParts.slice(1).join(" ") ||
        "";

      const createResponse = await fetch(
        `${MEDUSA_BACKEND_URL}/store/customers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-publishable-api-key": PUBLISHABLE_KEY ?? "",
          },
          body: JSON.stringify({
            email: metadata.email,
            first_name: firstName,
            last_name: lastName,
            metadata: {
              google_picture: metadata.picture ?? "",
            },
          }),
        }
      );

      const createData = await createResponse
        .json()
        .catch(() => null);

      if (!createResponse.ok) {
        throw new Error(
          createData?.message ||
            "Could not create the Google customer."
        );
      }

      const refreshResponse = await fetch(
        `${MEDUSA_BACKEND_URL}/auth/token/refresh`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const refreshData = await refreshResponse
        .json()
        .catch(() => null);

      if (!refreshResponse.ok || !refreshData?.token) {
        throw new Error(
          refreshData?.message ||
            "Could not refresh the Google login token."
        );
      }

      token = refreshData.token;

      localStorage.setItem("medusa_auth_token", token);
      ensureClient().client.setToken(token);
    }

    const customerResponse = await fetch(
      `${MEDUSA_BACKEND_URL}/store/customers/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY ?? "",
        },
      }
    );

    const customerData = await customerResponse
      .json()
      .catch(() => null);

    if (!customerResponse.ok || !customerData?.customer) {
      throw new Error(
        customerData?.message ||
          "Could not load your customer account."
      );
    }

    return {
      token,
      customer: customerData.customer,
      user: {
        email:
          customerData.customer.email ||
          metadata.email ||
          "",
        name:
          [
            customerData.customer.first_name,
            customerData.customer.last_name,
          ]
            .filter(Boolean)
            .join(" ") ||
          metadata.name ||
          metadata.email ||
          "",
        picture: metadata.picture || "",
      },
    };
  },

  async clearAuth() {
    localStorage.removeItem("medusa_auth_token");
  },
};

