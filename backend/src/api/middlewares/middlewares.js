const { defineMiddlewares } = require("@medusajs/framework/http");
const ensureCalculatedPriceField = require("./ensure-calculated-price-field");

module.exports = defineMiddlewares([
  {
    matcher: "/store/products*",
    middlewares: [ensureCalculatedPriceField],
  },
]);
