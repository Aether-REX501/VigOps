import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'X-GitHub-Event', 'X-Hub-Signature-256'],
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  const event = req.headers['x-github-event'];
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}${event ? ` [${event}]` : ''}`);
  next();
});

app.use('/', routes);

app.listen(PORT, () => {
  const hasToken = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'your_github_token_here');
  console.log('');
  console.log('  ╔═══════════════════════════════════════════╗');
  console.log('  ║   🔥 VigOps Intelligence Backend v3.0     ║');
  console.log(`  ║   Listening on http://localhost:${PORT}     ║`);
  console.log('  ║                                           ║');
  console.log('  ║   POST /webhook   ← GitHub PR events      ║');
  console.log('  ║   GET  /analyze   ← Manual PR analysis    ║');
  console.log('  ║   GET  /analysis  ← Dashboard data        ║');
  console.log('  ║   GET  /health    ← Status check          ║');
  console.log('  ║                                           ║');
  console.log(`  ║   GitHub Token: ${hasToken ? '✅ configured' : '⚠️  not set (see .env)'}        ║`);
  console.log('  ╚═══════════════════════════════════════════╝');
  console.log('');
});

export default app;
