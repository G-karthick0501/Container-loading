import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import prisma from './config/prisma.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobRoutes.js';
import containerRoutes from './routes/containerRoutes.js';
import predictionRoutes from './routes/predictions.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 5000;

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('join-job', (jobId) => {
    socket.join(`job-${jobId}`);
    console.log(`📦 Socket ${socket.id} joined job-${jobId}`);
  });
  
  socket.on('leave-job', (jobId) => {
    socket.leave(`job-${jobId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/DB_health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected' 
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/containers', containerRoutes);
app.use('/api/predict', predictionRoutes);

// Check database connection
async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

checkDatabase();

// Start server (use httpServer instead of app)
httpServer.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`🔌 WebSocket ready`);
});