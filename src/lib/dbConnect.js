import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/street-fighter-tournament';

if (!MONGODB_URI) {
  throw new Error('يرجى تحديد MONGODB_URI في متغيرات البيئة');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// تم تعطيل الاتصال بقاعدة البيانات مؤقتاً
export default async function dbConnect() {
  return null;
}
