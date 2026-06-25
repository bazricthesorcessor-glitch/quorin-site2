import Client from "@medusajs/js-sdk";

const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000";

const client = new Client({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || "pk_d24dd21f67e355e5c0b962f86f8402379a26d67a85eab02334b201085f563b62",
});

export const medusaApi = {
  async getProducts(params = {}) {
    try {
      const { products } = await client.store.product.list({
        ...params,
        fields: "id,title,handle,description,tags,variants.calculated_price,variants.prices,variants.id,variants.title,variants.options,variants.sku,variants.manage_inventory,variants.allow_backorder,variants.thumbnail,variants.inventory_quantity,images",
      });
      return { products };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async getProduct(id: string) {
    try {
      const { product } = await client.store.product.retrieve(id);
      return { product };
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  async createProduct(data: Record<string, unknown>) {
    try {
      const { product } = await client.admin.product.create(data);
      return { product };
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  async updateProduct(id: string, data: Record<string, unknown>) {
    try {
      const { product } = await client.admin.product.update(id, data);
      return { product };
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    try {
      await client.admin.product.delete(id);
      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  async getRegions() {
    try {
      const { regions } = await client.store.region.list();
      return { regions };
    } catch (error) {
      console.error("Error fetching regions:", error);
      throw error;
    }
  },

  async createCart() {
    try {
      const { cart } = await client.store.cart.create({});
      return { cart };
    } catch (error) {
      console.error("Error creating cart:", error);
      throw error;
    }
  },

  async getCart(id: string) {
    try {
      const { cart } = await client.store.cart.retrieve(id);
      return { cart };
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  },

  async addCartItem(cartId: string, variantId: string, quantity: number = 1) {
    try {
      const { cart } = await client.store.cart.createLineItem(cartId, {
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
      const { cart } = await client.store.cart.updateLineItem(cartId, itemId, {
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
      const { deleted } = await client.store.cart.deleteLineItem(cartId, itemId);
      return { deleted, success: true };
    } catch (error) {
      console.error("Error removing cart item:", error);
      throw error;
    }
  },

  async updateCart(cartId: string, data: Record<string, unknown>) {
    try {
      const { cart } = await client.store.cart.update(cartId, data);
      return { cart };
    } catch (error) {
      console.error("Error updating cart:", error);
      throw error;
    }
  },

  async completeCart(cartId: string) {
    try {
      const result = await client.store.cart.complete(cartId);
      return result;
    } catch (error) {
      console.error("Error completing cart:", error);
      throw error;
    }
  },

  async createCustomer(data: { email: string; password: string }) {
    try {
      const token = await client.auth.register("customer", "emailpass", {
        email: data.email,
        password: data.password,
      });
      // Now create customer with token
      const { customer } = await client.store.customer.create(
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
      const result = await client.auth.login("customer", "emailpass", {
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
};

