// lib/db.ts
import { drizzle } from 'drizzle-orm/neon-http'; // or your adapter
import { neon } from '@neondatabase/serverless';
import * as schema from '@/configs/schema';

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema }); // ✅ important for db.query.usersTable
