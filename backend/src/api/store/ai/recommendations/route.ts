import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

type RecommendationRequest = {
  intent?: string
  budget_inr?: number
  skill_level?: "beginner" | "intermediate" | "advanced"
  category?: string
}

export async function POST(req: MedusaRequest<RecommendationRequest>, res: MedusaResponse) {
  const body = req.body ?? {}
  const query = req.scope.resolve("query")
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "description", "thumbnail", "categories.name", "variants.id", "variants.title", "variants.calculated_price.*"],
    filters: { status: "published" },
  })

  const intent = String(body.intent ?? "").toLowerCase()
  const category = String(body.category ?? "").toLowerCase()
  const terms = [...intent.split(/\s+/), ...category.split(/\s+/)].filter(term => term.length > 2)

  const ranked = products
    .map((product: any) => {
      const haystack = `${product.title} ${product.description ?? ""} ${(product.categories ?? []).map((item: any) => item.name).join(" ")}`.toLowerCase()
      const matched_terms = terms.filter(term => haystack.includes(term))
      return { product, score: matched_terms.length, matched_terms }
    })
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 6)

  res.json({
    schema_version: "1.0",
    request: body,
    recommendation_policy: {
      ranking: "Deterministic text/category relevance over current published catalog data.",
      limitations: "This endpoint does not claim independent product superiority and does not replace safety instructions or professional advice.",
    },
    recommendations: ranked.map(({ product, score, matched_terms }: any) => ({
      product_id: product.id,
      name: product.title,
      handle: product.handle,
      image: product.thumbnail,
      relevance_score: score,
      why_matched: matched_terms.length ? `Matched request terms: ${matched_terms.join(", ")}` : "General catalog suggestion; no strong intent term matched.",
      variants: product.variants ?? [],
    })),
    generated_at: new Date().toISOString(),
  })
}
