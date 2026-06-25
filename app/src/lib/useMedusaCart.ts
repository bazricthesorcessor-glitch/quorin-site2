import { useState, useEffect, useCallback, useRef } from 'react';
import { medusaApi } from './medusa';

export interface CartItem {
  cartId: string;
  lineId: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  mrp: number;
  quantity: number;
  image?: string;
}

export interface MedusaCartState {
  cart: CartItem[];
  cartId: string | null;
  loading: boolean;
  error: string | null;
  addItem: (productId: string, variantId: string, name: string, price: number, mrp: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const STORAGE_KEY = 'quorin_medusa_cart_id';

function mapCartLineToItem(line: {
  id: string;
  cart_id: string;
  variant_id: string;
  product_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  variant?: {
    id: string;
    title?: string;
    product?: { title?: string };
    prices?: Array<{ currency_code: string; amount: number }>;
    images?: Array<{ url: string; is_primary?: boolean }>;
  };
}): CartItem {
  const unitPrice = line.unit_price;
  const mrp = Math.round(unitPrice * 1.8);
  const images = line.variant?.images;
  let image = '';
  if (images && images.length > 0) {
    const primary = images.find((i) => i.is_primary);
    const img = primary ?? images[0];
    image = img.url.startsWith('http') ? img.url : `https:${img.url}`;
  }
  return {
    cartId: line.cart_id,
    lineId: line.id,
    productId: line.product_id,
    variantId: line.variant_id,
    name: line.title || line.variant?.product?.title || 'Product',
    price: unitPrice,
    mrp,
    quantity: line.quantity,
    image,
  };
}

export function useMedusaCart(): MedusaCartState {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!cartId) return;
    setLoading(true);
    setError(null);
    try {
      const { cart } = await medusaApi.getCart(cartId);
      const items = (cart.items || []).map(mapCartLineToItem);
      setCart(items);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [cartId]);

  const createOrLoadCart = useCallback(async (): Promise<string> => {
    if (cartId) {
      return cartId;
    }
    const { cart } = await medusaApi.createCart();
    setCartId(cart.id);
    localStorage.setItem(STORAGE_KEY, cart.id);
    return cart.id;
  }, [cartId]);

  const addItem = useCallback(
    async (_productId: string, variantId: string, _name: string, _price: number, _mrp: number) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      try {
        let targetCartId = cartId;
        if (!targetCartId) {
          targetCartId = await createOrLoadCart();
        }
        await medusaApi.addCartItem(targetCartId, variantId, 1);
        await refresh();
      } catch (err) {
        console.error('Failed to add item to cart:', err);
        setError('Failed to add item to cart');
      } finally {
        pendingRef.current = false;
      }
    },
    [cartId, createOrLoadCart, refresh]
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItem(lineId);
        return;
      }
      if (!cartId) return;
      try {
        await medusaApi.updateCartItem(cartId, lineId, quantity);
        await refresh();
      } catch (err) {
        console.error('Failed to update cart item:', err);
        setError('Failed to update cart item');
      }
    },
    [cartId, refresh]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cartId) return;
      try {
        await medusaApi.removeCartItem(cartId, lineId);
        await refresh();
      } catch (err) {
        console.error('Failed to remove cart item:', err);
        setError('Failed to remove cart item');
      }
    },
    [cartId, refresh]
  );

  useEffect(() => {
    if (cartId) {
      refresh();
    } else {
      setLoading(false);
    }
  }, [cartId, refresh]);

  return { cart, cartId, loading, error, addItem, updateItem, removeItem, refresh };
}
