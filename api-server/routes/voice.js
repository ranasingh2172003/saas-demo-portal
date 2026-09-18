import { query } from '../db/client.js';
import { verifyJWT } from '../middleware/auth.js';

export default async function (fastify, opts) {
    fastify.addHook('preHandler', verifyJWT);

    fastify.post('/session', async (request, reply) => {
        const result = await query(
            'INSERT INTO voice_sessions (user_id) VALUES ($1) RETURNING id as session_id',
            [request.user.id]
        );
        return result.rows[0];
    });

    fastify.get('/session/:id', async (request, reply) => {
        const result = await query('SELECT * FROM voice_sessions WHERE id = $1 AND user_id = $2', [request.params.id, request.user.id]);
        if (result.rowCount === 0) return reply.code(404).send({ error: 'Not found' });
        return result.rows[0];
    });

    fastify.patch('/session/:id', async (request, reply) => {
        const { transcript, duration_secs } = request.body;
        const result = await query(
            'UPDATE voice_sessions SET transcript = COALESCE($1, transcript), duration_secs = COALESCE($2, duration_secs) WHERE id = $3 AND user_id = $4 RETURNING *',
            [transcript, duration_secs, request.params.id, request.user.id]
        );
        if (result.rowCount === 0) return reply.code(404).send({ error: 'Not found' });
        return result.rows[0];
    });

    fastify.get('/usage', async (request, reply) => {
        const result = await query('SELECT SUM(duration_secs) as total_seconds FROM voice_sessions WHERE user_id = $1', [request.user.id]);
        const seconds = result.rows[0].total_seconds || 0;
        return { minutes_used: Math.ceil(seconds / 60), minutes_limit: 100 };
    });
}
