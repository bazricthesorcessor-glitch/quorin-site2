import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.json({
    schema_version: "1.0",
    service: "QUORIN AI Commerce Interface",
    purpose: "Structured, factual commerce data for assistants, agents and other machine clients.",
    principles: [
      "Current price and availability must come from canonical commerce data.",
      "Trust is evidence-based and never represented as a self-issued boolean certification.",
      "Recommendations must disclose why an item matched the request.",
      "Safety information must not be omitted to improve conversion.",
    ],
    endpoints: {
      brand: "/store/ai/brand",
      catalog: "/store/ai/catalog",
      recommendations: "/store/ai/recommendations",
      policies: "/store/ai/policies",
    },
    generated_at: new Date().toISOString(),
  })
}
