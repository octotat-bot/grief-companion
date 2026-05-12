const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connecting locally to port 27017 (default MongoDB port)
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/grief-companion');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
