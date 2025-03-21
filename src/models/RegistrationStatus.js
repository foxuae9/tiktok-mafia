import mongoose from 'mongoose';

const RegistrationStatusSchema = new mongoose.Schema({
  isOpen: {
    type: Boolean,
    default: true
  }
});

export default mongoose.models.RegistrationStatus || mongoose.model('RegistrationStatus', RegistrationStatusSchema);
