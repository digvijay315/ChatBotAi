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
  }],
  temporaryCamps: [{
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g. "stay", "medical", "food", "transport"
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    description: { type: String, required: true }
  }],
  helplines: [{
    name: { type: String, required: true },
    number: { type: String, required: true },
    description: { type: String }
  }],
  disabledAssistance: {
    wheelchairsAvailable: { type: String, default: "" },
    eRickshawRoutes: { type: String, default: "" },
    specialEntryGates: { type: String, default: "" },
    helplineNumber: { type: String, default: "" }
  },
  crowdStatus: {
    status: { type: String, default: 'normal' }, // 'low', 'normal', 'heavy', 'peak'
    waitTime: { type: String, default: '30 मिनट' }, // wait time string
    description: { type: String, default: 'कतार सामान्य है, दर्शन आसानी से हो रहे हैं।' }, // custom Hindi note
    descriptionEn: { type: String, default: 'Queue is normal, darshan is smooth.' }, // custom English note
    updatedAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

export default mongoose.model('Temple', TempleSchema);
