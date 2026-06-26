const express = require("express");
const http = require("http");
const loaders = require("./node_modules/@medusajs/medusa/dist/loaders/index.js");
const { initializeContainer, default: medusaLoader } = loaders;
const { ContainerRegistrationKeys } = require("./node_modules/@medusajs/framework/dist/utils/index.js");

async function main() {
  let server = null;
  let shutdownFn = null;
  let isShuttingDown = false;

  try {
    process.env.NODE_ENV = "development";
    const directory = process.cwd();

    const container = await initializeContainer(directory, { skipDbConnection: true });
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    logger.info("Container initialized, starting Medusa loaders...");

    const app = express();
    app.use(express.json());

    const { shutdown } = await medusaLoader({
      directory,
      expressApp: app,
    });
    shutdownFn = shutdown;

    app.get("/health", (_, res) => res.status(200).send("OK"));

    const port = 9000;
    server = app.listen(port, "0.0.0.0", () => {
      logger.success(null, `Medusa backend running at http://localhost:${port}`);
      logger.info(null, `Store API: http://localhost:${port}/store`);
      logger.info(null, `Admin API: http://localhost:${port}/admin`);
    });

    const cleanup = async () => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      logger.info("Shutting down...");
      if (shutdownFn) await shutdownFn();
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
      process.exit(0);
    };

    process.on("SIGTERM", cleanup);
    process.on("SIGINT", cleanup);

    // Prevent unhandled rejections from killing the process
    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
    });

    // Keep the event loop alive
    const keepAlive = setInterval(() => {}, 60000);
    if (keepAlive.unref) {
      keepAlive.unref();
    }

  } catch (e) {
    console.error("Fatal error:", e.message);
    console.error(e.stack);
    if (server) server.close();
    process.exit(1);
  }
}

main();
