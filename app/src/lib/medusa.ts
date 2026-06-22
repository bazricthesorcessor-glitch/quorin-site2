import { MedusaClient } from "@medusajs/js-sdk";

const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000";

export const medusaClient = new MedusaClient({
  url: MEDUSA_BACKEND_URL,
  auth: {
    token: localStorage.getItem("medusa_auth_token") || "",
  },
});

export const medusaApi = {
  // Products
  async getProducts(params = {}) {
    try {
      const { data } = await medusaClient.products.list(params);
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async getProduct(id: string) {
    try {
      const { data } = await medusaClient.products.retrieve(id);
      return data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  // Regions
  async getRegions() {
    try {
      const { data } = await medusaClient.regions.list();
      return data;
    } catch (error) {
      console.error("Error fetching regions:", error);
      throw error;
    }
  },

  // Cart
  async createCart() {
    try {
      const { data } = await medusaClient.carts.create();
      return data;
    } catch (error) {
      console.error("Error creating cart:", error);
      throw error;
    }
  },

  async getCart(id: string) {
    try {
      const { data } = await medusaClient.carts.retrieve(id);
      return data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  },

  async addCartItem(cartId: string, variantId: string, quantity: number = 1) {
    try {
      const { data } = await medusaClient.carts.createLineItem(cartId, {
        variant_id: variantId,
        quantity,
      });
      return data;
    } catch (error) {
      console.error("Error adding cart item:", error);
      throw error;
    }
  },

  async updateCartItem(cartId: string, itemId: string, quantity: number) {
    try {
      const { data } = await medusaClient.carts.updateLineItem(cartId, itemId, {
        quantity,
      });
      return data;
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  },

  async removeCartItem(cartId: string, itemId: string) {
    try {
      await medusaClient.carts.deleteLineItem(cartId, itemId);
      return { success: true };
    } catch (error) {
      console.error("Error removing cart item:", error);
      throw error;
    }
  },

  async updateCart(cartId: string, data: Record<string, unknown>) {
    try {
      const { data: updatedCart } = await medusaClient.carts.update(cartId, data);
      return updatedCart;
    } catch (error) {
      console.error("Error updating cart:", error);
      throw error;
    }
  },

  // Orders
  async completeCart(cartId: string) {
    try {
      const { data } = await medusaClient.carts.complete(cartId);
      return data;
    } catch (error) {
      console.error("Error completing cart:", error);
      throw error;
    }
  },

  // Customer
  async createCustomer(data: { email: string; password: string }) {
    try {
      await medusaClient.auth.createCustomerEmailPassAccount(data);
      return { success: true };
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  async authenticate(email: string, password: string) {
    try {
      const { data } = await medusaClient.auth.createCustomerEmailPassAccount({
        email,
        password,
      });
      if (data?.token) {
        localStorage.setItem("medusa_auth_token", data.token);
        medusaClient.auth.updateToken(data.token);
      }
      return data;
    } catch (error) {
      console.error("Error authenticating:", error);
      throw error;
    }
  },
};
