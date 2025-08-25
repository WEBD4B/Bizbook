import { db } from './config/database.js';
import { users } from './src/schema/tables.js';
import { eq } from 'drizzle-orm';

async function createDevUser() {
  try {
    console.log('Checking if development user exists...');
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.id, '00000000-0000-0000-0000-000000000001'));
    
    if (existingUser.length > 0) {
      console.log('✅ Development user already exists:', existingUser[0]);
      return;
    }
    
    console.log('Creating development user...');
    const devUser = await db.insert(users).values({
      id: '00000000-0000-0000-0000-000000000001',
      username: 'dev_user',
      email: 'dev@example.com',
      firstName: 'Development',
      lastName: 'User',
      passwordHash: 'dev_hash_placeholder',
      isActive: true
    }).returning();
    
    console.log('✅ Development user created successfully:', devUser[0]);
  } catch (error) {
    console.error('❌ Error with development user:', error.message);
    if (error.code === '23505') {
      console.log('User might already exist with different ID');
    }
  }
}

createDevUser().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
