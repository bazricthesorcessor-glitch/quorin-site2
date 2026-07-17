const { Modules } = require("@medusajs/framework/utils");

async function main({ container }) {
  const apiKeysModule = container.resolve(Modules.API_KEY);
  const key = "pk_quorin_live_a1b2c3d4e5f6g7h8i9j0";

  const { api_keys } = await apiKeysModule.listPublishableApiKeys({ token: key });
  if (api_keys.length > 0) {
    console.log("Key already exists:", key);
    return;
  }

  await apiKeysModule.createPublishableApiKeys({ token: key, created_by: "system" });
  console.log("Created publishable key:", key);
}

exports.default = main;
