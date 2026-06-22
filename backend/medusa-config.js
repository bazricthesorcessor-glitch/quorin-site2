const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  projectConfig: {
    jwtSecret: process.env.JWT_SECRET,
    cookieSecret: process.env.COOKIE_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    databaseType: "pg",
    databaseDriverOptions: {
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    },
    http: {
      authCors: process.env.CORS_ORIGIN || "http://localhost:5173",
      storeCors: process.env.CORS_ORIGIN || "http://localhost:5173",
      adminCors: process.env.CORS_ORIGIN || "http://localhost:3000",
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [],
  plugins: [],
  featureFlags: {},
};
