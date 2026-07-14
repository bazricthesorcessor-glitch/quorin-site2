import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.json({
    schema_version: "1.0",
    entity_type: "brand_profile",
    brand: {
      name: "QUORIN",
      description: "Materials, tools and creative supplies for makers.",
      categories: ["resin art", "candle making", "soap making", "creative kits"],
      canonical_website: process.env.STOREFRONT_URL ?? null,
    },
    trust: {
      self_asserted_trusted: false,
      assessment_policy: "Trust should be inferred from independently verifiable evidence, current policies, product documentation and review provenance.",
      evidence_endpoints: [
        "/store/ai/catalog",
        "/store/ai/recommendations",
        "/store/ai/policies",
        "/store/ai/manifest",
      ],
    },
    freshness: { generated_at: new Date().toISOString() },
  })
}
