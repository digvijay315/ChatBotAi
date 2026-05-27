import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const TempleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  temporaryCamps: [{
    name: { type: String, required: true },
    category: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    description: { type: String, required: true }
  }]
}, { strict: false });

const Temple = mongoose.model('Temple', TempleSchema);

async function cleanDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not found in environment variables.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected successfully!');

  const temple = await Temple.findOne();
  if (!temple) {
    console.log('❌ Temple data not found.');
    await mongoose.connection.close();
    return;
  }

  console.log(`Current temple name: "${temple.name}"`);
  console.log('Active temporary camps before cleanup:', temple.temporaryCamps);

  const initialCount = temple.temporaryCamps.length;
  // Filter out any camps with "Test Langar Camp" or "परीक्षक" in name
  temple.temporaryCamps = temple.temporaryCamps.filter(
    camp => !camp.name.includes('Test Langar') && !camp.name.includes('परीक्षक')
  );

  const cleanedCount = temple.temporaryCamps.length;
  if (initialCount !== cleanedCount) {
    await temple.save();
    console.log(`🧹 Cleaned up ${initialCount - cleanedCount} test camp(s) successfully!`);
  } else {
    console.log('✨ No test camps found in database. Database is already clean.');
  }

  await mongoose.connection.close();
  console.log('Connection closed.');
}

cleanDB().catch(err => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
