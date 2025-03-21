import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'يرجى تحديد متغير البيئة MONGODB_URI في إعدادات Vercel'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('✅ استخدام اتصال قاعدة البيانات المخزن مؤقتاً');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true,
      maxIdleTimeMS: 10000,
      compressors: ['zlib']
    };

    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    console.log('🔗 URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//<hidden>:<hidden>@'));

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
        console.log('📊 معلومات الاتصال:', {
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name
        });
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات:', {
          name: error.name,
          message: error.message,
          code: error.code
        });
        throw error;
      });
  } else {
    console.log('⏳ في انتظار اتصال قاعدة البيانات الحالي...');
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
