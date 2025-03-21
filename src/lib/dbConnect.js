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
      compressors: ['zlib'],
      connectTimeoutMS: 10000,
      keepAlive: true,
      keepAliveInitialDelay: 300000
    };

    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    
    // إخفاء معلومات الاتصال الحساسة من السجلات
    const sanitizedUri = MONGODB_URI.replace(
      /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
      'mongodb$1://<username>:<password>@'
    );
    console.log('🔗 URI:', sanitizedUri);

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  } else {
    console.log('⏳ في انتظار اتصال قاعدة البيانات الحالي...');
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    
    const { host, port, name } = cached.conn.connection;
    console.log('📊 معلومات الاتصال:', { host, port, name });
    
    // إضافة معالج للأخطاء
    cached.conn.connection.on('error', (error) => {
      console.error('❌ خطأ في اتصال قاعدة البيانات:', error);
    });

    // إضافة معالج لإعادة الاتصال
    cached.conn.connection.on('disconnected', () => {
      console.log('🔄 انقطع الاتصال بقاعدة البيانات، جاري إعادة الاتصال...');
      cached.conn = null;
      cached.promise = null;
    });

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('❌ فشل الاتصال بقاعدة البيانات:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    throw error;
  }
}

export default dbConnect;
