import mongoose from 'mongoose';

class Player {
  constructor({
    id,
    nickname,
    status = 'active',
    wins = 0,
    losses = 0,
    isEliminated = false,
    currentRound = 1,
    inMatch = false,
    matchId = null,
    group = null,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id;
    this.nickname = nickname;
    this.status = status;
    this.wins = wins;
    this.losses = losses;
    this.isEliminated = isEliminated;
    this.currentRound = currentRound;
    this.inMatch = inMatch;
    this.matchId = matchId;
    this.group = group;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      nickname: this.nickname,
      status: this.status,
      wins: this.wins,
      losses: this.losses,
      isEliminated: this.isEliminated,
      currentRound: this.currentRound,
      inMatch: this.inMatch,
      matchId: this.matchId,
      group: this.group,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

const PlayerSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: [true, 'Please provide a nickname'],
    unique: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'eliminated', 'winner'],
    default: 'active',
  },
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  isEliminated: {
    type: Boolean,
    default: false,
  },
  currentRound: {
    type: Number,
    default: 1,
  },
  inMatch: {
    type: Boolean,
    default: false,
  },
  matchId: {
    type: String,
    default: null,
  },
  group: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

// تحديث updatedAt قبل حفظ أي تغييرات
PlayerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Player || mongoose.model('Player', PlayerSchema);
