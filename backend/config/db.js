const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let connUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!connUri || connUri.includes('xxxxx')) {
      connUri = 'mongodb+srv://namangoyal176_db_user:namangoyal1234@cluster0.t6koohi.mongodb.net/fee_management?retryWrites=true&w=majority';
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
