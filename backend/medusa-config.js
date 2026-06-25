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
    redisUrl: "redis://localhost:6379",
  },
  modules: {
    api_key: {
      resolve: "@medusajs/api-key",
    },
    store: {
      resolve: "@medusajs/store",
    },
    sales_channel: {
      resolve: "@medusajs/sales-channel",
    },
    product: {
      resolve: "@medusajs/product",
    },
    region: {
      resolve: "@medusajs/region",
    },
    currency: {
      resolve: "@medusajs/currency",
    },
    customer: {
      resolve: "@medusajs/customer",
    },
    cart: {
      resolve: "@medusajs/cart",
    },
    order: {
      resolve: "@medusajs/order",
    },
    payment: {
      resolve: "@medusajs/payment",
    },
    inventory: {
      resolve: "@medusajs/inventory",
    },
    stock_location: {
      resolve: "@medusajs/stock-location",
    },
    pricing: {
      resolve: "@medusajs/pricing",
    },
    promotion: {
      resolve: "@medusajs/promotion",
    },
    tax: {
      resolve: "@medusajs/tax",
    },
    fulfillment: {
      resolve: "@medusajs/fulfillment",
    },
    settings: {
      resolve: "@medusajs/settings",
    },
    user: {
      resolve: "@medusajs/user",
      options: {
        jwt_secret: process.env.JWT_SECRET || "medusa-secret",
      },
    },
    auth: {
      resolve: "@medusajs/auth",
    },
    event_bus: {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: "redis://localhost:6379",
      },
    },
    workflow_engine: {
      resolve: "@medusajs/workflow-engine-redis",
      options: {
        redis: {
          redisUrl: "redis://localhost:6379",
        },
      },
    },
    cache: {
      resolve: "@medusajs/cache-redis",
      options: {
        redisUrl: "redis://localhost:6379",
      },
    },
  },
  plugins: [],
  featureFlags: {},
  admin: {
    disable: true,
  },
};
