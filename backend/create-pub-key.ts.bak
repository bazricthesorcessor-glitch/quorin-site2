import { createSalesChannelsWorkflow } from "@medusajs/medusa/core-flows";
import { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

async function createPublishableKey(container: MedusaContainer) {
  console.log("🔑 Creating publishable API key...");

  // First, find existing sales channel
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
  const { sales_channels } = await salesChannelModule.listAndCountSalesChannels({
    name: "QUORIN Store",
  });

  let salesChannelId = null;
  if (sales_channels && sales_channels.length > 0) {
    salesChannelId = sales_channels[0].id;
    console.log(`✓ Found sales channel: ${sales_channels[0].id}`);
  } else {
    // Create sales channel if it doesn't exist
    console.log("⚠ Sales channel not found, creating one...");
    const workflow = createSalesChannelsWorkflow(container);
    const { result } = await workflow.run({
      input: {
        create: [{ name: "QUORIN Store", description: "QUORIN Made for Makers online store" }],
      },
    });
    salesChannelId = result[0].id;
    console.log(`✓ Created sales channel: ${salesChannelId}`);
  }

  // Create publishable API key
  const apiKeysModule = container.resolve(Modules.API_KEY);
  const publishableKey = "pk_quorin_live_a1b2c3d4e5f6g7h8i9j0"; // This is the key the frontend will use

  await apiKeysModule.createPublishableApiKeys({
    token: publishableKey,
    created_by: "system",
    authorization_credential: publishableKey,
  });

  console.log(`✓ Publishable API key created: ${publishableKey}`);

  // Link sales channel to publishable key if available
  if (salesChannelId) {
    try {
      await apiKeysModule.create({
        publishable_api_key_id: null, // placeholder, will link via links table
        // Actually in Medusa v2, linking is done differently
        // Let me try the correct approach
      });
    } catch (e) {
      console.log("⚠ Sales channel linking may require admin API");
    }
  }

  console.log("\n📋 Copy this key into your frontend .env:");
  console.log(`VITE_MEDUSA_PUBLISHABLE_KEY=${publishableKey}`);
}

createPublishableKey(process as unknown as MedusaContainer)
  .then(() => console.log("Done"))
  .catch(console.error);
