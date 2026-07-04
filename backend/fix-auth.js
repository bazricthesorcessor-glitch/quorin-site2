require("dotenv").config();
const { initializeContainer, default: medusaLoader } = require("./node_modules/@medusajs/medusa/dist/loaders/index.js");
const { sha256 } = require("crypto");

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
  } catch (e) {
    console.error("Cannot resolve auth_identity service");
    process.exit(1);
  }
  
  // Get the user
  const userService = container.resolve("user");
  const users = await userService.listUsers({ email: "admin@quorin.com" });
  if (!users.length) {
    console.error("User not found");
    process.exit(1);
  }
  const user = users[0];
  console.log("Found user:", user.id, user.email);
  
  // Create auth identity with password
  // In Medusa v2, passwords are hashed and stored
  const password = "admin123";
  const hashedPassword = sha256(password).digest('hex');
  console.log("Password hash:", hashedPassword);
  
  // Create auth identity
  const authIdentity = await authIdentityService.createAuthIdentities([{
    provider: "emailpass",
    provider_id: user.id,
    credentials: {},
    app_metadata: {
      password_hash: hashedPassword
    }
  }]);
  console.log("Auth identity created:", JSON.stringify(authIdentity, null, 2));
  
  process.exit(0);
}

fixAuth();
