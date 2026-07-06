import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Clock, TrendingUp, ChevronRight,
  ShoppingCart, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronUp
} from 'lucide-react';
import { quorinData, getProductId, type Product } from '@/data/products';
import { toast } from 'sonner';

interface SearchPageProps {
  onAddToCart: (product: Product) => void;
}

const BRANDS = ['QUORIN', 'Generic', 'Others'];

export default function SearchPage({ onAddToCart }: SearchPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [priceExpanded, setPriceExpanded] = useState(true);
  const [brandExpanded, setBrandExpanded] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const PER_PAGE = 10;

  useEffect(() => {
    try {
      const stored = localStorage.getItem('quorin.recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

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

  const allProducts = useMemo(
    () => quorinData.categories.flatMap((c) => c.products),
    []
  );

  // Count products per category
  const categoryCounts = useMemo(() => {
    const matchingProducts = query.trim()
      ? allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
            (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
        )
      : allProducts;
    
    const counts: Record<string, number> = {};
    quorinData.categories.forEach((cat) => {
      counts[cat.id] = matchingProducts.filter((p) => p.category === cat.id).length;
    });
    counts['all'] = matchingProducts.length;
    return counts;
  }, [query, allProducts]);

  // Count products per brand
  const brandCounts = useMemo(() => {
    const matchingProducts = query.trim()
      ? allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
            (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
        )
      : allProducts;
    
    const counts: Record<string, number> = {};
    counts['QUORIN'] = matchingProducts.filter((p) => p.name.startsWith('QUORIN')).length;
    counts['Generic'] = matchingProducts.filter((p) => !p.name.startsWith('QUORIN')).length;
    counts['Others'] = matchingProducts.filter((p) => !p.name.startsWith('QUORIN') && !p.name.startsWith('Generic')).length;
    return counts;
  }, [query, allProducts]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return allProducts
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
  }, [query, allProducts]);

  const results = useMemo(() => {
    let filtered = query.trim()
      ? allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
            (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
        )
      : [];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category));
    }
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => {
        if (selectedBrands.includes('QUORIN') && p.name.startsWith('QUORIN')) return true;
        if (selectedBrands.includes('Generic') && !p.name.startsWith('QUORIN')) return true;
        return false;
      });
    }
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (sortBy === 'price-low') return [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') return [...filtered].sort((a, b) => b.price - a.price);
    if (sortBy === 'name') return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [query, selectedCategories, selectedBrands, priceRange, sortBy, allProducts]);

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const paginatedResults = results.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [query, selectedCategories, selectedBrands, priceRange, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 2000]);
    setSelectedBrands([]);
  };

  const hasFilters = selectedCategories.length > 0 || selectedBrands.length > 0 ||
    priceRange[0] > 0 || priceRange[1] < 2000;

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

  // Dual range slider handler
  const handleRangeChange = useCallback((type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      setPriceRange([Math.min(value, priceRange[1]), priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], Math.max(value, priceRange[0])]);
    }
  }, [priceRange]);

  const visibleCategories = showMoreCategories
    ? quorinData.categories
    : quorinData.categories.slice(0, 6);

  const FiltersSidebar = () => (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-5 space-y-1">
      {/* Categories */}
      <div>
        <button
          onClick={() => setCategoriesExpanded(!categoriesExpanded)}
          className="flex items-center justify-between w-full py-3"
        >
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Categories
          </h3>
          {categoriesExpanded ? (
            <ChevronUp size={16} className="text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
          )}
        </button>
        {categoriesExpanded && (
          <div className="space-y-3 pb-4">
            {/* All Categories */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedCategories.length === 0}
                  onChange={() => setSelectedCategories([])}
                  className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                <span className="text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                  All Categories
                </span>
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">({categoryCounts['all'] || 0})</span>
            </label>
            {visibleCategories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  <span className="text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                    {cat.title}
                  </span>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">({categoryCounts[cat.id] || 0})</span>
              </label>
            ))}
            {quorinData.categories.length > 6 && (
              <button
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mt-1"
              >
                {showMoreCategories ? 'Show less' : 'Show more'}
                <ChevronDown size={14} className={`transition-transform ${showMoreCategories ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--color-border-subtle)]" />

      {/* Price Range */}
      <div>
        <button
          onClick={() => setPriceExpanded(!priceExpanded)}
          className="flex items-center justify-between w-full py-3"
        >
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Price Range
          </h3>
          {priceExpanded ? (
            <ChevronUp size={16} className="text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
          )}
        </button>
        {priceExpanded && (
          <div className="pb-4 space-y-4">
            {/* Dual range slider */}
            <div className="relative h-6 flex items-center px-1">
              <div className="absolute left-1 right-1 h-1 bg-[var(--color-border)] rounded-full" />
              <div
                className="absolute h-1 bg-[var(--color-accent)] rounded-full"
                style={{
                  left: `${(priceRange[0] / 2000) * 100}%`,
                  right: `${100 - (priceRange[1] / 2000) * 100}%`,
                }}
              />
              <input
                type="range"
                min={0}
                max={2000}
                step={10}
                value={priceRange[0]}
                onChange={(e) => handleRangeChange('min', Number(e.target.value))}
                className="absolute w-full h-6 opacity-0 cursor-pointer z-10"
                style={{ pointerEvents: 'auto' }}
              />
              <input
                type="range"
                min={0}
                max={2000}
                step={10}
                value={priceRange[1]}
                onChange={(e) => handleRangeChange('max', Number(e.target.value))}
                className="absolute w-full h-6 opacity-0 cursor-pointer z-10"
                style={{ pointerEvents: 'auto' }}
              />
              {/* Thumb indicators */}
              <div
                className="absolute w-4 h-4 rounded-full bg-white border-2 border-[var(--color-accent)] shadow-sm z-20 pointer-events-none"
                style={{ left: `calc(${(priceRange[0] / 2000) * 100}% - 8px)` }}
              />
              <div
                className="absolute w-4 h-4 rounded-full bg-white border-2 border-[var(--color-accent)] shadow-sm z-20 pointer-events-none"
                style={{ left: `calc(${(priceRange[1] / 2000) * 100}% - 8px)` }}
              />
            </div>
            {/* Min/Max inputs */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-surface)]">
                <span className="pl-3 text-xs text-[var(--color-text-muted)]">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full bg-transparent px-2 py-2 text-sm text-[var(--color-text-primary)] outline-none"
                />
              </div>
              <span className="text-[var(--color-text-muted)] text-xs">–</span>
              <div className="flex-1 flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-surface)]">
                <span className="pl-3 text-xs text-[var(--color-text-muted)]">₹</span>
                <input
                  type="number"
                  placeholder="2000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full bg-transparent px-2 py-2 text-sm text-[var(--color-text-primary)] outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[var(--color-border-subtle)]" />

      {/* Brand */}
      <div>
        <button
          onClick={() => setBrandExpanded(!brandExpanded)}
          className="flex items-center justify-between w-full py-3"
        >
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Brand
          </h3>
          {brandExpanded ? (
            <ChevronUp size={16} className="text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
          )}
        </button>
        {brandExpanded && (
          <div className="space-y-3 pb-4">
            {BRANDS.map((brand) => (
              <label
                key={brand}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  <span className="text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                    {brand}
                  </span>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">({brandCounts[brand] || 0})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear all filters */}
      {hasFilters && (
        <>
          <div className="border-t border-[var(--color-border-subtle)]" />
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 w-full py-3 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            Clear all filters
            <X size={14} />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-24">
      {/* Top Search Bar — centered like image4 */}
      <div className="bg-[var(--color-background)] px-4 lg:px-8 pt-6 pb-4">
        <div className="max-w-[1400px] mx-auto flex items-center gap-4">
          <div className="flex-1 relative flex items-center">
            <Search size={20} className="absolute left-4 text-[var(--color-text-muted)] z-10" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                setSelectedSuggestionIndex(-1);
              }}
              onFocus={() => query.trim() && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (showSuggestions && selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
                    const selected = suggestions[selectedSuggestionIndex];
                    setQuery(selected.name);
                    addRecentSearch(selected.name);
                  } else {
                    handleSearchSubmit(query);
                  }
                  setShowSuggestions(false);
                  inputRef.current?.blur();
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedSuggestionIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedSuggestionIndex((prev) => Math.max(prev - 1, -1));
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false);
                  setSelectedSuggestionIndex(-1);
                }
              }}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full py-3.5 pl-12 pr-12 text-base focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] text-[var(--color-text-primary)] shadow-sm"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-4 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            )}
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden z-50"
              >
                {suggestions.map((product, index) => (
                  <button
                    key={getProductId(product)}
                    onClick={() => {
                      setQuery(product.name);
                      addRecentSearch(product.name);
                      setShowSuggestions(false);
                    }}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                      index === selectedSuggestionIndex
                        ? 'bg-[var(--color-surface-hover)] text-[var(--color-accent)]'
                        : 'text-[var(--color-text-primary)]'
                    }`}
                  >
                    <Search size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    <span className="truncate font-medium">{product.name}</span>
                    <span className="ml-auto text-xs text-[var(--color-text-muted)] flex-shrink-0">₹{product.price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Filters toggle button — desktop + mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 mt-4">
        <AnimatePresence mode="wait">
          {!query.trim() ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              key="suggestions"
            >
              {recentSearches.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase">
                      Recent Searches
                    </h3>
                    <button onClick={clearRecentSearches} className="text-xs text-[var(--color-accent)] font-medium">
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => { setQuery(term); addRecentSearch(term); }}
                        className="flex items-center gap-3 py-2 text-sm text-[var(--color-text-primary)] hover:text-[var(--color-accent)] text-left"
                      >
                        <Clock size={16} className="text-[var(--color-text-muted)]" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-4">
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => { setQuery(term); addRecentSearch(term); }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all font-medium"
                    >
                      <TrendingUp size={12} className="text-[var(--color-accent)]" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-3">
                  Browse Categories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {quorinData.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => navigate(`/category/${cat.id}`)}
                      className="flex items-center justify-between p-4 lg:p-5 text-sm lg:text-base text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-all rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-sm text-left"
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
              {results.length > 0 ? (
                <div className="flex gap-6">
                  {/* Filters Sidebar — desktop only */}
                  <aside className="hidden lg:block w-[240px] flex-shrink-0">
                    <div className="sticky top-6">
                      <FiltersSidebar />
                    </div>
                  </aside>

                  {/* Mobile filter drawer */}
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.div
                        className="fixed inset-0 z-50 lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-[300px] bg-[var(--color-background)] p-5 overflow-y-auto"
                          initial={{ x: -300 }}
                          animate={{ x: 0 }}
                          exit={{ x: -300 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Filters</h2>
                            <button onClick={() => setSidebarOpen(false)} className="p-1">
                              <X size={18} />
                            </button>
                          </div>
                          <FiltersSidebar />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    {/* Toolbar — results count + sort */}
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-sm text-[var(--color-text-muted)] font-medium">
                        Showing <span className="font-bold text-[var(--color-text-primary)]">{results.length}</span> results for "<span className="font-bold text-[var(--color-text-primary)]">{query}</span>"
                      </p>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-[var(--color-text-muted)]">Sort by:</label>
                        <div className="relative">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg pl-3 pr-8 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] cursor-pointer"
                          >
                            <option value="relevance">Relevance</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Product Grid — 5 columns on xl */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
                      {paginatedResults.map((product) => (
                        <motion.div
                          key={getProductId(product)}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-[var(--color-border-hover)] hover:-translate-y-0.5 transition-all duration-200"
                          onClick={() => navigate(`/product/${encodeURIComponent(getProductId(product))}`)}
                        >
                          {/* Image */}
                          <div className="relative aspect-square bg-[var(--color-background)] overflow-hidden">
                            <img
                              src={getProductImage(product)}
                              alt={product.name}
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.dataset.fallback) {
                                  target.dataset.fallback = 'true';
                                  target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23f1f1f1"><rect width="200" height="200"/><text x="100" y="100" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="40" fill="%23ccc">📦</text></svg>';
                                }
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Cart button — top right of image like image4 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(product);
                                addRecentSearch(query);
                                toast.success(`Added ${product.name} to cart!`);
                              }}
                              className="absolute top-2.5 right-2.5 w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm hover:bg-[var(--color-accent)] hover:text-white hover:border-[var(--color-accent)]"
                            >
                              <ShoppingCart size={15} />
                            </button>
                          </div>

                          {/* Info */}
                          <div className="p-3.5">
                            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-2 leading-snug mb-1">
                              {product.name}
                            </h4>
                            <p className="text-xs text-[var(--color-text-muted)] mb-2">
                              {product.category}
                            </p>
                            <p className="text-base font-bold text-[var(--color-text-primary)]">
                              ₹{product.price}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-10">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-primary)] disabled:opacity-30 hover:bg-[var(--color-surface)] transition-colors"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                              page === currentPage
                                ? 'bg-[var(--color-structure)] text-white'
                                : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-primary)] disabled:opacity-30 hover:bg-[var(--color-surface)] transition-colors"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-[var(--color-text-muted)]" />
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] font-medium">
                    No products found matching "<span className="text-[var(--color-text-primary)]">{query}</span>"
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    Try adjusting your filters or search term.
                  </p>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-sm font-medium text-[var(--color-accent)] hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
