import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.json({
    schema_version: "1.0",
    entity_type: "commerce_policies",
    status: "requires_admin_verified_content",
    warning: "Policy text must be populated from the current approved QUORIN legal/operations policy source before production. Machine clients should not infer missing terms.",
    policies: {
      shipping: null,
      returns: null,
      refunds: null,
      cancellations: null,
      privacy: null,
      terms: null,
    },
    generated_at: new Date().toISOString(),
  })
}
