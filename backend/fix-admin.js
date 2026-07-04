const path = require('path');
const express = require('express');

async function main() {
  const app = express();
  process.env.MEDUSA_WORKER_MODE = "server";
  
  const { default: load } = require('@medusajs/medusa/dist/loaders');
  const { ContainerRegistrationKeys, FeatureFlag, Modules } = require('@medusajs/framework/utils');
  
  const { container } = await load({
    directory: path.join(__dirname),
    expressApp: app,
    skipLoadingEntryPoints: true,
  });
  
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const workflowService = container.resolve(Modules.WORKFLOW_ENGINE);
  const authService = container.resolve(Modules.AUTH);
  
  console.log('Container initialized');
  
  // Check if RBAC is enabled and get super admin role
  let userRoles = [];
  const rbacEnabled = FeatureFlag.isFeatureEnabled("rbac");
  console.log('RBAC enabled:', rbacEnabled);
  
  if (rbacEnabled) {
    const rbacService = container.resolve(Modules.RBAC);
    const superAdminRoles = await rbacService.listRbacRoles({
      id: "role_super_admin",
    });
    console.log('Super admin roles:', superAdminRoles);
    if (superAdminRoles.length > 0) {
      userRoles = [superAdminRoles[0].id];
    }
  }
  
  if (userRoles.length > 0) {
    console.log('Assigning super admin role to user.');
  }
  
  // Create the user
  const { result: users } = await workflowService.run("create-users-workflow", {
    input: {
      users: [
        {
          email: "admin@quorin.com",
          roles: userRoles,
        },
      ],
    },
  });
  
  const user = users[0];
  console.log('User created:', user);
  
  // Check existing auth_identity
  const { Pool } = require('pg');
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env' });
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  const authRow = await client.query(
    'SELECT * FROM auth_identity WHERE id IS NOT NULL LIMIT 1'
  );
  console.log('Auth identity before:', authRow.rows[0]);
  
  const provRow = await client.query(
    'SELECT * FROM provider_identity WHERE entity_id = $1', ['admin@quorin.com']
  );
  console.log('Provider identity:', provRow.rows[0]);
  
  await pool.end();
  
  // Update auth_identity to link to user
  await authService.updateAuthIdentities({
    id: authRow.rows[0].id,
    app_metadata: {
      user_id: user.id,
    },
  });
  
  console.log('Auth identity linked to user:', user.id);
  
  // Now try to authenticate
  console.log('\nTrying to authenticate...');
  const { success, error, authIdentity } = await authService.authenticate('emailpass', {
    actor_type: "user",
    body: {
      email: "admin@quorin.com",
      password: "admin123",
    },
  });
  
  console.log('Auth result:', { success, error, authIdentity: authIdentity ? authIdentity.id : null });
  
  if (success && authIdentity) {
    console.log('\nSUCCESS! Admin user is now linked and authenticated.');
    console.log('User ID:', user.id);
    console.log('Auth Identity ID:', authIdentity.id);
  } else {
    console.log('\nAuth failed:', error);
  }
  
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
