require("dotenv").config();
const loaders = require("./node_modules/@medusajs/medusa/dist/loaders/index.js");
const { default: medusaLoader } = loaders;

async function setup() {
  const { container } = await medusaLoader({
    directory: process.cwd(),
    expressApp: null,
    skipLoadingEntryPoints: true,
  });
  const logger = container.resolve("logger");

  // 1. Create region if it doesn't exist
  const regionModule = container.resolve("region");
  let region = await regionModule.listRegions();
  if (region.length === 0) {
    const [created] = await regionModule.createRegions([{
      name: "India",
      currency_code: "inr",
      countries: ["in"],
      is_tax_inclusive: false,
    }]);
    logger.info(`Created region: ${created.id}`);
    region = [created];
  } else {
    logger.info(`Region already exists: ${region[0].id}`);
  }
  const regionId = region[0].id;

  // 2. Create a publishable API key for store access
  const apiKeyModule = container.resolve("api_key");
  let pbk = await apiKeyModule.listApiKeys({
    token: "pk_d24dd21f67e355e5c0b962f86f8402379a26d67a85eab02334b201085f563b62",
  });
  if (pbk.length === 0) {
    const [key] = await apiKeyModule.createApiKeys([{
      token: "pk_d24dd21f67e355e5c0b962f86f8402379a26d67a85eab02334b201085f563b62",
      name: "Storefront Key",
      created_by: "system",
      listing_allowed: true,
      retrieval_allowed: true,
      authorization_cursor: {},
    }]);
    logger.info(`Created publishable API key: ${key.token}`);
    pbk = [key];
  } else {
    logger.info(`Publishable API key already exists: ${pbk[0].token}`);
  }

  // 3. Get default sales channel and assign products to it
  const salesChannelModule = container.resolve("sales_channel");
  let channels = await salesChannelModule.listSalesChannels({ name: "Default Sales Channel" });
  let channelId = null;
  if (channels.length === 0) {
    const [ch] = await salesChannelModule.createSalesChannels([{
      name: "Default Sales Channel",
    }]);
    channelId = ch.id;
    logger.info(`Created sales channel: ${channelId}`);
  } else {
    channelId = channels[0].id;
    logger.info(`Sales channel already exists: ${channelId}`);
  }

  // 4. Assign all published products to the sales channel
  const productModule = container.resolve("product");
  const products = await productModule.listProducts({ status: "published" });
  let assigned = 0;
  for (const product of products) {
    // Check if already assigned
    const existingChannels = await salesChannelModule.listSalesChannels({
      id: channelId,
    });
    const productWithChannels = await productModule.retrieveProduct(product.id);
    const channelIds = productWithChannels.sales_channels?.map(sc => sc.id) || [];
    if (!channelIds.includes(channelId)) {
      await productModule.updateProducts(product.id, {
        sales_channels: [{ id: channelId }],
      });
      assigned++;
    }
  }
  logger.info(`Assigned ${assigned} products to sales channel: ${channelId}`);

  // 5. Sync pricing - ensure variant prices are visible
  // In Medusa v2, prices on variants need a region to be calculated by the pricing module
  // The prices were created during seed, but we need to ensure the region is linked
  logger.info(`Setup complete. Region: ${regionId}, Sales Channel: ${channelId}`);

  process.exit(0);
}

setup().catch(e => { console.error(e); process.exit(1); });
