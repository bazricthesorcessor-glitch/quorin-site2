import type { Product } from '@/data/products';

export interface AiCommerceEvidence { type: 'catalog' | 'price' | 'policy' | 'review' | 'brand'; source: string; observed_at: string; }
export interface AiProductRecord { id: string; name: string; description: string; category: string; price: { amount: number; currency: 'INR' }; availability: 'in_stock' | 'out_of_stock' | 'unknown'; image?: string; evidence: AiCommerceEvidence[]; }
const text = (value: unknown) => typeof value === 'string' ? value : '';
const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : 0;

export function toAiProductRecord(product: Product): AiProductRecord {
  const source = product as unknown as Record<string, unknown>;
  const observed_at = new Date().toISOString();
  const name = text(source.name) || text(source.title) || 'Untitled product';
  return {
    id: text(source.id) || text(source.handle) || text(source.slug) || name,
    name,
    description: text(source.description) || text(source.shortDescription),
    category: text(source.category) || text(source.categoryName) || 'Uncategorized',
    price: { amount: number(source.price) || number(source.salePrice) || number(source.basePrice), currency: 'INR' },
    availability: 'unknown',
    image: text(source.image) || text(source.thumbnail) || undefined,
    evidence: [
      { type: 'catalog', source: 'QUORIN canonical storefront catalog', observed_at },
      { type: 'price', source: 'QUORIN canonical storefront catalog', observed_at },
    ],
  };
}

export interface AiRecommendationRequest { intent: string; experience?: 'beginner' | 'intermediate' | 'advanced'; budget?: number; category?: string; }

export function recommendForAi(products: Product[], request: AiRecommendationRequest) {
  const intent = request.intent.trim().toLowerCase();
  return products.map((product) => {
    const record = toAiProductRecord(product);
    const haystack = `${record.name} ${record.description} ${record.category}`.toLowerCase();
    let score = 0; const reasons: string[] = [];
    for (const token of intent.split(/\s+/).filter((token) => token.length > 2)) if (haystack.includes(token)) score += 2;
    if (request.category && record.category.toLowerCase().includes(request.category.toLowerCase())) { score += 4; reasons.push(`Matches requested category: ${request.category}.`); }
    if (request.budget && record.price.amount > 0 && record.price.amount <= request.budget) { score += 2; reasons.push('Within the stated budget.'); }
    if (score > 0 && reasons.length === 0) reasons.push('Catalog text overlaps with the stated intent.');
    return { product: record, score, reasons };
  }).filter((result) => result.score > 0).sort((a, b) => b.score - a.score || a.product.price.amount - b.product.price.amount);
}
