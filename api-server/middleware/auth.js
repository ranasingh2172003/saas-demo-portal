import jwt from 'jsonwebtoken';

export const verifyJWT = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return reply.code(401).send({ error: 'No authorization header' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'saas-super-secret-jwt-2026');
        request.user = decoded;
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
    }
};
