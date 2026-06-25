const { defineMiddlewares } = require("@medusajs/framework/http");
const ensureCalculatedPriceField = require("./middlewares/ensure-calculated-price-field");

const config = defineMiddlewares([
  {
    matcher: "/store/products",
    methods: ["GET"],
    middlewares: [ensureCalculatedPriceField],
  },
  {
    matcher: "/store/products/:id",
    methods: ["GET"],
    middlewares: [ensureCalculatedPriceField],
  },
]);

module.exports = { default: config };
