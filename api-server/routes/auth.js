import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/client.js';
import { verifyJWT } from '../middleware/auth.js';

export default async function (fastify, opts) {
    fastify.post('/register', async (request, reply) => {
        const { email, password, name } = request.body;
        if (!email || !password) return reply.code(400).send({ error: 'Email and password required' });
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const result = await query(
                'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, plan',
                [email, hashedPassword, name]
            );
            const user = result.rows[0];
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'saas-super-secret-jwt-2026');
            return { token, user };
        } catch (e) {
            return reply.code(400).send({ error: e.message });
        }
    });

    fastify.post('/login', async (request, reply) => {
        const { email, password } = request.body;
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'saas-super-secret-jwt-2026');
        return { token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } };
    });

    fastify.get('/me', { preHandler: [verifyJWT] }, async (request, reply) => {
        const result = await query('SELECT id, email, name, plan FROM users WHERE id = $1', [request.user.id]);
        return result.rows[0];
    });
}
