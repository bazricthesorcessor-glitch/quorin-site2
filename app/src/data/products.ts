export interface Product {
  id?: string;
  name: string;
  variant?: string;
  size?: string;
  price: number;
  mrp: number;
  costPrice?: number;
  discount: string;
  description?: string;
  images?: string[];
  reviews?: ProductReview[];
  features?: string[];
  tags: string[];
  type?: string;
  pieces?: number;
  compatibleWith?: string[];
}

export interface ProductReview {
  author: string;
  text: string;
  date: string;
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
  tagline: "Made for Makers",
  categories: [
    {
      id: "resin-art",
      title: "Resin Art",
      description: "Crystal clear epoxy resins, vibrant pigments, and professional tools for creating stunning resin masterpieces.",
      products: [
        {
          name: "QUORIN Crystal Clear Epoxy Resin and Hardener Kit",
          size: "1.2kg",
          price: 999,
          mrp: 1549,
          discount: "36%",
          features: ["UV Resistant", "High Gloss Finish", "Smooth Finish", "Easy to Use", "Crystal Clear"],
          tags: ["resin", "epoxy", "art", "jewelry", "crafts"],
          type: "resin-kit"
        },
        {
          name: "Liquid Resin Pigment Combo Set",
          variant: "Pack of 6",
          size: "15ml each",
          price: 284,
          mrp: 989,
          discount: "71%",
          features: ["Highly Concentrated", "Smooth Mixing", "Vibrant Colors"],
          tags: ["pigments", "colors", "resin-art"]
        },
        {
          name: "Liquid Resin Pigment Combo Set",
          variant: "Pack of 10",
          size: "15ml each",
          price: 473,
          mrp: 989,
          discount: "52%",
          tags: ["pigments", "colors", "resin-art"]
        },
        {
          name: "QUORIN Eco Tones Pigment Paste Set",
          variant: "6 Colors",
          size: "15ml each",
          price: 299,
          mrp: 2000,
          discount: "85%",
          tags: ["eco-resin", "pigment", "jesmonite"]
        },
        {
          name: "QUORIN Eco Tones Pigment Paste Kit",
          variant: "10 Colors",
          size: "15ml each",
          price: 496,
          mrp: 2000,
          discount: "75%",
          tags: ["eco-resin", "pigment", "craft"]
        },
        {
          name: "QUORIN Eco-Create Eco Resin",
          size: "400g",
          price: 299,
          mrp: 699,
          discount: "57%",
          features: ["Water Based", "2:1 Formula", "Low Odor", "Craft Friendly"],
          tags: ["eco-resin", "casting", "home-decor"]
        },
        {
          name: "QUORIN Resin Tools Kit",
          pieces: 23,
          price: 1429,
          mrp: 2999,
          discount: "52%",
          tags: ["tools", "drill", "polishing", "finishing"]
        },
        {
          name: "Quorin 15-Piece Resin Art Tool Kit",
          price: 682,
          mrp: 1499,
          discount: "55%",
          tags: ["resin-tools", "drill", "sanding"]
        },
        {
          name: "QUORIN Hand Drill for Resin Art",
          price: 299,
          mrp: 499,
          discount: "40%",
          tags: ["drill", "craft-tools"]
        },
        {
          name: "QUORIN Resin Art Tools Combo Kit",
          price: 734,
          mrp: 1499,
          discount: "51%",
          tags: ["heat-gun", "brush", "cup", "mixing"]
        },
        {
          name: "Resin Glitter for Epoxy Art",
          price: 299,
          mrp: 800,
          discount: "63%",
          tags: ["glitter", "metallic", "decor"]
        },
        {
          name: "Crushed Clear Glass for Resin Art",
          size: "200g",
          price: 169,
          mrp: 800,
          discount: "79%",
          tags: ["geode-art", "glass", "decor"]
        }
      ]
    },
    {
      id: "candle-making",
      title: "Candle Making",
      description: "Premium waxes, fragrances, wicks, and colours to craft beautiful, aromatic candles at home.",
      products: [
        {
          name: "QUORIN Candle Colour Set",
          variant: "8 Colors",
          size: "30ml",
          price: 579,
          mrp: 2000,
          discount: "71%",
          compatibleWith: ["Soy Wax", "Gel Wax", "Paraffin Wax", "Beeswax"],
          tags: ["candle-color", "wax-dye"]
        },
        {
          name: "QUORIN Candle Colour Set",
          variant: "6 Colors",
          size: "30ml",
          price: 436,
          mrp: 2000,
          discount: "78%",
          tags: ["candle-color", "wax-dye"]
        },
        {
          name: "QUORIN Candle Colour Set",
          variant: "8 Colors",
          size: "15ml",
          price: 299,
          mrp: 1000,
          discount: "70%",
          tags: ["candle-color", "DIY"]
        },
        {
          name: "QUORIN Candle Wicks",
          variant: "50 Pieces",
          size: "4 Inch",
          price: 189,
          mrp: 1000,
          discount: "81%",
          tags: ["wicks", "cotton", "candle-making"]
        },
        {
          name: "Candle Wicks Assorted Pack",
          pieces: 125,
          price: 299,
          mrp: 1000,
          discount: "70%",
          tags: ["wicks", "jar-candle"]
        },
        {
          name: "Candle Wicks Small Jar Pack",
          pieces: 150,
          price: 284,
          mrp: 1000,
          discount: "72%",
          tags: ["wicks", "tealight"]
        },
        {
          name: "Candle Wicks Assorted Multi-Size",
          pieces: 150,
          price: 284,
          mrp: 1000,
          discount: "72%",
          tags: ["wicks", "DIY"]
        },
        {
          name: "QUORIN Blow Torch Fire Gun",
          price: 265,
          mrp: 1000,
          discount: "74%",
          tags: ["torch", "bubble-removal", "craft-tool"]
        },
        {
          name: "Premium Fragrance Oil Set",
          variant: "Pack of 6",
          size: "10ml each",
          price: 299,
          mrp: 2000,
          discount: "85%",
          features: ["Long Lasting Aroma", "Craft Friendly", "Home Fragrance"],
          tags: ["fragrance-oil", "candle-making"]
        }
      ]
    },
    {
      id: "soap-making",
      title: "Soap Making",
      description: "Everything you need to create beautiful handmade soaps — colours, fragrances, molds, and more.",
      products: [
        {
          name: "Quorin DIY Soap Colouring Kit",
          variant: "8 Colors",
          size: "15ml each",
          price: 198,
          mrp: 1000,
          discount: "80%",
          features: ["Easy to Use", "Beginner Friendly", "Vibrant Colors"],
          tags: ["soap-color", "melt-and-pour"]
        },
        {
          name: "QUORIN Liquid Soap Colour Kit with Silicone Mold",
          variant: "8 Shades",
          size: "15ml each",
          price: 284,
          mrp: 1000,
          discount: "72%",
          features: ["Includes Mold", "Easy Mixing", "DIY Gifting"],
          tags: ["soap-color", "silicone-mold", "handmade-soap"]
        },
        {
          name: "Premium Fragrance Oil Set",
          variant: "Pack of 6",
          size: "10ml each",
          price: 299,
          mrp: 2000,
          discount: "85%",
          tags: ["soap-fragrance", "essential-oil"]
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
    product.type,
    product.name,
    product.variant,
    product.size,
    product.pieces,
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
