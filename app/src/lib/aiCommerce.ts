import type { Product } from '@/data/products';

export interface AiCommerceEvidence { type: 'catalog' | 'price' | 'availability' | 'policy' | 'review' | 'brand'; source: string; observed_at: string; }
export interface AiProductRecord { id: string; name: string; description: string; category: string; tags: string[]; price: { amount: number; currency: 'INR' }; availability: 'in_stock' | 'out_of_stock' | 'unknown'; stock?: number; image?: string; rating?: { average: number; count: number }; evidence: AiCommerceEvidence[]; }
const text = (value: unknown) => typeof value === 'string' ? value : '';
const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : 0;

export function toAiProductRecord(product: Product): AiProductRecord {
  const source = product as unknown as Record<string, unknown>;
  const observed_at = new Date().toISOString();
  const name = text(source.name) || text(source.title) || 'Untitled product';
  const stock = typeof product.stock === 'number' ? product.stock : undefined;
  const ratings = (product.reviews ?? []).map((review) => review.rating).filter((rating): rating is number => typeof rating === 'number');
  const evidence: AiCommerceEvidence[] = [
    { type: 'catalog', source: 'QUORIN canonical storefront catalog', observed_at },
    { type: 'price', source: 'QUORIN canonical storefront catalog', observed_at },
  ];
  if (stock !== undefined) evidence.push({ type: 'availability', source: 'QUORIN canonical storefront catalog stock field', observed_at });
  if (ratings.length) evidence.push({ type: 'review', source: 'QUORIN catalog review records', observed_at });
  return {
    id: text(source.id) || text(source.handle) || text(source.slug) || name,
    name,
    description: text(source.description) || text(source.shortDescription),
    category: text(source.category) || text(source.categoryName) || 'Uncategorized',
    tags: product.tags ?? [],
    price: { amount: number(source.price) || number(source.salePrice) || number(source.basePrice), currency: 'INR' },
    availability: stock === undefined ? 'unknown' : stock > 0 ? 'in_stock' : 'out_of_stock',
    stock,
    image: product.images_local?.[0] || product.images?.[0],
    rating: ratings.length ? { average: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length, count: ratings.length } : undefined,
    evidence,
  };
}

export interface AiRecommendationRequest { intent: string; experience?: 'beginner' | 'intermediate' | 'advanced'; budget?: number; category?: string; }

export function recommendForAi(products: Product[], request: AiRecommendationRequest) {
  const intent = request.intent.trim().toLowerCase();
  return products.map((product) => {
    const record = toAiProductRecord(product);
    const haystack = `${record.name} ${record.description} ${record.category} ${record.tags.join(' ')}`.toLowerCase();
    let score = 0; const reasons: string[] = [];
    for (const token of intent.split(/\s+/).filter((token) => token.length > 2)) if (haystack.includes(token)) score += 2;
    if (request.category && record.category.toLowerCase().includes(request.category.toLowerCase())) { score += 4; reasons.push(`Matches requested category: ${request.category}.`); }
    if (request.budget && record.price.amount > 0 && record.price.amount <= request.budget) { score += 2; reasons.push('Within the stated budget.'); }
    if (record.availability === 'out_of_stock') { score -= 100; reasons.push('Currently marked out of stock in the catalog.'); }
    if (record.rating && record.rating.count > 0) { score += Math.min(2, record.rating.average / 2.5); reasons.push(`Has ${record.rating.count} catalog review${record.rating.count === 1 ? '' : 's'} averaging ${record.rating.average.toFixed(1)}/5.`); }
    if (score > 0 && reasons.length === 0) reasons.push('Catalog text overlaps with the stated intent.');
    return { product: record, score, reasons };
  }).filter((result) => result.score > 0).sort((a, b) => b.score - a.score || a.product.price.amount - b.product.price.amount);
}
