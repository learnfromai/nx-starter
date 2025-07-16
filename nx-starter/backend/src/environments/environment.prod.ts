export const environment = {
  production: true,
  port: process.env['PORT'] ? parseInt(process.env['PORT']) : 3000,
  apiPrefix: '/api',
  corsEnabled: false,
  logLevel: 'error'
};