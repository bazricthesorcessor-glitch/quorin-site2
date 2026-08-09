import { defineMiddlewares } from "@medusajs/medusa";
import cors from "cors";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/auth/otp/*",
      middlewares: [
        cors({
          origin: [
            "http://localhost:3000",
            "http://localhost:5173",
            process.env.STORE_CORS || "http://localhost:5173"
          ],
          credentials: true,
        }),
      ],
    },
  ],
});
