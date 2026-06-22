import type { Product } from './products';

const CATEGORY_SLUG_MAP: Record<string, string> = {
  'resin-kit': 'resin-art',
  'pigments': 'resin-art',
  'eco-resin': 'resin-art',
  'tools': 'resin-art',
  'drill': 'resin-art',
  'candle-color': 'candle-making',
  'wicks': 'candle-making',
  'torch': 'candle-making',
  'fragrance-oil': 'candle-making',
  'soap-color': 'soap-making',
  'glitter': 'resin-art',
  'geode-art': 'resin-art',
};

const CATEGORY_INFO: Record<string, { title: string; description: string }> = {
  'resin-art': {
    title: 'Resin Art',
    description: 'Crystal clear epoxy resins, vibrant pigments, and professional tools for creating stunning resin masterpieces.',
  },
  'candle-making': {
    title: 'Candle Making',
    description: 'Premium waxes, fragrances, wicks, and colours to craft beautiful, aromatic candles at home.',
  },
  'soap-making': {
    title: 'Soap Making',
    description: 'Everything you need to create beautiful handmade soaps — colours, fragrances, molds, and more.',
  },
};

const defaultImage = '/product-resin-kit.jpg';

interface MedusaVariant {
  id: string;
  title?: string;
  options?: Record<string, string | number>;
  allow_zero_price: boolean;
  prices: Array<{ currency_code: string; amount: number }>;
}

interface MedusaProductImage {
  id: string;
  url: string;
  is_primary?: boolean;
}

interface MedusaProduct {
  id: string;
  title: string;
  description?: string;
  images?: MedusaProductImage[];
  variants: MedusaVariant[];
  tags?: Array<{ id: string; value: string }>;
  sales_channels?: Array<{ id: string; name: string }>;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getCategoryFromProduct(product: MedusaProduct): string {
  const tags = product.tags?.map((t) => t.value.toLowerCase()) ?? [];
  for (const [slug, category] of Object.entries(CATEGORY_SLUG_MAP)) {
    if (tags.some((t) => t.includes(slug))) {
      return category;
    }
  }
  const title = product.title.toLowerCase();
  if (title.includes('resin') || title.includes('pigment') || title.includes('eco') || title.includes('tool') || title.includes('drill') || title.includes('glitter') || title.includes('glass')) {
    return 'resin-art';
  }
  if (title.includes('candle') || title.includes('wick') || title.includes('torch') || title.includes('fragrance')) {
    return 'candle-making';
  }
  if (title.includes('soap')) {
    return 'soap-making';
  }
  return 'resin-art';
}

function getPrimaryImageUrl(images: MedusaProductImage[] | undefined): string {
  if (!images || images.length === 0) return defaultImage;
  const primary = images.find((img) => img.is_primary);
  if (primary) {
    const url = primary.url;
    if (url.startsWith('http')) return url;
  }
  const first = images[0];
  const url = first.url;
  if (url.startsWith('http')) return url;
  return `https:${url}`;
}

function getVariantInfo(variants: MedusaVariant[]) {
  const prices = variants.flatMap((v) =>
    v.prices.map((p) => ({ variantId: v.id, amount: p.amount, currency: p.currency_code }))
  );
  const cheapest = prices.reduce(
    (min, p) => (p.amount < min.amount ? p : min),
    prices[0] ?? { amount: 0, currency: 'inr' }
  );
  const primaryVariant = variants[0];
  const variantTitle = primaryVariant?.title ?? 'Default';
  const variantOptions = primaryVariant?.options ?? {};
  let size: string | undefined;
  let variantLabel: string | undefined;
  if (variantOptions.size) {
    size = String(variantOptions.size);
  }
  if (variantTitle && variantTitle !== 'Default Title') {
    variantLabel = variantTitle;
  }
  const mrp = Math.round(cheapest.amount * 1.8);
  const discount = mrp > 0 ? `${Math.round(((mrp - cheapest.amount) / mrp) * 100)}%` : '0%';
  return {
    price: cheapest.amount,
    mrp,
    discount,
    variantId: cheapest.variantId,
    variantLabel,
    size,
  };
}

function mapFeatures(description: string | undefined): string[] | undefined {
  if (!description) return undefined;
  const featureKeywords = [
    'UV Resistant', 'High Gloss Finish', 'Smooth Finish', 'Easy to Use',
    'Crystal Clear', 'Highly Concentrated', 'Smooth Mixing', 'Vibrant Colors',
    'Water Based', '2:1 Formula', 'Low Odor', 'Craft Friendly',
    'Long Lasting Aroma', 'Home Fragrance', 'Beginner Friendly',
    'Includes Mold', 'DIY Gifting',
  ];
  const found: string[] = [];
  for (const keyword of featureKeywords) {
    if (description.toLowerCase().includes(keyword.toLowerCase())) {
      found.push(keyword);
    }
  }
  return found.length > 0 ? found : undefined;
}

export function mapMedusaProduct(product: MedusaProduct): Product {
  const { price, mrp, discount, variantLabel, size } = getVariantInfo(product.variants);
  const tags = product.tags?.map((t) => t.value.toLowerCase()) ?? [];
  const category = getCategoryFromProduct(product);
  const features = mapFeatures(product.description);
  const images = product.images ? product.images.map((img) => getPrimaryImageUrl([img])) : [defaultImage];

  return {
    name: product.title,
    variant: variantLabel,
    size,
    price,
    mrp,
    discount,
    description: product.description,
    images: images.length > 0 ? images : [defaultImage],
    features,
    tags: [...new Set([...tags, category])],
    type: tags[0] ?? slugify(product.title),
  };
}

export function buildCategoriesFromProducts(medusaProducts: MedusaProduct[]) {
  const categoryMap = new Map<string, { products: Product[]; title: string; description: string }>();
  for (const product of medusaProducts) {
    const category = getCategoryFromProduct(product);
    if (!categoryMap.has(category)) {
      const info = CATEGORY_INFO[category] ?? { title: category, description: '' };
      categoryMap.set(category, { products: [], title: info.title, description: info.description });
    }
    const entry = categoryMap.get(category)!;
    entry.products.push(mapMedusaProduct(product));
  }
  const order = ['resin-art', 'candle-making', 'soap-making'];
  return order
    .filter((id) => categoryMap.has(id))
    .map((id) => ({
      id,
      ...categoryMap.get(id)!,
    }));
}
