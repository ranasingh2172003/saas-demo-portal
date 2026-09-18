import fetch from 'node-fetch';

export default async function (fastify, opts) {
    fastify.post('/', async (request, reply) => {
        const { text, voice = 'af_heart' } = request.body;
        if (!text) return reply.code(400).send({ error: 'text is required' });

        try {
            const response = await fetch('http://localhost:8880/v1/audio/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'kokoro', input: text, voice })
            });

            if (!response.ok) {
                return reply.code(response.status).send({ error: 'TTS service error' });
            }

            reply.header('Content-Type', 'audio/mpeg');
            return response.body;
        } catch (e) {
            return reply.code(500).send({ error: 'Failed to contact TTS service' });
        }
    });
}
