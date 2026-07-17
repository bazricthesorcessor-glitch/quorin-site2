import {
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
} from "@medusajs/medusa/core-flows";
import { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

const PRODUCT_DATA = [
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
