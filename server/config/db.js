const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGO_URI is missing from .env');
      throw new Error('Please define the MONGO_URI environment variable inside .env or Vercel Settings');
    }

    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    }).then((mongoose) => {
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(`❌ MongoDB connection failed: ${e.message}`);
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
