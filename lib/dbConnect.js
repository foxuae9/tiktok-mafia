import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://foxuae:foxuae123@cluster0.mongodb.net/street-fighter-tournament?retryWrites=true&w=majority';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
