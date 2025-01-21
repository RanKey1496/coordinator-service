import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env'});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export default pool;