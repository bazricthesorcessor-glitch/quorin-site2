require("dotenv").config();
const { initializeContainer, default: medusaLoader } = require("./node_modules/@medusajs/medusa/dist/loaders/index.js");
const scryptKdf = require("scrypt-kdf");

async function fixAuth() {
  const { container } = await medusaLoader({
    directory: process.cwd(),
    expressApp: null,
    skipLoadingEntryPoints: true,
  });
  
  // Get the auth identity service
  let authIdentityService;
  try {
    authIdentityService = container.resolve("auth_identity");
    console.log("Resolved auth_identity service");
  } catch (e) {
    console.error("Cannot resolve auth_identity:", e.message);
    console.log("\nAvailable container keys:", Object.getOwnPropertyNames(container).filter(k => k.includes('auth') || k.includes('user') || k.includes('identity')).slice(0, 20));
    process.exit(1);
  }
  
  const email = "admin@quorin.com";
  const password = "admin123";
  
  // Hash password with scrypt-kdf using default config (logN: 15, r: 8, p: 1)
  const hashConfig = { logN: 15, r: 8, p: 1 };
  const passwordHash = await scryptKdf.kdf(password, hashConfig);
  const passwordHashBase64 = passwordHash.toString("base64");
  console.log("Password hashed with scrypt-kdf");
  
  // Update or create auth_identity
  try {
    // Try to update existing
    const updated = await authIdentityService.update(email, {
      provider: "emailpass",
      provider_metadata: { password: passwordHashBase64 },
    });
    console.log("Updated auth_identity:", JSON.stringify(updated, null, 2));
  } catch (e) {
    console.log("Update failed, trying create:", e.message);
    // Try to create
    const created = await authIdentityService.create({
      entity_id: email,
      provider: "emailpass",
      provider_metadata: { password: passwordHashBase64 },
    });
    console.log("Created auth_identity:", JSON.stringify(created, null, 2));
  }
  
  process.exit(0);
}

fixAuth();
