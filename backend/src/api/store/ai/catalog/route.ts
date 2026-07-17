import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query")
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "description",
      "thumbnail",
      "status",
      "categories.id",
      "categories.name",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.manage_inventory",
      "variants.calculated_price.*",
    ],
    filters: { status: "published" },
  })

  res.json({
    schema_version: "1.0",
    entity_type: "catalog",
    currency_note: "Use calculated price data returned by the canonical commerce backend; never infer a price from marketing copy.",
    products: products.map((product: any) => ({
      id: product.id,
      name: product.title,
      handle: product.handle,
      description: product.description,
      image: product.thumbnail,
      categories: product.categories?.map((category: any) => ({ id: category.id, name: category.name })) ?? [],
      variants: product.variants?.map((variant: any) => ({
        id: variant.id,
        title: variant.title,
        sku: variant.sku,
        inventory_managed: variant.manage_inventory,
        calculated_price: variant.calculated_price ?? null,
      })) ?? [],
    })),
    generated_at: new Date().toISOString(),
  })
}
