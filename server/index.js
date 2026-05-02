import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { getDb, initSchema } from './src/db.js';
import authRoutes from './src/routes/auth.js';
import inquiryRoutes from './src/routes/inquiries.js';
import settingsRoutes from './src/routes/settings.js';
import blogRoutes from './src/routes/blog.js';
import teamRoutes from './src/routes/team.js';
import uploadRoutes from './src/routes/upload.js';
import contentRoutes from './src/routes/content.js';
import projectRoutes from './src/routes/projects.js';
import aiRoutes from './src/routes/ai.js';
import brandsRoutes from './src/routes/brands.js';
import clientsRoutes from './src/routes/clients.js';
import servicesRoutes from './src/routes/services.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Set to true for production if you configure domains
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      process.env.CLIENT_URL, 
      'http://localhost:5173', 
      'http://localhost:5174', 
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175'
    ];
    if (!origin || allowed.includes(origin) || origin.includes('localhost:') || origin.includes('127.0.0.1:') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, 
  message: { message: 'Too many requests, please try again later.' }
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Balanced limit for security and usability
  message: { message: 'Too many attempts from this IP. Please try again in an hour.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth', strictLimiter);
app.use('/api/inquiries', strictLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

await initSchema().catch(err => console.error('DB Init Error:', err));

app.use('/api/auth',      authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/settings',  settingsRoutes);
app.use('/api/blog',      blogRoutes);
app.use('/api/team',      teamRoutes);
app.use('/api/upload',    uploadRoutes);
app.use('/api/content',   contentRoutes);
app.use('/api/projects',  projectRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/brands',    brandsRoutes);
app.use('/api/clients',   clientsRoutes);
app.use('/api/services',  servicesRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api', (req, res) => res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` }));

// Fallback for React Router
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).json({ message: 'Internal server error.' });
});

// Start server if running locally (not as a Vercel function)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Hexagon API running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
}

export default app;
