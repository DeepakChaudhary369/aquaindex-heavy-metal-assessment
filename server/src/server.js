require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    console.log('[System] Initializing Heavy Metal Pollution Assessment System...');
    console.log(`[System] Target Environment: ${process.env.NODE_ENV || 'development'}`);

    // Requirement: Connect to MongoDB first; only start Express server after successful connection
    await connectDB();

    // Auto-sync dataset into MongoDB collection in background
    const { syncToMongo } = require('./services/datasetService');
    syncToMongo().catch((err) => console.warn('[Dataset Sync Warning]', err.message));

    server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`   HEAVY METAL POLLUTION INDEX (HPI/HEI) ASSESSMENT API `);
      console.log(`   Server running on port: ${PORT}`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
      console.log(`   Database: CONNECTED`);
      console.log(`=======================================================`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Shutdown] Received ${signal}. Gracefully stopping server and closing DB connection...`);
      if (server) {
        server.close(async () => {
          console.log('[Shutdown] HTTP server closed.');
          try {
            await mongoose.connection.close(false);
            console.log('[Shutdown] MongoDB connection closed gracefully.');
            process.exit(0);
          } catch (err) {
            console.error('[Shutdown Error] Error closing MongoDB connection:', err.message);
            process.exit(1);
          }
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (err) => {
      console.error('[Unhandled Rejection] Error:', err.message);
      if (server) {
        server.close(() => process.exit(1));
      } else {
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('[Fatal Error] Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
