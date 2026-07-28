import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
