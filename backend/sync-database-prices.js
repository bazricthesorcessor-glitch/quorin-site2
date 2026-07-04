const medusaLoader = require("./node_modules/@medusajs/medusa/dist/loaders/index.js").default;

const TITLE_TO_LOCAL_ID_MAP = {
  "QUORIN Crystal Clear Epoxy Resin and Hardener Kit": "resin",
  "Liquid Resin Pigment Combo Set": "resin-pigment",
  "QUORIN Eco Tones Pigment Paste Set": "eco-cast",
  "QUORIN Eco-Create Eco Resin": "eco-cast",
  "QUORIN Resin Tools Kit": "deburring-tool",
  "Quorin 15-Piece Resin Art Tool Kit": "resin-bubble-remover",
  "QUORIN Hand Drill for Resin Art": "hand-drill",
  "QUORIN Resin Art Tools Combo Kit": "combo-heat-tool",
  "Resin Glitter for Epoxy Art": "glitter",
  "Crushed Clear Glass for Resin Art": "crushed-glass",
  "QUORIN Candle Colour Set": "candle-pigment",
  "QUORIN Candle Wicks": "wick-combo",
  "QUORIN Blow Torch Fire Gun": "jet-lighter",
  "Premium Fragrance Oil Set": "fragrance-oil",
  "Quorin DIY Soap Colouring Kit": "soap-dye",
  "QUORIN Liquid Soap Colour Kit with Silicone Mold": "soap-dye-mould"
};

const LOCAL_PRICES = {
  "resin": 677,
  "resin-pigment": 112,
  "eco-cast": 210,
  "deburring-tool": 1062,
  "resin-bubble-remover": 407,
  "hand-drill": 170,
  "combo-heat-tool": 426,
  "glitter": 213,
  "crushed-glass": 299,
  "candle-pigment": 156,
  "wick-combo": 114,
  "jet-lighter": 708,
  "fragrance-oil": 224,
  "soap-dye": 315,
  "soap-dye-mould": 899
};

function getVariantPrice(localId, variantTitle) {
  const base = LOCAL_PRICES[localId] || 100;
  if (localId === 'resin-pigment') {
    if (variantTitle.includes('10')) return 179;
    return 112;
  }
  if (localId === 'eco-cast') {
    if (variantTitle.includes('10')) return 336;
    return 210;
  }
  if (localId === 'candle-pigment') {
    if (variantTitle.includes('6 Colors 30ml')) return 234;
    if (variantTitle.includes('8 Colors 30ml')) return 312;
    return 156;
  }
  if (localId === 'wick-combo') {
    if (variantTitle.includes('125')) return 250;
    if (variantTitle.includes('150')) return 285;
    return 114;
  }
  return base;
}

async function sync() {
  const { container } = await medusaLoader({
    directory: process.cwd(),
    expressApp: null,
    skipLoadingEntryPoints: true,
  });

  const dbConnection = container.resolve("__pg_connection__");
  
  // Query all variants and their product titles
  const variants = await dbConnection.raw(`
    SELECT pv.id as variant_id, p.title as product_title, pv.title as variant_title 
    FROM product_variant pv 
    JOIN product p ON p.id = pv.product_id;
  `);

  console.log(`Found ${variants.rows.length} variants in database.`);

  let updatedCount = 0;
  for (const row of variants.rows) {
    const localId = TITLE_TO_LOCAL_ID_MAP[row.product_title];
    if (localId) {
      const correctPrice = getVariantPrice(localId, row.variant_title);
      const amountInMinorUnits = correctPrice * 100;
      
      // Get the price set ID linked to this variant
      const links = await dbConnection.raw(`
        SELECT price_set_id FROM product_variant_price_set WHERE variant_id = ?;
      `, [row.variant_id]);

      if (links.rows.length > 0) {
        const priceSetId = links.rows[0].price_set_id;
        
        // Update price table for this price set ID where currency is INR
        const updateResult = await dbConnection.raw(`
          UPDATE price 
          SET amount = ? 
          WHERE price_set_id = ? AND currency_code = 'inr';
        `, [amountInMinorUnits, priceSetId]);
        
        console.log(`Updated price for "${row.product_title}" - "${row.variant_title}" to ₹${correctPrice}`);
        updatedCount++;
      } else {
        console.warn(`No price set link found for variant "${row.variant_title}"`);
      }
    } else {
      console.warn(`Could not find local catalog mapping for "${row.product_title}"`);
    }
  }

  console.log(`\nSuccessfully synchronized ${updatedCount} variant prices in the database.`);
  process.exit(0);
}

sync().catch(e => {
  console.error("Sync failed:", e);
  process.exit(1);
});
