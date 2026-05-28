import Temple from '../models/Temple.js';

// 1. Fetch Temple Data
export const getTempleData = async (req, res) => {
  try {
    const data = await Temple.findOne();
    if (!data) {
      return res.status(404).json({ error: 'Temple details not seeded yet' });
    }
    res.json({
      ...data.toObject(),
      hasApiKey: !!process.env.GEMINI_API_KEY
    });
  } catch (err) {
    res.status(500).json({ error: 'Database fetch failed', details: err.message });
  }
};

// 2. Update Temple Data (Admin Only)
export const updateTempleData = async (req, res) => {
  try {
    let data = await Temple.findOne();
    if (!data) {
      data = new Temple(req.body);
    } else {
      Object.assign(data, req.body);
      // Force Mongoose to serialize and save nested subdocuments (deep change tracking bypass)
      data.markModified('disabledAssistance');
      data.markModified('crowdStatus');
    }
    await data.save();
    console.log('💾 Temple data updated by Admin successfully!');
    res.json({
      message: 'डेटा सफलतापूर्वक डेटाबेस (MongoDB) में सुरक्षित कर दिया गया है!',
      data: {
        ...data.toObject(),
        hasApiKey: !!process.env.GEMINI_API_KEY
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Database update failed', details: err.message });
  }
};
