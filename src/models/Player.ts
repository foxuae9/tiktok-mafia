import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  position: {
    type: Number,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// إضافة فهرس للموقع للترتيب السريع
playerSchema.index({ position: 1 });

// تصدير النموذج
export const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);
