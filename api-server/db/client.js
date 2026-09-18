import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://saas_user:saas_pass@localhost:5432/saas_platform'
});
export const query = (text, params) => pool.query(text, params);
