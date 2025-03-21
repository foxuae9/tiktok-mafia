import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'يرجى تحديد MONGODB_URI في ملف .env'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  console.log('🔄 بدء محاولة الاتصال بقاعدة البيانات...');
  
  if (cached.conn) {
    console.log('✅ استخدام اتصال موجود بالفعل');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // زيادة مهلة الاتصال
      family: 4
    };

    console.log('🔌 إنشاء اتصال جديد...');
    try {
      cached.promise = mongoose.connect(MONGODB_URI, opts);
      console.log('✅ تم إنشاء وعد الاتصال بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء الاتصال:', error);
      throw error;
    }
  } else {
    console.log('⏳ استخدام وعد اتصال موجود');
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    return cached.conn;
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
    cached.promise = null; // إعادة تعيين الوعد في حالة الفشل
    throw error;
  }
}

export default dbConnect;
