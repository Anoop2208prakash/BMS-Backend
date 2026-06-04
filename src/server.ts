// backend/src/server.ts
import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Express & Prisma
const app: Application = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// --- Global Middleware ---
app.use(cors()); // Allows frontend to bypass CORS policy
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true }));

// --- API Routes (We will mount our controllers here later) ---

// Health Check Endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // NATIVE MONGODB PING: Executes a raw ping command to verify connection
    await prisma.$runCommandRaw({ ping: 1 });
    
    res.status(200).json({ 
      status: 'success', 
      message: 'BMS API is running and MongoDB Atlas is connected.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// --- Server Bootup ---
const startServer = async () => {
  try {
    // Attempt to connect to the database before listening for requests
    await prisma.$connect();
    console.log('✅ Successfully connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();