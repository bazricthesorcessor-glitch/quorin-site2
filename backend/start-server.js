const express = require("express");
const { initializeContainer, default: medusaLoader } = require("./node_modules/@medusajs/medusa/dist/loaders/index.js");
const { ContainerRegistrationKeys } = require("./node_modules/@medusajs/framework/dist/utils/index.js");

async function main() {
  try {
    process.env.NODE_ENV = "development";
    const directory = process.cwd();

    // Initialize container first (without DB connection)
    const container = await initializeContainer(directory, { skipDbConnection: true });
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    logger.info("Container initialized, starting Medusa loaders...");

    // Create express app
    const app = express();
    app.use(express.json());

    // Load everything through Medusa's loader
    const { shutdown, modules } = await medusaLoader({
      directory,
      expressApp: app,
    });

    // Health check (will be overwritten by Medusa's routes)
    app.get("/health", (_, res) => res.status(200).send("OK"));

    const port = 9000;
    const server = app.listen(port, "0.0.0.0", () => {
      logger.success(null, `Medusa backend running at http://localhost:${port}`);
      logger.info(null, `Store API: http://localhost:${port}/store`);
      logger.info(null, `Admin API: http://localhost:${port}/admin`);
    });

    // Graceful shutdown
    const cleanup = async () => {
      logger.info("Shutting down...");
      await shutdown();
      server.close();
      process.exit(0);
    };

    process.on("SIGTERM", cleanup);
    process.on("SIGINT", cleanup);
  } catch (e) {
    console.error("Fatal error:", e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

main();
