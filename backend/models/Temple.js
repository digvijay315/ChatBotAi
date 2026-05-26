import mongoose from 'mongoose';

const TempleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deity: { type: String, required: true },
  location: { type: String, required: true },
  history: { type: String, required: true },
  timings: [{
    name: { type: String, required: true },
    time: { type: String, required: true }
  }],
  rules: [String],
  festivals: [{
    name: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true }
  }],
  donations: { type: String, required: true },
  contact: { type: String, required: true },
  customSections: [{
    title: { type: String, required: true },
    content: { type: String, required: true }
  }]
}, { timestamps: true });

export default mongoose.model('Temple', TempleSchema);
