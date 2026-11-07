const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('FATAL ERROR: MONGODB_URI environment variable is not defined.');
    console.error('Please configure your MONGODB_URI in server/.env before starting the server.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`[MongoDB] Successfully connected to database: ${conn.connection.name} @ ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Error] Runtime connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB Warning] Lost connection to MongoDB.');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Successfully reconnected to MongoDB.');
      isConnected = true;
    });

    return conn;
  } catch (error) {
    console.error('[MongoDB Fatal Error] Database connection failed:');
    console.error(`- Details: ${error.message}`);
    console.error('- Please check your connection string, MongoDB Atlas network IP whitelist (0.0.0.0/0), or local MongoDB service status.');
    process.exit(1);
  }
};

const getDbStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateIndex = mongoose.connection.readyState;
  return {
    state: states[stateIndex] || 'unknown',
    isConnected: stateIndex === 1,
    host: mongoose.connection.host || null,
    dbName: mongoose.connection.name || null,
  };
};

module.exports = { connectDB, getDbStatus };
