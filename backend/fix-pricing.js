require("dotenv").config();
const loaders = require("./node_modules/@medusajs/medusa/dist/loaders/index.js");
const { default: medusaLoader } = loaders;

module.exports = async function main() {
  const { container } = await medusaLoader({
    directory: process.cwd(),
    expressApp: null,
    skipLoadingEntryPoints: true,
  });
  
  // Access the product service directly from container
  const productModuleService = container.resolve("product");
  const pricingModuleService = container.resolve("pricing");
  const regionModuleService = container.resolve("region");
  
  // Get all products
  const products = await productModuleService.listProducts({ status: "published" }, { relations: ["variants", "variants.prices"] });
  console.log(`Found ${products.length} products`);
  
  // Get region
  let region = await regionModuleService.listRegions({ currency_code: "inr" });
  if (region.length === 0) {
    const [created] = await regionModuleService.createRegions([{
      name: "India",
      code: "IN",
      currency_code: "inr",
      countries: ["in"],
      is_tax_inclusive: false,
    }]);
    region = [created];
    console.log(`Created region: ${created.id}`);
  } else {
    console.log(`Using region: ${region[0].id}`);
  }
  const regionId = region[0].id;
  
  let fixed = 0;
  for (const product of products) {
    if (!product.variants || product.variants.length === 0) {
      console.log(`  ${product.title} - no variants`);
      continue;
    }
    
    for (const variant of product.variants) {
      if (!variant.prices || variant.prices.length === 0) {
        console.log(`  ${product.title} - ${variant.title} has no prices, skipping`);
        continue;
      }
      
      // Create pricing rules for the region
      for (const price of variant.prices) {
        try {
          await pricingModuleService.createPricePreferences([{
            rule_id: `region-${regionId}`,
            rule_type: "region",
          }]);
        } catch (e) {
          // Ignore if already exists
        }
      }
      fixed++;
    }
  }
  
  console.log(`Fixed ${fixed} variants`);
};
