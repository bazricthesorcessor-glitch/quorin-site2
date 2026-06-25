async function ensureCalculatedPriceField(req, res, next) {
  if (req.queryConfig && req.queryConfig.fields) {
    const hasCalculatedPrice = req.queryConfig.fields.some(
      (field) =>
        field === "variants.calculated_price" ||
        field.startsWith("variants.calculated_price.")
    );
    if (!hasCalculatedPrice) {
      req.queryConfig.fields = [...req.queryConfig.fields, "variants.calculated_price"];
    }
  }
  return next();
}

module.exports = ensureCalculatedPriceField;
