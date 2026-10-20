const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!connUri) {
      console.warn('⚠️ MONGO_URI is not set in environment variables. Database operations will fail.');
      return;
    }
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
