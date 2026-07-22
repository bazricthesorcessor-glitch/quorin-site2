const CORS_ORIGIN = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000,https://quorin.in,https://www.quorin.in").split(",");

module.exports = (req, res, next) => {
  if (req.path.startsWith("/static/") || req.path.startsWith("/uploads/")) {
    const origin = req.headers.origin;
    if (origin && CORS_ORIGIN.includes(origin.trim())) {
      res.setHeader("Access-Control-Allow-Origin", origin.trim());
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD");
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Access-Control-Max-Age", "86400");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
  }
  next();
};
