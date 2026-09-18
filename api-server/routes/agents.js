import { query } from '../db/client.js';
import { verifyJWT } from '../middleware/auth.js';

export default async function (fastify, opts) {
    fastify.addHook('preHandler', verifyJWT);

    fastify.get('/', async (request, reply) => {
        const result = await query('SELECT * FROM agents WHERE user_id = $1', [request.user.id]);
        return result.rows;
    });

    fastify.post('/', async (request, reply) => {
        const { name, description, workflow_json } = request.body;
        const result = await query(
            'INSERT INTO agents (user_id, name, description, workflow_json) VALUES ($1, $2, $3, $4) RETURNING *',
            [request.user.id, name, description, JSON.stringify(workflow_json || {})]
        );
        return result.rows[0];
    });

    fastify.get('/:id', async (request, reply) => {
        const result = await query('SELECT * FROM agents WHERE id = $1 AND user_id = $2', [request.params.id, request.user.id]);
        if (result.rowCount === 0) return reply.code(404).send({ error: 'Not found' });
        return result.rows[0];
    });

    fastify.put('/:id', async (request, reply) => {
        const { name, description, workflow_json } = request.body;
        const result = await query(
            'UPDATE agents SET name = COALESCE($1, name), description = COALESCE($2, description), workflow_json = COALESCE($3, workflow_json) WHERE id = $4 AND user_id = $5 RETURNING *',
            [name, description, workflow_json ? JSON.stringify(workflow_json) : null, request.params.id, request.user.id]
        );
        if (result.rowCount === 0) return reply.code(404).send({ error: 'Not found' });
        return result.rows[0];
    });

    fastify.delete('/:id', async (request, reply) => {
        const result = await query('DELETE FROM agents WHERE id = $1 AND user_id = $2', [request.params.id, request.user.id]);
        if (result.rowCount === 0) return reply.code(404).send({ error: 'Not found' });
        return { success: true };
    });

    fastify.post('/:id/deploy', async (request, reply) => {
        const result = await query(
            "UPDATE agents SET status = 'running', deployed_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *",
            [request.params.id, request.user.id]
        );
        if (result.rowCount === 0) return reply.code(404).send({ error: 'Not found' });
        return result.rows[0];
    });

    fastify.post('/:id/stop', async (request, reply) => {
        const result = await query(
            "UPDATE agents SET status = 'stopped' WHERE id = $1 AND user_id = $2 RETURNING *",
            [request.params.id, request.user.id]
        );
        if (result.rowCount === 0) return reply.code(404).send({ error: 'Not found' });
        return result.rows[0];
    });
}
