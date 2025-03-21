import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: [true, 'يجب إدخال اسم اللاعب'],
    unique: true,
    trim: true
  },
  isEliminated: {
    type: Boolean,
    default: false
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  currentRound: {
    type: Number,
    default: 1
  },
  position: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// إضافة index على الاسم لتحسين البحث
PlayerSchema.index({ nickname: 1 });

// تحويل _id إلى id
PlayerSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// التأكد من عدم تكرار الاسم
PlayerSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingPlayer = await this.constructor.findOne({ nickname: this.nickname });
    if (existingPlayer) {
      throw new Error('هذا الاسم مستخدم بالفعل');
    }
  }
  next();
});

export default mongoose.models.Player || mongoose.model('Player', PlayerSchema);
