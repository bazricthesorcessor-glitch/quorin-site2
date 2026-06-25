import { useState, useEffect, useCallback } from 'react';
import { medusaApi } from './medusa';
import { buildCategoriesFromProducts } from './medusa-product-map';
import type { Category } from '@/data/products';

export interface MedusaCatalogState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMedusaCatalog(): MedusaCatalogState {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('[Medusa] Starting catalog fetch...');
    try {
      const { products } = await medusaApi.getProducts({
        limit: 100,
        order: '-created_at',
      });
      console.log('[Medusa] Fetched', products?.length || 0, 'products');
      const cats = buildCategoriesFromProducts(products || []);
      console.log('[Medusa] Built', cats.length, 'categories:', cats.map(c => c.id));
      setCategories(cats);
      setLoading(false);
    } catch (err) {
      console.error('[Medusa] Failed to fetch products from Medusa:', err);
      setError('Failed to load products. Is the backend running?');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, loading, error, refetch };
}
