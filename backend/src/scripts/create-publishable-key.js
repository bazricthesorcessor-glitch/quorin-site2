const { bootstrap } = require("@medusajs/medusa");
const { Modules } = require("@medusajs/framework/utils");
const path = require("path");

async function main() {
  process.chdir(path.join(__dirname, ".."));
  
  // Bootstrap Medusa container
  const { container } = await bootstrap({
    cwd: path.join(__dirname, ".."),
    config: {
      projectConfig: {
        jwtSecret: process.env.JWT_SECRET || "quorin-jwt-secret-change-in-production",
        cookieSecret: process.env.COOKIE_SECRET || "quorin-cookie-secret-change-in-production",
        databaseUrl: process.env.DATABASE_URL || "postgresql://quorin:quorin@localhost:5432/quorin",
        databaseType: "pg",
      },
    },
  });

  const publishableKey = "pk_quorin_live_a1b2c3d4e5f6g7h8i9j0";

  try {
    // Create the publishable API key
    const apiKeysModule = container.resolve(Modules.API_KEY);
    
    // Check if key already exists
    const { api_keys } = await apiKeysModule.listPublishableApiKeys({
      token: publishableKey,
    });

    if (api_keys.length > 0) {
      console.log(`✓ Publishable key already exists: ${publishableKey}`);
    } else {
      await apiKeysModule.createPublishableApiKeys({
        token: publishableKey,
        created_by: "system",
      });
      console.log(`✓ Created publishable API key: ${publishableKey}`);
    }

    // Find sales channel and link it
    const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
    const { sales_channels } = await salesChannelModule.listAndCountSalesChannels({
      name: "QUORIN Store",
    });

    if (sales_channels.length > 0) {
      const salesChannelId = sales_channels[0].id;
      const { api_keys: keys } = await apiKeysModule.listPublishableApiKeys({
        token: publishableKey,
      });
      
      if (keys.length > 0) {
        await apiKeysModule.updatePublishableApiKeys(keys[0].id, {
          sales_channel_ids: [salesChannelId],
        });
        console.log(`✓ Linked key to sales channel: ${salesChannelId}`);
      }
    }

    console.log("\n📋 Add this to your frontend .env:");
    console.log(`VITE_MEDUSA_PUBLISHABLE_KEY=${publishableKey}`);
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  }

  process.exit(0);
}

main();
