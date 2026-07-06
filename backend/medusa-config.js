const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

// Enforce SSL globally via env variables for node-postgres and all Medusa modules
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost") && !process.env.DATABASE_URL.includes("127.0.0.1")) {
  process.env.PGSSLMODE = "require";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  if (!process.env.DATABASE_URL.includes("sslmode=")) {
    process.env.DATABASE_URL = `${process.env.DATABASE_URL}${process.env.DATABASE_URL.includes("?") ? "&" : "?"}sslmode=require`;
  }
}

module.exports = {
  projectConfig: {
    jwtSecret: process.env.JWT_SECRET,
    cookieSecret: process.env.COOKIE_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    databaseType: "pg",
    databaseDriverOptions: {
      ssl: process.env.DATABASE_URL && (process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1"))
        ? false
        : { rejectUnauthorized: false },
    },
    http: {
      authCors: process.env.AUTH_CORS || "http://localhost:3000,http://localhost:5173",
      storeCors: process.env.STORE_CORS || "http://localhost:3000,http://localhost:5173",
      adminCors: process.env.ADMIN_CORS || "http://localhost:3000,http://localhost:5173",
      cookieSecret: process.env.COOKIE_SECRET,
    },
    redisUrl: process.env.REDIS_URL,
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
      options: {
        providers: [
          {
            resolve: "@medusajs/auth-emailpass",
            id: "emailpass",
            options: {},
          },
          {
            resolve: "@medusajs/auth-google",
            id: "google",
            options: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackUrl: process.env.GOOGLE_CALLBACK_URL,
            },
          },
        ],
      },
    },
    ...(process.env.REDIS_URL
      ? {
          event_bus: {
            resolve: "@medusajs/event-bus-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
          workflow_engine: {
            resolve: "@medusajs/workflow-engine-redis",
            options: {
              redis: {
                redisUrl: process.env.REDIS_URL,
              },
            },
          },
          cache: {
            resolve: "@medusajs/cache-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        }
      : {}),
    file: {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: path.join(__dirname, "public/uploads"),
            },
          },
        ],
      },
    },
  },
  plugins: [],
  featureFlags: {},
  admin: {
    disable: false,
    path: "/app",
  },
};
