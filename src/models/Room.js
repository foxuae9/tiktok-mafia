import mongoose from 'mongoose'

const playerSchema = new mongoose.Schema({
  id: String,
  username: String,
  role: {
    type: String,
    enum: ['host', 'player'],
    default: 'player'
  }
})

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  host: {
    type: String,
    required: true
  },
  players: [playerSchema],
  status: {
    type: String,
    enum: ['waiting', 'playing', 'ended'],
    default: 'waiting'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // تلقائياً يحذف الغرف بعد ساعة من عدم النشاط
  }
})

export default mongoose.models.Room || mongoose.model('Room', roomSchema)
