export default {
  apps: [{
    name: 'saas-api',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      JWT_SECRET: 'saas-super-secret-jwt-2026',
      DATABASE_URL: 'postgresql://saas_user:saas_pass@localhost:5432/saas_platform',
      REDIS_URL: 'redis://localhost:6379'
    }
  }]
}
