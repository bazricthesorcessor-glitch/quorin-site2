require("dotenv").config();

const { initializeContainer } = require("./node_modules/@medusajs/medusa/dist/loaders");
const { ContainerRegistrationKeys } = require("./node_modules/@medusajs/framework/dist/utils");

module.exports = async function main() {
  const container = await initializeContainer(process.cwd(), { skipMigrations: true, skipDbConnection: false });
  
  // Get the module registry
  const moduleServiceRegistry = container.resolve(ContainerRegistrationKeys.MODULE_SERVICE_REGISTRY);
  
  // Access the product service
  const productModuleService = moduleServiceRegistry.get("product");
  const pricingModuleService = moduleServiceRegistry.get("pricing");
  const regionModuleService = moduleServiceRegistry.get("region");
  
  // Get all products
  const products = await productModuleService.listProducts({ status: "published" }, { relations: ["variants"] });
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
