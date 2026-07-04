require("dotenv").config();
const { initializeContainer, default: medusaLoader } = require("./node_modules/@medusajs/medusa/dist/loaders/index.js");

async function listServices() {
  const { container } = await medusaLoader({
    directory: process.cwd(),
    expressApp: null,
    skipLoadingEntryPoints: true,
  });
  
  // List all keys in the container
  const keys = Object.getOwnPropertyNames(container);
  console.log("Container keys:", keys.length);
  // Find auth-related services
  const authKeys = keys.filter(k => k.toLowerCase().includes('auth') || k.toLowerCase().includes('user') || k.toLowerCase().includes('password'));
  console.log("Auth-related keys:", authKeys);
  
  process.exit(0);
}

listServices();
