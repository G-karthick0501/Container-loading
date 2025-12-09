import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import prisma from './config/prisma.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);

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

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
