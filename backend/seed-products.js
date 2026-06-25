require("dotenv").config();
const { initializeContainer } = require("./node_modules/@medusajs/medusa/dist/loaders");
const { ContainerRegistrationKeys } = require("./node_modules/@medusajs/framework/dist/utils");

const PRODUCTS = [
  { name: "QUORIN Crystal Clear Epoxy Resin and Hardener Kit", description: "UV Resistant, High Gloss Finish, Smooth Finish, Easy to Use, Crystal Clear.", price: 999, mrp: 1549, tags: ["resin", "epoxy", "art", "jewelry", "crafts"], category: "resin-art", thumbnail: "/product-resin-kit.jpg" },
  { name: "Liquid Resin Pigment Combo Set (Pack of 6)", description: "Highly Concentrated, Smooth Mixing, Vibrant Colors.", price: 284, mrp: 989, tags: ["pigments", "colors", "resin-art"], category: "resin-art" },
  { name: "Liquid Resin Pigment Combo Set (Pack of 10)", description: "Highly Concentrated, Smooth Mixing, Vibrant Colors.", price: 473, mrp: 989, tags: ["pigments", "colors", "resin-art"], category: "resin-art" },
  { name: "QUORIN Eco Tones Pigment Paste Set (6 Colors)", description: "Eco-friendly pigment paste for Jesmonite and resin crafts.", price: 299, mrp: 2000, tags: ["eco-resin", "pigment", "jesmonite"], category: "resin-art" },
  { name: "QUORIN Eco Tones Pigment Paste Kit (10 Colors)", description: "Complete eco-friendly pigment kit for crafts.", price: 496, mrp: 2000, tags: ["eco-resin", "pigment", "craft"], category: "resin-art" },
  { name: "QUORIN Eco-Create Eco Resin", description: "Water Based, 2:1 Formula, Low Odor, Craft Friendly.", price: 299, mrp: 699, tags: ["eco-resin", "casting", "home-decor"], category: "resin-art" },
  { name: "QUORIN Resin Tools Kit", description: "23-piece professional resin art tool kit.", price: 1429, mrp: 2999, tags: ["tools", "drill", "polishing", "finishing"], category: "resin-art" },
  { name: "Quorin 15-Piece Resin Art Tool Kit", description: "Essential tools for resin art and crafting.", price: 682, mrp: 1499, tags: ["resin-tools", "drill", "sanding"], category: "resin-art" },
  { name: "QUORIN Hand Drill for Resin Art", description: "Professional hand drill for resin work.", price: 299, mrp: 499, tags: ["drill", "craft-tools"], category: "resin-art" },
  { name: "QUORIN Resin Art Tools Combo Kit", description: "Heat gun, brushes, cups, mixing tools combo.", price: 734, mrp: 1499, tags: ["heat-gun", "brush", "cup", "mixing"], category: "resin-art" },
  { name: "Resin Glitter for Epoxy Art", description: "Metallic glitter for decorative epoxy art.", price: 299, mrp: 800, tags: ["glitter", "metallic", "decor"], category: "resin-art" },
  { name: "Crushed Clear Glass for Resin Art", description: "200g crushed glass for geode art and resin decor.", price: 169, mrp: 800, tags: ["geode-art", "glass", "decor"], category: "resin-art" },
  { name: "QUORIN Candle Colour Set (8 Colors, 30ml)", description: "Premium candle dye set for soy, gel, paraffin, and beeswax.", price: 579, mrp: 2000, tags: ["candle-color", "wax-dye"], category: "candle-making" },
  { name: "QUORIN Candle Colour Set (6 Colors, 30ml)", description: "Premium candle dye set for all wax types.", price: 436, mrp: 2000, tags: ["candle-color", "wax-dye"], category: "candle-making" },
  { name: "QUORIN Candle Colour Set (8 Colors, 15ml)", description: "Compact candle dye set for DIY candle making.", price: 299, mrp: 1000, tags: ["candle-color", "DIY"], category: "candle-making" },
  { name: "QUORIN Candle Wicks (50 Pieces, 4 Inch)", description: "Premium cotton wicks for candle making.", price: 189, mrp: 1000, tags: ["wicks", "cotton", "candle-making"], category: "candle-making" },
  { name: "Candle Wicks Assorted Pack (125 Pieces)", description: "Multi-size wick pack for jar candles.", price: 299, mrp: 1000, tags: ["wicks", "jar-candle"], category: "candle-making" },
  { name: "Candle Wicks Small Jar Pack (150 Pieces)", description: "Wicks designed for small jar candles and tealights.", price: 284, mrp: 1000, tags: ["wicks", "tealight"], category: "candle-making" },
  { name: "Candle Wicks Assorted Multi-Size (150 Pieces)", description: "Assorted wicks for DIY candle projects.", price: 284, mrp: 1000, tags: ["wicks", "DIY"], category: "candle-making" },
  { name: "QUORIN Blow Torch Fire Gun", description: "Torch for bubble removal in candle making.", price: 265, mrp: 1000, tags: ["torch", "bubble-removal", "craft-tool"], category: "candle-making" },
  { name: "Premium Fragrance Oil Set (Pack of 6)", description: "Long Lasting Aroma, Craft Friendly, Home Fragrance.", price: 299, mrp: 2000, tags: ["fragrance-oil", "candle-making"], category: "candle-making" },
  { name: "Quorin DIY Soap Colouring Kit (8 Colors)", description: "Easy to Use, Beginner Friendly, Vibrant Colors.", price: 198, mrp: 1000, tags: ["soap-color", "melt-and-pour"], category: "soap-making" },
  { name: "QUORIN Liquid Soap Colour Kit with Silicone Mold", description: "Includes Mold, Easy Mixing, DIY Gifting.", price: 284, mrp: 1000, tags: ["soap-color", "silicone-mold", "handmade-soap"], category: "soap-making" },
  { name: "Premium Fragrance Oil Set (Pack of 6)", description: "Essential oil fragrances for soap making.", price: 299, mrp: 2000, tags: ["soap-fragrance", "essential-oil"], category: "soap-making" },
];

async function seed() {
  const container = await initializeContainer(process.cwd(), {
    skipMigrations: true,
    skipDbConnection: false,
  });
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve("product");

  // Create categories
  const categories = {};
  for (const catId of ["resin-art", "candle-making", "soap-making"]) {
    const [cat] = await productModuleService.createProductCategories([
      { title: catId.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase()) },
    ]);
    categories[catId] = cat.id;
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
              options: [{ option_id: "size", value: "default" }],
            },
          ],
          categories: p.category ? [{ id: categories[p.category] }] : undefined,
          tags: p.tags.map(t => ({ value: t })),
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
