import {
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
} from "@medusajs/medusa/core-flows";
import { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

const PRODUCT_DATA = [
  // Resin Art
  {
    title: "QUORIN Crystal Clear Epoxy Resin and Hardener Kit",
    description: "Premium crystal clear epoxy resin with high gloss finish, perfect for professional resin art. UV resistant with smooth, bubble-free results.",
    price: 999,
    originalPrice: 1549,
    categoryIds: ["resin-art"],
    type: "resin-kit",
    tags: ["resin", "epoxy", "art", "jewelry", "crafts", "uv-resistant"],
    images: [],
    options: [{ title: "Size", values: ["1.2kg"] }],
    variants: [{ prices: [{ currency_code: "inr", amount: 999 }], options: { Size: "1.2kg" }, inventory_items: [] }],
  },
  {
    title: "Liquid Resin Pigment Combo Set",
    description: "Highly concentrated liquid pigments for vibrant colors in resin art. Smooth mixing, brilliant results.",
    price: 284,
    originalPrice: 989,
    categoryIds: ["resin-art"],
    tags: ["pigments", "colors", "resin-art"],
    images: [],
    options: [{ title: "Pack Size", values: ["Pack of 6", "Pack of 10"] }],
    variants: [
      { prices: [{ currency_code: "inr", amount: 284 }], options: { "Pack Size": "Pack of 6" }, inventory_items: [] },
      { prices: [{ currency_code: "inr", amount: 473 }], options: { "Pack Size": "Pack of 10" }, inventory_items: [] },
    ],
  },
  {
    title: "QUORIN Eco Tones Pigment Paste Set",
    description: "Eco-friendly pigment pastes compatible with Jesmonite and other eco resins. Vibrant colors for sustainable crafting.",
    price: 299,
    originalPrice: 2000,
    categoryIds: ["resin-art"],
    tags: ["eco-resin", "pigment", "jesmonite", "eco-friendly"],
    images: [],
    options: [{ title: "Colors", values: ["6 Colors", "10 Colors"] }],
    variants: [
      { prices: [{ currency_code: "inr", amount: 299 }], options: { Colors: "6 Colors" }, inventory_items: [] },
      { prices: [{ currency_code: "inr", amount: 496 }], options: { Colors: "10 Colors" }, inventory_items: [] },
    ],
  },
  {
    title: "QUORIN Eco-Create Eco Resin",
    description: "Water-based, 2:1 formula eco resin. Low odor and craft-friendly for sustainable art projects.",
    price: 299,
    originalPrice: 699,
    categoryIds: ["resin-art"],
    tags: ["eco-resin", "casting", "home-decor", "water-based"],
    images: [],
    options: [{ title: "Size", values: ["400g"] }],
    variants: [{ prices: [{ currency_code: "inr", amount: 299 }], options: { Size: "400g" }, inventory_items: [] }],
  },
  {
    title: "QUORIN Resin Tools Kit",
    description: "Complete 23-piece tool kit for resin art finishing, drilling, and polishing.",
    price: 1429,
    originalPrice: 2999,
    categoryIds: ["resin-art"],
    tags: ["tools", "drill", "polishing", "finishing"],
    images: [],
    variants: [{ prices: [{ currency_code: "inr", amount: 1429 }], options: { Size: "23-piece" }, inventory_items: [] }],
  },
  {
    title: "Quorin 15-Piece Resin Art Tool Kit",
    description: "Professional 15-piece resin art tool kit with drill bits and sanding accessories.",
    price: 682,
    originalPrice: 1499,
    categoryIds: ["resin-art"],
    tags: ["resin-tools", "drill", "sanding"],
    images: [],
    variants: [{ prices: [{ currency_code: "inr", amount: 682 }], options: { Size: "15-piece" }, inventory_items: [] }],
  },
  {
    title: "QUORIN Hand Drill for Resin Art",
    description: "Compact hand drill designed for precision work in resin art projects.",
    price: 299,
    originalPrice: 499,
    categoryIds: ["resin-art"],
    tags: ["drill", "craft-tools"],
    images: [],
    variants: [{ prices: [{ currency_code: "inr", amount: 299 }], options: { Size: "Standard" }, inventory_items: [] }],
  },
  {
    title: "QUORIN Resin Art Tools Combo Kit",
    description: "Heat gun, brushes, mixing cups, and more — everything you need for resin art finishing.",
    price: 734,
    originalPrice: 1499,
    categoryIds: ["resin-art"],
    tags: ["heat-gun", "brush", "cup", "mixing"],
    images: [],
    variants: [{ prices: [{ currency_code: "inr", amount: 734 }], options: { Size: "Combo" }, inventory_items: [] }],
  },
  {
    title: "Resin Glitter for Epoxy Art",
    description: "Metallic glitter for epoxy resin art. Adds sparkle and shine to your creations.",
    price: 299,
    originalPrice: 800,
    categoryIds: ["resin-art"],
    tags: ["glitter", "metallic", "decor"],
    images: [],
    variants: [{ prices: [{ currency_code: "inr", amount: 299 }], options: { Size: "Standard" }, inventory_items: [] }],
  },
  {
    title: "Crushed Clear Glass for Resin Art",
    description: "Clear crushed glass for geode art and resin decorations. 200g pack.",
    price: 169,
    originalPrice: 800,
    categoryIds: ["resin-art"],
    tags: ["geode-art", "glass", "decor"],
    images: [],
    options: [{ title: "Weight", values: ["200g"] }],
    variants: [{ prices: [{ currency_code: "inr", amount: 169 }], options: { Weight: "200g" }, inventory_items: [] }],
  },
  // Candle Making
  {
    title: "QUORIN Candle Colour Set",
    description: "Professional candle colors compatible with soy, gel, paraffin, and beeswax. Vibrant results.",
    price: 299,
    originalPrice: 1000,
    categoryIds: ["candle-making"],
    tags: ["candle-color", "wax-dye", "DIY"],
    images: [],
    options: [{ title: "Pack", values: ["8 Colors 30ml", "6 Colors 30ml", "8 Colors 15ml"] }],
    variants: [
      { prices: [{ currency_code: "inr", amount: 579 }], options: { Pack: "8 Colors 30ml" }, inventory_items: [] },
      { prices: [{ currency_code: "inr", amount: 436 }], options: { Pack: "6 Colors 30ml" }, inventory_items: [] },
      { prices: [{ currency_code: "inr", amount: 299 }], options: { Pack: "8 Colors 15ml" }, inventory_items: [] },
    ],
  },
  {
    title: "QUORIN Candle Wicks",
    description: "50-piece pack of 4-inch cotton wicks for jar candle making. Pre-tabbed for easy use.",
    price: 189,
    originalPrice: 1000,
    categoryIds: ["candle-making"],
    tags: ["wicks", "cotton", "candle-making"],
    images: [],
    options: [{ title: "Pieces", values: ["50 Pieces", "125 Pieces", "150 Pieces"] }],
    variants: [
      { prices: [{ currency_code: "inr", amount: 189 }], options: { Pieces: "50 Pieces" }, inventory_items: [] },
      { prices: [{ currency_code: "inr", amount: 299 }], options: { Pieces: "125 Pieces" }, inventory_items: [] },
      { prices: [{ currency_code: "inr", amount: 284 }], options: { Pieces: "150 Pieces" }, inventory_items: [] },
    ],
  },
  {
    title: "QUORIN Blow Torch Fire Gun",
    description: "Compact blow torch for candle making. Removes bubbles and smooths surfaces.",
    price: 265,
    originalPrice: 1000,
    categoryIds: ["candle-making"],
    tags: ["torch", "bubble-removal", "craft-tool"],
    images: [],
    variants: [{ prices: [{ currency_code: "inr", amount: 265 }], options: { Size: "Standard" }, inventory_items: [] }],
  },
  {
    title: "Premium Fragrance Oil Set",
    description: "Pack of 6 long-lasting fragrance oils for premium candle and soap making. Home fragrance grade.",
    price: 299,
    originalPrice: 2000,
    categoryIds: ["candle-making", "soap-making"],
    tags: ["fragrance-oil", "candle-making", "soap-fragrance", "essential-oil"],
    images: [],
    variants: [{ prices: [{ currency_code: "inr", amount: 299 }], options: { Pack: "Pack of 6" }, inventory_items: [] }],
  },
  // Soap Making
  {
    title: "Quorin DIY Soap Colouring Kit",
    description: "Beginner-friendly soap coloring kit with 8 vibrant colors. Easy to mix, brilliant results.",
    price: 198,
    originalPrice: 1000,
    categoryIds: ["soap-making"],
    tags: ["soap-color", "melt-and-pour", "beginner"],
    images: [],
    options: [{ title: "Colors", values: ["8 Colors"] }],
    variants: [{ prices: [{ currency_code: "inr", amount: 198 }], options: { Colors: "8 Colors" }, inventory_items: [] }],
  },
  {
    title: "QUORIN Liquid Soap Colour Kit with Silicone Mold",
    description: "Complete soap making kit with 8 shades of color and silicone molds for easy handmade soap creation.",
    price: 284,
    originalPrice: 1000,
    categoryIds: ["soap-making"],
    tags: ["soap-color", "silicone-mold", "handmade-soap", "DIY"],
    images: [],
    variants: [{ prices: [{ currency_code: "inr", amount: 284 }], options: { Shades: "8 Shades" }, inventory_items: [] }],
  },
];

async function seed({ container }: { container: MedusaContainer }) {
  console.log("🌱 Seeding Medusa database with QUORIN products...");

  const regionWorkflow = createRegionsWorkflow(container);
  const salesChannelWorkflow = createSalesChannelsWorkflow(container);
  const productWorkflow = createProductsWorkflow(container);

  // Create INR region
  try {
    await regionWorkflow.run({
      input: {
        regions: [
          {
            name: "India",
            currency_code: "inr",
            countries: ["in"],
          },
        ],
      },
    });
    console.log("✓ Region 'India' created");
  } catch (e) {
    console.log("⚠ Region may already exist");
  }

  // Create default sales channel
  let salesChannelId = null;
  try {
    const { result } = await salesChannelWorkflow.run({
      input: {
        salesChannelsData: [
          {
            name: "QUORIN Store",
            description: "QUORIN Made for Makers online store",
          },
        ],
      },
    });
    salesChannelId = result[0].id;
    console.log("✓ Sales channel created");
  } catch (e) {
    console.log("⚠ Sales channel may already exist");
  }

  // Get the product service to pre-create tags
  const productModuleService = container.resolve(Modules.PRODUCT);

  // Pre-create all tags to obtain their IDs
  const allTagValues = [...new Set(PRODUCT_DATA.flatMap(p => p.tags || []))];
  const tagsMap: Record<string, string> = {};
  for (const t of allTagValues) {
    try {
      const existing = await productModuleService.listProductTags({ value: t });
      if (existing.length > 0) {
        tagsMap[t] = existing[0].id;
      } else {
        const [createdTag] = await productModuleService.createProductTags([{ value: t }]);
        tagsMap[t] = createdTag.id;
      }
    } catch (e) {
      const existing = await productModuleService.listProductTags({ value: t });
      if (existing.length > 0) {
        tagsMap[t] = existing[0].id;
      }
    }
  }

  // Create product categories
  const categories = [
    { id: "resin-art", name: "Resin Art" },
    { id: "candle-making", name: "Candle Making" },
    { id: "soap-making", name: "Soap Making" },
  ];

  // Seed products
  let totalCreated = 0;
  for (const productData of PRODUCT_DATA) {
    try {
      // Dynamically build the options array based on variant options to prevent validation errors
      const optionsMap: Record<string, Set<string>> = {};
      for (const variant of productData.variants) {
        if (variant.options) {
          for (const [key, val] of Object.entries(variant.options)) {
            if (!optionsMap[key]) {
              optionsMap[key] = new Set();
            }
            optionsMap[key].add(String(val));
          }
        }
      }

      const derivedOptions = Object.entries(optionsMap).map(([title, valuesSet]) => ({
        title,
        values: Array.from(valuesSet),
      }));

      const mappedVariants = productData.variants.map(v => ({
        title: v.options ? Object.values(v.options).join(" / ") : "Default",
        ...v,
      }));

      const { result } = await productWorkflow.run({
        input: {
          products: [
            {
              title: productData.title,
              description: productData.description,
              options: derivedOptions.length > 0 ? derivedOptions : undefined,
              variants: mappedVariants,
              tags: productData.tags ? productData.tags.map(t => ({ id: tagsMap[t], value: t })) : undefined,
              status: "published",
              sales_channels: salesChannelId ? [{ id: salesChannelId }] : undefined,
            },
          ],
        } as any,
      });
      totalCreated += result.length;
      console.log(`✓ Product: ${productData.title}`);
    } catch (e: any) {
      console.log(`⚠ Product failed to seed: ${productData.title}. Error: ${e.message || e}`);
    }
  }

  console.log(`\n🌱 Seeding complete! Created ${totalCreated} products.`);
}

export default seed;
