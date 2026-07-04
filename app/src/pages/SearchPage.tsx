import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowLeft, Clock, TrendingUp, ChevronRight, ShoppingCart } from 'lucide-react';
import { quorinData, getProductId, type Product } from '@/data/products';
import { toast } from 'sonner';

interface SearchPageProps {
  onAddToCart: (product: Product) => void;
}

export default function SearchPage({ onAddToCart }: SearchPageProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem('quorin.recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save recent searches helper
  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter((t) => t !== cleanTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('quorin.recent_searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('quorin.recent_searches');
    toast.success('Recent searches cleared');
  };

  const popularSearches = ['Resin Kit', 'Mica Pigment', 'Soap Base', 'Silicone Mold', 'Candle Wax'];

  const allProducts = quorinData.categories.flatMap((c) => c.products);

  // Filter products based on search term
  const results = query.trim()
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
          (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleSearchSubmit = (term: string) => {
    if (!term.trim()) return;
    addRecentSearch(term);
    setQuery(term);
  };

  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      const img = product.images[0];
      return typeof img === 'string' ? img : img?.url || 'http://localhost:9000/product-resin-kit.webp';
    }
    return 'http://localhost:9000/product-resin-kit.webp';
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-24">
      {/* Top Search Bar Header */}
      <div className="sticky top-0 bg-[var(--color-background)]/90 backdrop-blur-md z-30 px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 relative flex items-center">
          <Search size={18} className="absolute left-3 text-[var(--color-text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search premium craft supplies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit(query);
            }}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] text-[var(--color-text-primary)] shadow-sm"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 rounded-full bg-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        <AnimatePresence mode="wait">
          {!query.trim() ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              key="suggestions"
            >
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase">
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-[var(--color-accent)] font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(term);
                          addRecentSearch(term);
                        }}
                        className="flex items-center gap-3 py-2 text-sm text-[var(--color-text-primary)] hover:text-[var(--color-accent)] text-left"
                      >
                        <Clock size={16} className="text-[var(--color-text-muted)]" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="mb-8">
                <h3 className="text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-4">
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(term);
                        addRecentSearch(term);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all font-medium"
                    >
                      <TrendingUp size={12} className="text-[var(--color-accent)]" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-3">
                  Browse Categories
                </h3>
                <div className="flex flex-col rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-hidden shadow-sm">
                  {quorinData.categories.map((cat, idx) => (
                    <button
                      key={cat.id}
                      onClick={() => navigate(`/category/${cat.id}`)}
                      className={`flex items-center justify-between p-4 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors text-left ${
                        idx < quorinData.categories.length - 1 ? 'border-b border-[var(--color-border-subtle)]' : ''
                      }`}
                    >
                      <span className="font-semibold">{cat.title}</span>
                      <ChevronRight size={16} className="text-[var(--color-text-muted)]" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              key="results"
            >
              <div className="mb-4">
                <p className="text-xs text-[var(--color-text-muted)] font-medium">
                  Showing {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                </p>
              </div>

              {results.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {results.map((product) => (
                    <div
                      key={getProductId(product)}
                      onClick={() => navigate(`/product/${encodeURIComponent(getProductId(product))}`)}
                      className="flex items-center gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl cursor-pointer hover:border-[var(--color-accent)] transition-colors shadow-sm"
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-[var(--color-background)]"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                          {product.name}
                        </h4>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {product.category}
                        </p>
                        <p className="text-sm font-bold text-[var(--color-text-primary)] mt-1">
                          ₹{product.price}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                          addRecentSearch(query);
                          toast.success(`Added ${product.name} to cart!`);
                        }}
                        className="p-2.5 rounded-full bg-[var(--color-accent-soft)] hover:bg-[var(--color-accent)] text-[var(--color-accent)] hover:text-white transition-colors"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-sm text-[var(--color-text-muted)] font-medium">
                    No products found matching "{query}"
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Try searching for another craft supply.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
