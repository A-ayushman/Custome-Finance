import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Root route for basic API check
app.get('/', (c) => {
  return c.text('Welcome to ODIC Finance API');
});

// Health check API
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
  });
});

// Example additional API route
app.get('/api/data', (c) => {
  const sampleData = { message: "Here is some sample data" };
  return c.json(sampleData);
});

// Add more API routes as needed...

export default app;


