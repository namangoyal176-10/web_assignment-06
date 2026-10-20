const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!connUri) {
      console.warn('⚠️ MONGO_URI is not set in environment variables. Database operations will fail.');
      return;
    }
    const conn = await mongoose.connect(connUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // In production on Render, avoid terminating process immediately so health check can respond with status
    if (process.env.NODE_ENV === 'test') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
