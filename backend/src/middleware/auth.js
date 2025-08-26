import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { verifyToken as verifyClerkToken } from '@clerk/backend';
import { db } from '../../config/database.js';
import { users } from '../schema/tables.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Hash password
export async function hashPassword(password) {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
}

// Compare password
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Create or get user from Clerk token
async function createOrGetUserFromClerk(clerkUser) {
  try {
    // Check if user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.id, clerkUser.sub));
    
    if (existingUser) {
      console.log('✅ Found existing user:', existingUser.email);
      return existingUser;
    }

    // Extract email from Clerk user object (try different properties)
    const email = clerkUser.email || clerkUser.email_addresses?.[0]?.email_address || clerkUser.primary_email_address?.email_address || `${clerkUser.sub}@clerk.local`;
    const firstName = clerkUser.first_name || clerkUser.given_name || '';
    const lastName = clerkUser.last_name || clerkUser.family_name || '';
    const username = email.includes('@') ? email.split('@')[0] : clerkUser.sub;

    // Create new user from Clerk data
    console.log('📝 Creating new user from Clerk data:', email);
    
    try {
      const [newUser] = await db.insert(users).values({
        id: clerkUser.sub, // Clerk user ID
        username: username, // Use email prefix as username or fallback to user ID
        email: email,
        firstName: firstName,
        lastName: lastName,
        passwordHash: 'clerk_managed', // Placeholder since Clerk manages auth
        isActive: true
      }).returning();
      
      console.log('✅ Created new user:', newUser.email);
      return newUser;
    } catch (insertError) {
      // Handle race condition where user might have been created between check and insert
      if (insertError.message.includes('duplicate key')) {
        console.log('🔄 User was created by another request, fetching existing user...');
        const [existingUser] = await db.select().from(users).where(eq(users.id, clerkUser.sub));
        if (existingUser) {
          console.log('✅ Found existing user after race condition:', existingUser.email);
          return existingUser;
        }
      }
      throw insertError;
    }
  } catch (error) {
    console.error('❌ Error creating/getting user from Clerk:', error.message);
    throw error;
  }
}

// Auth middleware
export async function authenticateToken(req, res, next) {
  // For development, allow bypass if no auth header
  if (process.env.NODE_ENV === 'development') {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      console.log('🔧 Development mode: No auth header, using development user');
      req.user = { 
        id: '00000000-0000-0000-0000-000000000001', 
        email: 'dev@example.com',
        firstName: 'Development',
        lastName: 'User'
      };
      return next();
    }
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    console.log('🔍 Attempting to verify Clerk token...');
    
    // Try Clerk JWT token verification
    const clerkUser = await verifyClerkToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });
    
    console.log('✅ Clerk token verified for user:', clerkUser.email || clerkUser.email_addresses?.[0]?.email_address || clerkUser.sub);
    
    // Create or get user from database
    const user = await createOrGetUserFromClerk(clerkUser);
    
    // Set user info for request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    console.log('✅ User authenticated:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ Clerk authentication failed:', error.message);
    
    // Fallback to development mode for development environment
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Falling back to development user due to auth error');
      req.user = { 
        id: '00000000-0000-0000-0000-000000000001', 
        email: 'dev@example.com',
        firstName: 'Development',
        lastName: 'User'
      };
      return next();
    }
    
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Optional auth middleware (doesn't fail if no token)
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Ignore token errors in optional auth
    }
  }
  
  next();
}
