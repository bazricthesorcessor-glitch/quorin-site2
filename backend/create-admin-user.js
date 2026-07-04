const path = require('path');
process.chdir(path.join(__dirname));
const { initialize, MedusaContainer } = require('@medusajs/framework');
const { Modules, buildHash } = require('@medusajs/framework/utils');

async function main() {
  // Initialize the Medusa app
  await initialize();
  const container = global.__MEDUSA_CONTAINER__;
  
  console.log('Container initialized');
  
  // Get the user service
  const userService = container.resolve('user_service');
  console.log('User service resolved');
  
  // Get the auth service
  const authService = container.resolve('auth_service');
  console.log('Auth service resolved');
  
  // Check existing auth_identity
  const authModule = container.resolve('auth');
  console.log('Auth module resolved');
  
  // List all users
  try {
    const users = await userService.list({});
    console.log('Existing users:', users.map(u => ({ id: u.id, email: u.email })));
  } catch(e) {
    console.log('Error listing users:', e.message);
  }
  
  // Check auth identities
  try {
    const authIdentities = await authModule.list();
    console.log('Auth identities:', authIdentities.map(a => ({ id: a.id, entity_id: a.entity_id, provider: a.provider })));
  } catch(e) {
    console.log('Error listing auth identities:', e.message);
  }
  
  // Get the auth_identity we created
  const { Pool } = require('pg');
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env' });
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  const authRow = await client.query(
    'SELECT id FROM auth_identity WHERE id IS NOT NULL LIMIT 1'
  );
  console.log('Auth identity ID:', authRow.rows[0]?.id);
  
  const provRow = await client.query(
    'SELECT entity_id, provider FROM provider_identity WHERE entity_id = $1', ['admin@quorin.com']
  );
  console.log('Provider identity:', provRow.rows[0]);
  
  await pool.end();
}

main().catch(console.error);
