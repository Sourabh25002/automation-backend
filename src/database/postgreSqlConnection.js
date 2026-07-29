import pg from 'pg';
const { Pool } = pg;
import { config } from '../utils/config.js';

const pool = new Pool({
    connectionString: config.DATABASE_URL,
    connectionTimeoutMillis: 10000
});

export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log(`Database Connected...`);
        client.release();
    } catch (error) {
        console.error('PostgreSQL Connection Error:', error.message);
        process.exit(1);
    }
};

export default pool;
