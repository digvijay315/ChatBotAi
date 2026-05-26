import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'नया चैट सत्र'
  }
}, { timestamps: true });

export default mongoose.model('Session', SessionSchema);
