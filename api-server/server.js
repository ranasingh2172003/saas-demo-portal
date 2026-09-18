import Fastify from 'fastify';
import cors from '@fastify/cors';
import authRoutes from './routes/auth.js';
import ttsRoutes from './routes/tts.js';
import voiceRoutes from './routes/voice.js';
import agentRoutes from './routes/agents.js';

const fastify = Fastify({ logger: true });

fastify.register(cors, {
    origin: ['http://localhost:3000', '*']
});

fastify.get('/health', async () => {
    return { status: 'ok' };
});

fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(ttsRoutes, { prefix: '/api/tts' });
fastify.register(voiceRoutes, { prefix: '/api/voice' });
fastify.register(agentRoutes, { prefix: '/api/agents' });

const start = async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 3001, host: '0.0.0.0' });
        console.log('API Server running on :3001');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
