import { useState, useEffect, useCallback } from 'react';
import { medusaStore } from './medusa';
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
    try {
      const { products } = await medusaStore.products.list({
        limit: 100,
        order: '-created_at',
      });
      const cats = buildCategoriesFromProducts(products);
      setCategories(cats);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch products from Medusa:', err);
      setError('Failed to load products. Is the backend running?');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, loading, error, refetch };
}
