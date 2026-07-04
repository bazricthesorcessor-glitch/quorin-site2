const { defineMiddlewares } = require("@medusajs/framework/http");
const ensureCalculatedPriceField = require("./ensure-calculated-price-field");
const staticFilesMiddleware = require("./static-files");

module.exports = defineMiddlewares([
  {
    matcher: "/store/products*",
    middlewares: [ensureCalculatedPriceField],
  },
  {
    matcher: "/static*",
    middlewares: [staticFilesMiddleware],
  },
  {
    matcher: "/uploads*",
    middlewares: [staticFilesMiddleware],
  },
]);
