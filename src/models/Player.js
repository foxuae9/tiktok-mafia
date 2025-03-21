import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
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
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// إضافة index على الاسم لتحسين البحث
PlayerSchema.index({ nickname: 1 });

// التأكد من عدم تكرار الأسماء (case insensitive)
PlayerSchema.pre('save', async function(next) {
  if (this.isModified('nickname')) {
    const existingPlayer = await this.constructor.findOne({
      _id: { $ne: this._id },
      nickname: new RegExp('^' + this.nickname + '$', 'i')
    });
    if (existingPlayer) {
      next(new Error('هذا الاسم مستخدم بالفعل'));
    }
  }
  next();
});

export default mongoose.models.Player || mongoose.model('Player', PlayerSchema);
