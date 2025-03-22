import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  registrationOpen: {
    type: Boolean,
    default: true
  }
});

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
