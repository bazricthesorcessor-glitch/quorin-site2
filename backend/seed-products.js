require("dotenv").config();
const loaders = require("./node_modules/@medusajs/medusa/dist/loaders/index.js");
const { initializeContainer, default: medusaLoader } = loaders;

const PRODUCTS = [
  { name: "QUORIN Crystal Clear Epoxy Resin & Hardener", description: "Two-part crystal clear epoxy resin system for art and crafts. UV Resistant, High Gloss Finish, Beginner Friendly.", price: 677, mrp: 1499, tags: ["resin-kit", "epoxy", "resin", "hardener", "crystal clear"], category: "resin-art", thumbnail: "/PHOTOS/Resin/1.webp" },
  { name: "Jigong Heat Tool Kit", description: "Professional heat gun kit for resin crafting, candle making, and DIY projects.", price: 426, mrp: 899, tags: ["torch", "heat tool", "hot air gun", "crafting", "diy"], category: "candle-making", thumbnail: "/PHOTOS/COMBOS/Combo - 1 ( heat gun)/1.webp" },
  { name: "Quorin Candle Pigment Set", description: "Liquid pigment for coloring candles in 7 vibrant colors.", price: 156, mrp: 349, tags: ["candle-color", "candle making", "pigment", "colorant", "liquid"], category: "candle-making", thumbnail: "/PHOTOS/candle pigments/1.webp" },
  { name: "Crushed Glass Pack", description: "Clear crushed glass for resin art in 3mm size.", price: 299, mrp: 599, tags: ["glitter", "crushed glass", "resin art", "decoration"], category: "resin-art", thumbnail: "/PHOTOS/Crushed glass/main image/crushed glass.webp" },
  { name: "Deburring System", description: "Professional deburring tool for removing burrs and smoothing surfaces.", price: 1062, mrp: 1999, tags: ["tools", "deburring", "tool", "crafting", "surface finish"], category: "resin-art", thumbnail: "/PHOTOS/Deburring tool/1.jpg" },
  { name: "Quorin Fragrance Oil Collection", description: "Premium fragrance oils for candle making and aromatherapy.", price: 224, mrp: 499, tags: ["fragrance-oil", "fragrance oil", "sandalwood", "essential oil", "candle"], category: "candle-making", thumbnail: "/PHOTOS/Fragrances/variation 1/1.webp" },
  { name: "Quorin Glitter Collection", description: "Premium glitter powder for decorative crafting in multiple colors.", price: 213, mrp: 449, tags: ["glitter", "crafting", "decorative", "art"], category: "resin-art", thumbnail: "/PHOTOS/GLITTER/bold party/1.webp" },
  { name: "Resin Craft Drill Kit", description: "Hand drill with 4 bits for resin and craft work.", price: 170, mrp: 399, tags: ["drill", "hand drill", "resin", "crafting", "tools"], category: "resin-art", thumbnail: "/PHOTOS/HAND DRILL WITH 4 BITS/hand drll.jpg" },
  { name: "Quorin Blowtorch Jet Lighter", description: "Professional blowtorch for removing air bubbles from resin and candle tops.", price: 708, mrp: 1299, tags: ["torch", "blowtorch", "lighter", "resin", "crafting"], category: "candle-making", thumbnail: "/PHOTOS/Jet lighter/Jet.webp" },
  { name: "Quorin Liquid Deco Paint", description: "Water-based liquid decorative paint for artistic applications.", price: 445, mrp: 899, tags: ["pigments", "paint", "liquid", "decorative", "art"], category: "resin-art", thumbnail: "/PHOTOS/Liquid deco paint/1.webp" },
  { name: "Jewellery Mould Set", description: "Silicone moulds for making resin jewellery.", price: 478, mrp: 999, tags: ["geode-art", "jewelry mould", "resin mould", "jewellery making", "silicone"], category: "resin-art", thumbnail: "/PHOTOS/MOULDS COMBO/1/1.webp" },
  { name: "Neodymium Magnets Set", description: "Strong round neodymium magnets in various sizes.", price: 378, mrp: 799, tags: ["tools", "neodymium", "magnets", "crafting", "strong"], category: "resin-art", thumbnail: "/PHOTOS/Magnets combo/1.webp" },
  { name: "Soap Making Kit with Mould", description: "Complete soap making kit with pigments and silicone mould.", price: 899, mrp: 1799, tags: ["soap-color", "soap making", "mould", "kit", "diy"], category: "soap-making", thumbnail: "/PHOTOS/Soap Dye + mould/1.webp" },
  { name: "Quorin Soap Pigment Set", description: "Liquid soap pigment in 8 vibrant colors.", price: 315, mrp: 699, tags: ["soap-color", "soap making", "pigment", "colorant", "liquid"], category: "soap-making", thumbnail: "/PHOTOS/Soap dye/1.webp" },
  { name: "UV Resin Kit", description: "UV-curing resin kit for nail art and quick-cure crafting.", price: 564, mrp: 1199, tags: ["eco-resin", "UV resin", "nail art", "crafting", "quick cure"], category: "resin-art", thumbnail: "/PHOTOS/UV Resin combo/1.webp" },
  { name: "Candle Wick Set", description: "Premium cotton wicks for candle making in multiple sizes.", price: 114, mrp: 249, tags: ["wicks", "candle making", "cotton", "crafting"], category: "candle-making", thumbnail: "/PHOTOS/Wick COMBOS/1/1.webp" },
  { name: "Quorin Christmas Candle Set", description: "Handcrafted candles for the festive season.", price: 690, mrp: 1499, tags: ["candle-color", "candles", "christmas", "festive", "handcrafted"], category: "candle-making", thumbnail: "/PHOTOS/christmas candles/1.webp" },
  { name: "Quorin Eco Cast Water-Based Product", description: "Eco-friendly water-based casting compound for crafts.", price: 210, mrp: 449, tags: ["eco-resin", "eco", "water-based", "casting", "crafting"], category: "resin-art", thumbnail: "/PHOTOS/eco-cast/1.webp" },
  { name: "Quorin Gilding Glue", description: "Premium adhesive for gold leafing and gilding projects.", price: 218, mrp: 449, tags: ["tools", "gilding", "gold leaf", "adhesive", "crafting"], category: "resin-art", thumbnail: "/PHOTOS/gilding glue/1.webp" },
  { name: "Brass Latch & Hook Set", description: "Decorative brass latches and hooks for jewelry boxes and crafts.", price: 357, mrp: 749, tags: ["tools", "brass", "latch", "hook", "hardware"], category: "resin-art", thumbnail: "/PHOTOS/metal hook_/1.webp" },
  { name: "Resin Bubble Remover Tool", description: "Specialized tool for removing air bubbles from resin crafts.", price: 407, mrp: 849, tags: ["tools", "resin", "bubble remover", "tool", "crafting"], category: "resin-art", thumbnail: "/PHOTOS/resin bubble remover/1.webp" },
  { name: "Quorin Resin Pigment", description: "Liquid pigment for coloring resin crafts.", price: 112, mrp: 249, tags: ["pigments", "resin", "pigment", "colorant", "liquid"], category: "resin-art", thumbnail: "/PHOTOS/resin pigment/6/7.webp" },
  { name: "Quorin Silica Powder", description: "500gm silica powder pouch for resin art and crafting.", price: 386, mrp: 799, tags: ["glitter", "silica", "resin art", "crafting", "500gm"], category: "resin-art", thumbnail: "/PHOTOS/silica 500 gm in pouch/silica for resin art (1).jpg" },
];

async function seed() {
  const { container } = await medusaLoader({
    directory: process.cwd(),
    expressApp: null,
    skipLoadingEntryPoints: true,
  });
  const logger = container.resolve("logger");
  const productModuleService = container.resolve("product");

  // Create categories (skip if they exist)
  const categories = {};
  const catNames = {
    "resin-art": "Resin Art",
    "candle-making": "Candle Making",
    "soap-making": "Soap Making",
  };
  const existingCats = await productModuleService.listProductCategories();
  for (const cat of existingCats) {
    const handle = cat.handle || cat.id;
    for (const [catId] of Object.entries(catNames)) {
      if (handle.includes(catId.split('-')[0]) || cat.name?.toLowerCase().includes(catId.split('-')[0])) {
        categories[catId] = cat.id;
      }
    }
  }
  for (const [catId, name] of Object.entries(catNames)) {
    if (!categories[catId]) {
      try {
        const [cat] = await productModuleService.createProductCategories([
          { name, handle: catId },
        ]);
        categories[catId] = cat.id;
      } catch (e) {
        const existing = await productModuleService.listProductCategories({ handle: catId });
        if (existing.length > 0) {
          categories[catId] = existing[0].id;
        } else {
          logger.warn(`Could not create or find category: ${catId}`);
        }
      }
    }
  }

  // Clear existing products to run a clean seed
  const existingProducts = await productModuleService.listProducts();
  if (existingProducts.length > 0) {
    logger.info(`Clearing ${existingProducts.length} existing products for clean seed...`);
    await productModuleService.deleteProducts(existingProducts.map(p => p.id));
  }

  // Create tags first to get their IDs
  const allTags = [...new Set(PRODUCTS.flatMap(p => p.tags || []))];
  const tagsMap = {};
  for (const t of allTags) {
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

  let created = 0;
  for (const p of PRODUCTS) {
    try {
      await productModuleService.createProducts([
        {
          title: p.name,
          description: p.description,
          status: "published",
          thumbnail: p.thumbnail,
          options: [{ title: "Size", values: ["default"] }],
          variants: [
            {
              title: p.name,
              prices: [{ currency_code: "inr", amount: Math.round(p.price * 100) }],
              options: { Size: "default" },
            },
          ],
          categories: p.category ? [{ id: categories[p.category] }] : undefined,
          tags: p.tags.map(t => ({ id: tagsMap[t] })),
        },
      ]);
      created++;
    } catch (e) {
      logger.warn(`Skipping ${p.name}: ${e.message}`);
    }
  }

  logger.info(`Seeded ${created}/${PRODUCTS.length} products`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
