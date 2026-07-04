const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  // 1. Create a user record for admin
  const userId = 'user_admin_001';
  await client.query(
    'INSERT INTO "user" (id, first_name, last_name, email, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
    [userId, 'Quorin', 'Admin', 'admin@quorin.com']
  );
  console.log('Created user:', userId);
  
  // 2. Get the auth_identity
  const authRow = await client.query(
    'SELECT id FROM auth_identity WHERE id IS NOT NULL LIMIT 1'
  );
  const authId = authRow.rows[0]?.id;
  console.log('Auth identity ID:', authId);
  
  // 3. Update auth_identity to link to user
  await client.query(
    'UPDATE auth_identity SET app_metadata = $1 WHERE id = $2',
    [JSON.stringify({ user_id: userId }), authId]
  );
  console.log('Linked auth_identity to user');
  
  // 4. Link user to super admin role (just store the role ID as a string)
  const roleLinkId = 'rl_super_admin_' + Date.now();
  await client.query(
    'INSERT INTO user_rbac_role (id, user_id, rbac_role_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
    [roleLinkId, userId, 'role_super_admin']
  );
  console.log('Linked user to super admin role');
  
  // 5. Verify the setup
  const verifyAuth = await client.query(
    'SELECT id, entity_id, provider, app_metadata FROM auth_identity WHERE id = $1', [authId]
  );
  console.log('\nAuth identity:', JSON.stringify(verifyAuth.rows[0], null, 2));
  
  const verifyProv = await client.query(
    'SELECT entity_id, provider FROM provider_identity WHERE auth_identity_id = $1', [authId]
  );
  console.log('Provider identity:', JSON.stringify(verifyProv.rows[0], null, 2));
  
  const verifyUser = await client.query(
    'SELECT * FROM "user" WHERE id = $1', [userId]
  );
  console.log('User:', JSON.stringify(verifyUser.rows[0], null, 2));
  
  const verifyRole = await client.query(
    'SELECT * FROM user_rbac_role WHERE user_id = $1', [userId]
  );
  console.log('User-RBAC link:', JSON.stringify(verifyRole.rows[0], null, 2));
  
  await pool.end();
  console.log('\nDatabase setup complete!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
