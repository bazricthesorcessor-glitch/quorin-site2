export interface ProductReview {
  author: string;
  text?: string;
  comment?: string;
  date?: string;
  rating?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  images: string[];
  images_local?: string[];
  category: string;
  tags: string[];
  featured?: boolean;
  stock?: number;
  discount?: string;
  variantId?: string;
  variant?: string;
  size?: string;
  type?: string;
  features?: string[];
  costPrice?: number;
  reviews?: ProductReview[];
}

export interface Category {
  id: string;
  title: string;
  description: string;
  products: Product[];
}

export const quorinData: {
  brand: string;
  tagline: string;
  categories: Category[];
} = {
  brand: 'QUORIN',
  tagline: 'Made for Makers',
  categories: [
    {
      id: 'resin-art',
      title: 'Resin Art',
      description: 'Resin kits, pigments, tools, and finishing supplies for polished casts.',
      products: [
        {
          id: 'resin-kit',
          name: 'QUORIN Crystal Clear Epoxy Resin & Hardener',
          description: 'Two-part crystal clear epoxy resin system for art and crafts. UV resistant, high gloss finish, beginner friendly, and built for premium results.',
          price: 677,
          mrp: 1499,
          images: ['/PHOTOS/Resin/1.webp'],
          images_local: ['/PHOTOS/Resin/1.webp', '/PHOTOS/Resin/2.webp', '/PHOTOS/Resin/3.webp'],
          category: 'resin-art',
          tags: ['epoxy', 'resin', 'hardener', 'crystal clear'],
          featured: true,
          stock: 100,
          discount: '55%',
          variant: 'Starter Kit',
          size: '1kg',
          type: 'Resin Kit',
          features: ['Crystal Clear', 'UV Resistant', 'High Gloss'],
          reviews: [
            {
              author: 'Priya S.',
              rating: 5,
              date: '2025-12-15',
              text: 'Crystal clear finish! Used it for my resin coaster set and it turned out beautifully. Zero bubbles after torching.',
            },
            {
              author: 'Rahul K.',
              rating: 4,
              date: '2025-11-28',
              text: 'Good quality resin. Dries clear and hard. Takes pigment well.',
            },
          ],
        },
        {
          id: 'crushed-glass-pack',
          name: 'Crushed Glass Pack',
          description: 'Clear crushed glass for resin art with sharp sparkle and clean edges.',
          price: 299,
          mrp: 599,
          images: ['/PHOTOS/Crushed glass/main image/crushed glass.webp'],
          images_local: ['/PHOTOS/Crushed glass/main image/crushed glass.webp'],
          category: 'resin-art',
          tags: ['glitter', 'crushed glass', 'resin art', 'decorative'],
          stock: 80,
          discount: '50%',
          variant: '3mm Pack',
          features: ['Sparkle Finish', 'Fine Cut', 'Decorative'],
        },
        {
          id: 'deburring-system',
          name: 'Deburring System',
          description: 'Professional deburring tool for removing burrs and smoothing surfaces.',
          price: 1062,
          mrp: 1999,
          images: ['/PHOTOS/Deburring tool/1.jpg'],
          images_local: ['/PHOTOS/Deburring tool/1.jpg'],
          category: 'resin-art',
          tags: ['tools', 'deburring', 'surface finish', 'crafting'],
          stock: 40,
          discount: '47%',
          variant: 'Pro Tool',
          features: ['Precision Finish', 'Professional', 'Durable'],
        },
        {
          id: 'quorin-glitter-collection',
          name: 'Quorin Glitter Collection',
          description: 'Premium glitter powder for decorative crafting in multiple colors.',
          price: 213,
          mrp: 449,
          images: ['/PHOTOS/GLITTER/bold party/1.webp'],
          images_local: ['/PHOTOS/GLITTER/bold party/1.webp'],
          category: 'resin-art',
          tags: ['glitter', 'crafting', 'decorative', 'art'],
          stock: 120,
          discount: '52%',
          variant: 'Multi Pack',
          features: ['Color Rich', 'Decorative', 'Fine Powder'],
        },
        {
          id: 'resin-craft-drill-kit',
          name: 'Resin Craft Drill Kit',
          description: 'Hand drill with 4 bits for resin and craft work.',
          price: 170,
          mrp: 399,
          images: ['/PHOTOS/HAND DRILL WITH 4 BITS/hand drll.jpg'],
          images_local: ['/PHOTOS/HAND DRILL WITH 4 BITS/hand drll.jpg'],
          category: 'resin-art',
          tags: ['drill', 'hand drill', 'tools', 'crafting'],
          stock: 70,
          discount: '57%',
          variant: '4 Bit Set',
          features: ['Portable', 'Multi Bit', 'Craft Ready'],
        },
        {
          id: 'liquid-deco-paint',
          name: 'Quorin Liquid Deco Paint',
          description: 'Water-based liquid decorative paint for artistic applications.',
          price: 445,
          mrp: 899,
          images: ['/PHOTOS/Liquid deco paint/1.webp'],
          images_local: ['/PHOTOS/Liquid deco paint/1.webp'],
          category: 'resin-art',
          tags: ['pigments', 'paint', 'liquid', 'decorative'],
          stock: 90,
          discount: '51%',
          variant: 'Liquid Set',
          features: ['Smooth Flow', 'Vibrant', 'Water Based'],
        },
        {
          id: 'jewellery-mould-set',
          name: 'Jewellery Mould Set',
          description: 'Silicone moulds for making resin jewellery.',
          price: 478,
          mrp: 999,
          images: ['/PHOTOS/MOULDS COMBO/1/1.webp'],
          images_local: ['/PHOTOS/MOULDS COMBO/1/1.webp'],
          category: 'resin-art',
          tags: ['geode-art', 'resin mould', 'jewellery making', 'silicone'],
          stock: 60,
          discount: '52%',
          variant: 'Mould Combo',
          features: ['Flexible', 'Reusable', 'Jewellery'],
        },
        {
          id: 'neodymium-magnets-set',
          name: 'Neodymium Magnets Set',
          description: 'Strong round neodymium magnets in various sizes.',
          price: 378,
          mrp: 799,
          images: ['/PHOTOS/Magnets combo/1.webp'],
          images_local: ['/PHOTOS/Magnets combo/1.webp'],
          category: 'resin-art',
          tags: ['tools', 'magnets', 'hardware', 'strong'],
          stock: 95,
          discount: '53%',
          variant: 'Assorted Set',
          features: ['Strong Hold', 'Craft Ready', 'Assorted Sizes'],
        },
        {
          id: 'uv-resin-kit',
          name: 'UV Resin Kit',
          description: 'UV-curing resin kit for quick-cure crafting and nail art.',
          price: 564,
          mrp: 1199,
          images: ['/PHOTOS/UV Resin combo/1.webp'],
          images_local: ['/PHOTOS/UV Resin combo/1.webp'],
          category: 'resin-art',
          tags: ['eco-resin', 'UV resin', 'quick cure', 'crafting'],
          stock: 75,
          discount: '53%',
          variant: 'UV Kit',
          features: ['Fast Cure', 'Clear Finish', 'Nail Art'],
        },
        {
          id: 'eco-cast-water-based',
          name: 'Quorin Eco Cast Water-Based Product',
          description: 'Eco-friendly water-based casting compound for crafts.',
          price: 210,
          mrp: 449,
          images: ['/PHOTOS/eco-cast/1.webp'],
          images_local: ['/PHOTOS/eco-cast/1.webp'],
          category: 'resin-art',
          tags: ['eco-resin', 'eco', 'water-based', 'casting'],
          stock: 100,
          discount: '53%',
          variant: 'Eco Cast',
          features: ['Low Odor', 'Eco Friendly', 'Clean Finish'],
        },
        {
          id: 'gilding-glue',
          name: 'Quorin Gilding Glue',
          description: 'Premium adhesive for gold leafing and gilding projects.',
          price: 218,
          mrp: 449,
          images: ['/PHOTOS/gilding glue/1.webp'],
          images_local: ['/PHOTOS/gilding glue/1.webp'],
          category: 'resin-art',
          tags: ['tools', 'gilding', 'gold leaf', 'adhesive'],
          stock: 65,
          discount: '52%',
          variant: 'Glue Bottle',
          features: ['Strong Bond', 'Gild Ready', 'Precise'],
        },
        {
          id: 'metal-hook-set',
          name: 'Brass Latch & Hook Set',
          description: 'Decorative brass latches and hooks for jewelry boxes and crafts.',
          price: 357,
          mrp: 749,
          images: ['/PHOTOS/metal hook_/1.webp'],
          images_local: ['/PHOTOS/metal hook_/1.webp'],
          category: 'resin-art',
          tags: ['tools', 'brass', 'hook', 'hardware'],
          stock: 70,
          discount: '52%',
          variant: 'Hook Pack',
          features: ['Decorative', 'Durable', 'Hardware'],
        },
        {
          id: 'resin-bubble-remover',
          name: 'Resin Bubble Remover Tool',
          description: 'Specialized tool for removing air bubbles from resin crafts.',
          price: 407,
          mrp: 849,
          images: ['/PHOTOS/resin bubble remover/1.webp'],
          images_local: ['/PHOTOS/resin bubble remover/1.webp'],
          category: 'resin-art',
          tags: ['tools', 'resin', 'bubble remover', 'crafting'],
          stock: 85,
          discount: '52%',
          variant: 'Bubble Tool',
          features: ['Bubble Free', 'Precision', 'Craft Essential'],
        },
        {
          id: 'resin-pigment',
          name: 'Quorin Resin Pigment',
          description: 'Liquid pigment for coloring resin crafts.',
          price: 112,
          mrp: 249,
          images: ['/PHOTOS/resin pigment/6/7.webp'],
          images_local: ['/PHOTOS/resin pigment/6/7.webp'],
          category: 'resin-art',
          tags: ['pigments', 'resin', 'colorant', 'liquid'],
          stock: 140,
          discount: '55%',
          variant: 'Pigment Bottle',
          features: ['Color Rich', 'Highly Pigmented', 'Liquid'],
        },
        {
          id: 'silica-powder',
          name: 'Quorin Silica Powder',
          description: '500gm silica powder pouch for resin art and crafting.',
          price: 386,
          mrp: 799,
          images: ['/PHOTOS/silica 500 gm in pouch/silica for resin art (1).jpg'],
          images_local: ['/PHOTOS/silica 500 gm in pouch/silica for resin art (1).jpg'],
          category: 'resin-art',
          tags: ['glitter', 'silica', 'resin art', 'crafting'],
          stock: 90,
          discount: '52%',
          variant: '500gm Pouch',
          features: ['Smooth Texture', 'Craft Mix', 'Fine Powder'],
        },
      ],
    },
    {
      id: 'candle-making',
      title: 'Candle Making',
      description: 'Pigments, wax helpers, wicks, fragrance, and finishing tools for candle makers.',
      products: [
        {
          id: 'jigong-heat-tool-kit',
          name: 'Jigong Heat Tool Kit',
          description: 'Professional heat gun kit for resin crafting, candle making, and DIY projects.',
          price: 426,
          mrp: 899,
          images: ['/PHOTOS/COMBOS/Combo - 1 ( heat gun)/1.webp'],
          images_local: ['/PHOTOS/COMBOS/Combo - 1 ( heat gun)/1.webp'],
          category: 'candle-making',
          tags: ['torch', 'heat tool', 'hot air gun', 'crafting', 'diy'],
          stock: 45,
          discount: '53%',
          variant: 'Tool Kit',
          features: ['Heat Control', 'Craft Ready', 'Multi Use'],
        },
        {
          id: 'candle-pigment-set',
          name: 'Quorin Candle Pigment Set',
          description: 'Liquid pigment for coloring candles in vibrant colors.',
          price: 156,
          mrp: 349,
          images: ['/PHOTOS/candle pigments/1.webp'],
          images_local: ['/PHOTOS/candle pigments/1.webp'],
          category: 'candle-making',
          tags: ['candle-color', 'pigment', 'colorant', 'liquid', 'candle making'],
          stock: 150,
          discount: '55%',
          variant: 'Pigment Set',
          features: ['Bright Color', 'Liquid', 'Easy Mix'],
        },
        {
          id: 'jet-lighter',
          name: 'Quorin Blowtorch Jet Lighter',
          description: 'Professional blowtorch for removing air bubbles from resin and candle tops.',
          price: 708,
          mrp: 1299,
          images: ['/PHOTOS/Jet lighter/Jet.webp'],
          images_local: ['/PHOTOS/Jet lighter/Jet.webp'],
          category: 'candle-making',
          tags: ['torch', 'blowtorch', 'lighter', 'crafting'],
          stock: 55,
          discount: '46%',
          variant: 'Jet Lighter',
          features: ['Precision Flame', 'Refillable', 'Craft Essential'],
        },
        {
          id: 'fragrance-oil-collection',
          name: 'Quorin Fragrance Oil Collection',
          description: 'Premium fragrance oils for candle making and aromatherapy.',
          price: 224,
          mrp: 499,
          images: ['/PHOTOS/Fragrances/variation 1/1.webp'],
          images_local: ['/PHOTOS/Fragrances/variation 1/1.webp'],
          category: 'candle-making',
          tags: ['fragrance oil', 'sandalwood', 'essential oil', 'candle'],
          stock: 90,
          discount: '55%',
          variant: 'Oil Set',
          features: ['Aromatic', 'Premium Blend', 'Long Lasting'],
        },
        {
          id: 'candle-wick-set',
          name: 'Candle Wick Set',
          description: 'Premium cotton wicks for candle making in multiple sizes.',
          price: 114,
          mrp: 249,
          images: ['/PHOTOS/Wick COMBOS/1/1.webp'],
          images_local: ['/PHOTOS/Wick COMBOS/1/1.webp'],
          category: 'candle-making',
          tags: ['wicks', 'candle making', 'cotton', 'crafting'],
          stock: 110,
          discount: '54%',
          variant: 'Wick Combo',
          features: ['Cotton', 'Multi Size', 'Clean Burn'],
        },
        {
          id: 'christmas-candle-set',
          name: 'Quorin Christmas Candle Set',
          description: 'Handcrafted candles for the festive season.',
          price: 690,
          mrp: 1499,
          images: ['/PHOTOS/christmas candles/1.webp'],
          images_local: ['/PHOTOS/christmas candles/1.webp'],
          category: 'candle-making',
          tags: ['candles', 'christmas', 'festive', 'handcrafted'],
          stock: 30,
          discount: '54%',
          variant: 'Festive Set',
          features: ['Festive', 'Handmade', 'Gift Ready'],
        },
      ],
    },
    {
      id: 'soap-making',
      title: 'Soap Making',
      description: 'Soap pigments and mould kits for beginners and small-batch makers.',
      products: [
        {
          id: 'soap-making-kit',
          name: 'Soap Making Kit with Mould',
          description: 'Complete soap making kit with pigments and silicone mould.',
          price: 899,
          mrp: 1799,
          images: ['/PHOTOS/Soap Dye + mould/1.webp'],
          images_local: ['/PHOTOS/Soap Dye + mould/1.webp'],
          category: 'soap-making',
          tags: ['soap-color', 'soap making', 'mould', 'kit', 'diy'],
          stock: 45,
          discount: '50%',
          variant: 'Starter Kit',
          features: ['Beginner Friendly', 'Mould Included', 'Complete Set'],
        },
        {
          id: 'soap-pigment-set',
          name: 'Quorin Soap Pigment Set',
          description: 'Liquid soap pigment in vibrant colors.',
          price: 315,
          mrp: 699,
          images: ['/PHOTOS/Soap dye/1.webp'],
          images_local: ['/PHOTOS/Soap dye/1.webp'],
          category: 'soap-making',
          tags: ['soap-color', 'soap making', 'pigment', 'colorant', 'liquid'],
          stock: 120,
          discount: '55%',
          variant: 'Pigment Set',
          features: ['Liquid', 'Color Rich', 'Easy Blend'],
        },
      ],
    },
  ],
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getProductId = (product: Product) =>
  slugify([
    product.id,
    product.name,
  ]
    .filter((part): part is string => part !== undefined && part !== null && typeof part === 'string')
    .map(String)
    .join(' '));

export const benefits = [
  {
    title: 'Premium Quality',
    description: 'Every product is crafted with the finest materials for professional-grade results.',
  },
  {
    title: 'Beginner Friendly',
    description: 'Our kits come with detailed guides — perfect for makers just starting out.',
  },
  {
    title: 'Fast Delivery',
    description: 'Quick and reliable shipping across India, so you can start creating sooner.',
  },
  {
    title: 'Best Prices',
    description: 'Premium crafting supplies at unbeatable prices with up to 85% off MRP.',
  },
];
