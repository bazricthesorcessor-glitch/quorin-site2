require("dotenv").config();
const loaders = require("./node_modules/@medusajs/medusa/dist/loaders/index.js");
const { initializeContainer, default: medusaLoader } = loaders;

async function createAdmin() {
  const { container } = await medusaLoader({
    directory: process.cwd(),
    expressApp: null,
    skipLoadingEntryPoints: true,
  });
  const userService = container.resolve("user");
  
  try {
    const user = await userService.createUsers([{
      email: "admin@quorin.com",
      first_name: "Admin",
      last_name: "User",
      role: "admin"
    }]);
    console.log("Created user:", JSON.stringify(user, null, 2));
  } catch (e) {
    console.error("Error creating user:", e.message);
    console.error(e.stack);
  }
  
  process.exit(0);
}

createAdmin();
