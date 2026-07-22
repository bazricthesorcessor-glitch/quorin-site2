const { loadEnv, defineConfig } = require("@medusajs/framework/utils")

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const isLocalDatabase =
  process.env.DATABASE_URL?.includes("localhost") ||
  process.env.DATABASE_URL?.includes("127.0.0.1")

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: isLocalDatabase
      ? {}
      : {
          connection: {
            ssl: {
              rejectUnauthorized: false,
            },
          },
        },
    http: {
      storeCors:
        process.env.STORE_CORS ||
        "http://localhost:5173,http://127.0.0.1:5173,https://quorin.in,https://www.quorin.in",
      adminCors:
        process.env.ADMIN_CORS ||
        "http://localhost:9000,http://127.0.0.1:9000,http://localhost:5173,https://quorin.in,https://www.quorin.in",
      authCors:
        process.env.AUTH_CORS ||
        "http://localhost:9000,http://127.0.0.1:9000,http://localhost:5173,https://quorin.in,https://www.quorin.in",
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
      authMethodsPerActor: {
        user: ["emailpass"],
        customer: ["emailpass"],
      },
    },
  },

  admin: {
    disable: false,
    path: "/app",
  },
})
