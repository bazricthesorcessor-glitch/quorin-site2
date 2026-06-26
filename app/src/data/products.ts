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
  brand: "QUORIN",
  tagline: "Crafted for Makers",
  categories: [
    {
      id: "resin-art",
      title: "Resin Art",
      description: "Crystal clear epoxy resins, vibrant pigments, and professional tools for stunning creations.",
      products: [
        {
          id: "resin",
          name: "QUORIN Epoxy Resin & Hardener",
          description: "Two-part crystal clear epoxy resin system for art and crafts. UV resistant, high gloss finish.",
          price: 677,
          mrp: 1499,
          images: ["https://images.unsplash.com/photo-1622547748229-467c81779034?w=600", "/PHOTOS/Resin/1.png"],
          images_local: ["/PHOTOS/Resin/1.png", "/PHOTOS/Resin/2.png", "/PHOTOS/Resin/3.png"],
          category: "resin-art",
          tags: ["epoxy", "resin", "hardener", "crystal clear"],
          featured: true,
          stock: 100
        },
        {
          id: "resin-pigment",
          name: "QUORIN Resin Pigment",
          description: "Liquid pigment for coloring resin crafts. Vibrant, highly concentrated.",
          price: 112,
          mrp: 249,
          images: ["https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600", "/PHOTOS/resin pigment/6/7.png"],
          images_local: ["/PHOTOS/resin pigment/6/1.png", "/PHOTOS/resin pigment/6/7.png"],
          category: "resin-art",
          tags: ["resin", "pigment", "colorant", "liquid"],
          stock: 150
        },
        {
          id: "eco-cast",
          name: "QUORIN Eco Cast Water-Based Compound",
          description: "Eco-friendly water-based casting compound for crafts. 2:1 formula, low odor.",
          price: 210,
          mrp: 449,
          images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600", "/PHOTOS/eco-cast/1.png"],
          images_local: ["/PHOTOS/eco-cast/1.png", "/PHOTOS/eco-cast/2.png", "/PHOTOS/eco-cast/3.png"],
          category: "resin-art",
          tags: ["eco", "water-based", "casting", "crafting"],
          stock: 80
        },
        {
          id: "uv-resin-combo",
          name: "QUORIN UV Resin Kit",
          description: "UV-curing resin kit for nail art and quick-cure crafting. Pink and blue colors.",
          price: 564,
          mrp: 1199,
          images: ["https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=600", "/PHOTOS/UV Resin combo/100g/1.jpg"],
          images_local: ["/PHOTOS/UV Resin combo/100g/1.jpg", "/PHOTOS/UV Resin combo/100g/2.jpg"],
          category: "resin-art",
          tags: ["UV resin", "nail art", "crafting", "quick cure"],
          stock: 70
        },
        {
          id: "crushed-glass",
          name: "QUORIN Crushed Glass Pack",
          description: "Clear crushed glass for resin art in 3mm size. Perfect for geode effects.",
          price: 299,
          mrp: 599,
          images: ["https://images.unsplash.com/photo-1610701596061-2ecf227e8542?w=600", "/PHOTOS/Crushed glass/main image/crushed glass.png"],
          images_local: ["/PHOTOS/Crushed glass/main image/crushed glass.png"],
          category: "resin-art",
          tags: ["crushed glass", "resin art", "geode", "decoration"],
          stock: 80
        },
        {
          id: "silica",
          name: "QUORIN Silica Powder 500g",
          description: "Premium silica powder pouch for resin art and crafting. Professional grade.",
          price: 386,
          mrp: 799,
          images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600", "/PHOTOS/silica 500 gm in pouch/silica for resin art (1).jpg"],
          images_local: ["/PHOTOS/silica 500 gm in pouch/silica for resin art (1).jpg"],
          category: "resin-art",
          tags: ["silica", "resin art", "crafting"],
          stock: 70
        }
      ]
    },
    {
      id: "candle-making",
      title: "Candle Making",
      description: "Premium waxes, fragrances, wicks, and colours to craft beautiful aromatic candles.",
      products: [
        {
          id: "candle-pigment",
          name: "QUORIN Candle Pigment Set",
          description: "Liquid pigment for coloring candles in 7 vibrant colors. Highly concentrated.",
          price: 156,
          mrp: 349,
          images: ["https://images.unsplash.com/photo-1602523961358-f9f08dd97264?w=600", "/PHOTOS/candle pigments/candle colour for canldle making (1).png"],
          images_local: ["/PHOTOS/candle pigments/candle colour for canldle making (1).png", "/PHOTOS/candle pigments/candle colour for canldle making (2).png", "/PHOTOS/candle pigments/candle colour for canldle making (3).png"],
          category: "candle-making",
          tags: ["candle making", "pigment", "colorant", "liquid"],
          featured: true,
          stock: 120
        },
        {
          id: "fragrance-oil",
          name: "QUORIN Fragrance Oil Collection",
          description: "Premium fragrance oils for candle making and aromatherapy. Sandalwood and more.",
          price: 224,
          mrp: 499,
          images: ["https://images.unsplash.com/photo-1602527373450-6b030d5e0213?w=600", "/PHOTOS/Fragrances/variation 1/1.png"],
          images_local: ["/PHOTOS/Fragrances/variation 1/1.png", "/PHOTOS/Fragrances/variation 2/1.png"],
          category: "candle-making",
          tags: ["fragrance oil", "sandalwood", "essential oil", "candle"],
          featured: true,
          stock: 200
        },
        {
          id: "wick-combo",
          name: "QUORIN Candle Wick Set",
          description: "Premium cotton wicks for candle making in multiple sizes. 50-150 pieces.",
          price: 114,
          mrp: 249,
          images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600", "/PHOTOS/Wick COMBOS/1/1.jpg"],
          images_local: ["/PHOTOS/Wick COMBOS/1/1.jpg", "/PHOTOS/Wick COMBOS/2/1.jpg"],
          category: "candle-making",
          tags: ["wicks", "candle making", "cotton"],
          stock: 200
        },
        {
          id: "christmas-candles",
          name: "QUORIN Christmas Candle Set",
          description: "Handcrafted candles for the festive season. Beautiful decorative pieces.",
          price: 690,
          mrp: 1499,
          images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600"],
                    category: "candle-making",
          tags: ["candles", "christmas", "festive"],
          stock: 50
        }
      ]
    },
    {
      id: "soap-making",
      title: "Soap Making",
      description: "Everything you need to create beautiful handmade soaps — colours, fragrances, molds, and more.",
      products: [
        {
          id: "soap-dye",
          name: "QUORIN Soap Pigment Set",
          description: "Liquid soap pigment in 8 vibrant colors. Easy to use, beginner friendly.",
          price: 315,
          mrp: 699,
          images: ["https://images.unsplash.com/photo-1600435917896-349d089b4270?w=600", "/PHOTOS/Soap dye/1.png"],
          images_local: ["/PHOTOS/Soap dye/1.png", "/PHOTOS/Soap dye/2.png", "/PHOTOS/Soap dye/3.png"],
          category: "soap-making",
          tags: ["soap making", "pigment", "colorant", "liquid"],
          stock: 110
        },
        {
          id: "soap-dye-mould",
          name: "QUORIN Soap Making Kit with Mould",
          description: "Complete soap making kit with pigments and silicone mould. Perfect starter set.",
          price: 899,
          mrp: 1799,
          images: ["https://images.unsplash.com/photo-1607003390927-95c1f5f65c44?w=600", "/PHOTOS/Soap Dye + mould/1.png"],
          images_local: ["/PHOTOS/Soap Dye + mould/1.png", "/PHOTOS/Soap Dye + mould/2.png"],
          category: "soap-making",
          tags: ["soap making", "mould", "kit", "diy"],
          featured: true,
          stock: 45
        }
      ]
    },
    {
      id: "tools",
      title: "Tools",
      description: "Professional tools for resin crafting, candle making, and DIY projects.",
      products: [
        {
          id: "combo-heat-tool",
          name: "Jigong Heat Tool Kit",
          description: "Professional heat gun kit for resin crafting, candle making, and DIY projects.",
          price: 426,
          mrp: 899,
          images: ["https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600", "/PHOTOS/COMBOS/Combo - 1 ( heat gun)/1.jpg"],
          images_local: ["/PHOTOS/COMBOS/Combo - 1 ( heat gun)/1.jpg", "/PHOTOS/COMBOS/Combo - 1 ( heat gun)/2.jpg"],
          category: "tools",
          tags: ["heat tool", "hot air gun", "crafting", "diy"],
          featured: true,
          stock: 50
        },
        {
          id: "deburring-tool",
          name: "QUORIN Deburring System",
          description: "Professional deburring tool for removing burrs and smoothing surfaces.",
          price: 1062,
          mrp: 1999,
          images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600", "/PHOTOS/Deburring tool/1.jpg"],
          images_local: ["/PHOTOS/Deburring tool/1.jpg", "/PHOTOS/Deburring tool/2.jpg"],
          category: "tools",
          tags: ["deburring", "tool", "crafting", "surface finish"],
          stock: 30
        },
        {
          id: "hand-drill",
          name: "QUORIN Resin Craft Drill Kit",
          description: "Hand drill with 4 bits for resin and craft work. Versatile tool set.",
          price: 170,
          mrp: 399,
          images: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600", "/PHOTOS/HAND DRILL WITH 4 BITS/hand drll.jpg"],
          images_local: ["/PHOTOS/HAND DRILL WITH 4 BITS/hand drll.jpg", "/PHOTOS/HAND DRILL WITH 4 BITS/hand drll.png"],
          category: "tools",
          tags: ["hand drill", "resin", "crafting", "tools"],
          stock: 40
        },
        {
          id: "jet-lighter",
          name: "QUORIN Blowtorch Jet Lighter",
          description: "Professional blowtorch for removing air bubbles from resin and candle tops.",
          price: 708,
          mrp: 1299,
          images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600", "/PHOTOS/Jet lighter/Jet"],
          images_local: ["/PHOTOS/Jet lighter/Jet"],
          category: "tools",
          tags: ["blowtorch", "lighter", "resin", "crafting"],
          stock: 25
        },
        {
          id: "resin-bubble-remover",
          name: "QUORIN Resin Bubble Remover",
          description: "Specialized tool for removing air bubbles from resin crafts. Essential for professionals.",
          price: 407,
          mrp: 849,
          images: ["https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600", "/PHOTOS/resin bubble remover/1.png"],
          images_local: ["/PHOTOS/resin bubble remover/1.png", "/PHOTOS/resin bubble remover/2.png"],
          category: "tools",
          tags: ["resin", "bubble remover", "tool", "crafting"],
          stock: 55
        }
      ]
    },
    {
      id: "supplies",
      title: "Craft Supplies",
      description: "Premium craft supplies including paints, glitter, adhesives, and decorative materials.",
      products: [
        {
          id: "liquid-deco-paint",
          name: "QUORIN Liquid Deco Paint",
          description: "Water-based liquid decorative paint for artistic applications. Premium quality.",
          price: 445,
          mrp: 899,
          images: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600", "/PHOTOS/Liquid deco paint/1.png"],
          images_local: ["/PHOTOS/Liquid deco paint/1.png", "/PHOTOS/Liquid deco paint/2.png"],
          category: "supplies",
          tags: ["paint", "liquid", "decorative", "art"],
          featured: true,
          stock: 75
        },
        {
          id: "glitter",
          name: "QUORIN Glitter Collection",
          description: "Premium glitter powder for decorative crafting in multiple colors. Bold party, metallic, nature.",
          price: 213,
          mrp: 449,
          images: ["https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600", "/PHOTOS/GLITTER/bold party/1.png"],
          images_local: ["/PHOTOS/GLITTER/bold party/1.png", "/PHOTOS/GLITTER/metallic essentials/1.png"],
          category: "supplies",
          tags: ["glitter", "crafting", "decorative", "art"],
          featured: true,
          stock: 150
        },
        {
          id: "gilding-glue",
          name: "QUORIN Gilding Glue",
          description: "Premium adhesive for gold leafing and gilding projects. Professional grade.",
          price: 218,
          mrp: 449,
          images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600", "/PHOTOS/gilding glue/1.png"],
          images_local: ["/PHOTOS/gilding glue/1.png", "/PHOTOS/gilding glue/2.png"],
          category: "supplies",
          tags: ["gilding", "gold leaf", "adhesive", "crafting"],
          stock: 90
        },
        {
          id: "magnets-combo",
          name: "QUORIN Neodymium Magnets Set",
          description: "Strong round neodymium magnets in various sizes. Perfect for jewelry making.",
          price: 378,
          mrp: 799,
          images: ["https://images.unsplash.com/photo-1611591297157-9b5287780389?w=600", "/PHOTOS/Magnets combo/4 sizes/Pack of 120/4-120/1.png"],
          images_local: ["/PHOTOS/Magnets combo/4 sizes/Pack of 120/4-120/1.png"],
          category: "supplies",
          tags: ["neodymium", "magnets", "crafting", "jewelry"],
          stock: 90
        },
        {
          id: "metal-hook",
          name: "QUORIN Brass Latch & Hook Set",
          description: "Decorative brass latches and hooks for jewelry boxes and crafts.",
          price: 357,
          mrp: 749,
          images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600", "/PHOTOS/metal hook_/1.png"],
          images_local: ["/PHOTOS/metal hook_/1.png", "/PHOTOS/metal hook_/2.png"],
          category: "supplies",
          tags: ["brass", "latch", "hook", "hardware"],
          stock: 100
        },
        {
          id: "moulds-combo",
          name: "QUORIN Jewellery Mould Set",
          description: "Silicone moulds for making resin jewellery. Multiple shapes and sizes.",
          price: 478,
          mrp: 999,
          images: ["https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600", "/PHOTOS/MOULDS COMBO/1/2 Mould/Resin mould (1).jpg"],
          images_local: ["/PHOTOS/MOULDS COMBO/1/2 Mould/Resin mould (1).jpg", "/PHOTOS/MOULDS COMBO/2/4 Mould/Resin mould (1).jpg"],
          category: "supplies",
          tags: ["jewelry mould", "resin mould", "jewellery making", "silicone"],
          featured: true,
          stock: 60
        }
      ]
    }
  ]
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
    .filter((part): part is string | number => part !== undefined && part !== null)
    .map(String)
    .join(' '));

export const benefits = [
  {
    title: "Premium Quality",
    description: "Every product is crafted with the finest materials for professional-grade results."
  },
  {
    title: "Beginner Friendly",
    description: "Our kits come with detailed guides — perfect for makers just starting out."
  },
  {
    title: "Fast Delivery",
    description: "Quick and reliable shipping across India, so you can start creating sooner."
  },
  {
    title: "Best Prices",
    description: "Premium crafting supplies at unbeatable prices with up to 85% off MRP."
  }
];
