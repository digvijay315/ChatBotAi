import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Temple from './models/Temple.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import templeRoutes from './routes/templeRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount Modular Routes
app.use('/api/auth', authRoutes);
app.use('/api', templeRoutes);
app.use('/api', chatRoutes);

app.get('/',(req,res)=>
{
    res.send("welcome to aichatbot")
})

// --- AUTOMATIC DATABASE SEEDER ---
const defaultTempleData = {
  name: "बाबा बासुकीनाथ धाम मंदिर",
  deity: "भगवान शिव (बाबा बासुकीनाथ)",
  location: "जरमुंडी, दुमका, झारखंड, भारत - 814141",
  history: "बाबा बासुकीनाथ मंदिर दुमका जिले के जरमुंडी प्रखंड में स्थित एक अत्यंत प्राचीन और ऐतिहासिक हिंदू तीर्थ स्थल है। पौराणिक मान्यताओं के अनुसार, समुद्र मंथन के समय मंदराचल पर्वत को मथने के लिए उपयोग किए गए नागराज वासुकी ने इस पवित्र स्थान पर शिवलिंग स्थापित कर घोर तपस्या की थी, जिससे इस ज्योतिर्लिंग का नाम 'बासुकीनाथ' पड़ा। बासुकीनाथ धाम को 'फौजदारी दरबार' भी कहा जाता है, जहाँ श्रद्धालुओं की अरजी पर बाबा भोलेनाथ तुरंत न्याय (शीघ्र सुनवाई) करते हैं, जबकि देवघर के बाबा बैद्यनाथ को 'मनोकामना लिंग' या देवों की राजधानी माना जाता है। मान्यता है कि जब तक बासुकीनाथ धाम में गंगाजल का अर्पण न किया जाए, तब तक देवघर की पूजा अपूर्ण मानी जाती है। मंदिर परिसर का मुख्य आकर्षण भगवान शिव और माता पार्वती के मंदिरों का आमने-सामने होना है; माना जाता है कि संध्या काल में कपाट खुलने पर शिव और शक्ति का दिव्य मिलन होता है।",
  timings: [
    { name: "पट खुलना और प्रातःकालीन दर्शन व पूजा", time: "प्रातः 05:00 बजे" },
    { name: "दोपहर विश्राम काल (पट बंद)", time: "शाम 05:00 बजे से शाम 06:00 बजे तक" },
    { name: "दर्शन पुनः प्रारंभ (शाम)", time: "शाम 06:00 बजे से रात्रि 11:00 बजे तक" },
    { name: "दैनिक शृंगारी पूजा (शाम)", time: "रात्रि 07:30 बजे से रात्रि 10:30 बजे तक" }
  ],
  rules: [
    "मंदिर परिसर में दर्शनार्थियों को स्वच्छ, पारंपरिक और मर्यादित वस्त्र धारण करके ही प्रवेश करना चाहिए।",
    "गर्भगृह और मुख्य दर्शन कतार के अंदर मोबाइल फोन, कैमरा, चमड़े का बेल्ट या बैग ले जाना पूर्णतः वर्जित है।",
    "दर्शन के समय शांति बनाए रखें, धक्का-मुक्की न करें और सुरक्षाकर्मियों व न्यास समिति के निर्देशों का पालन करें।",
    "शृंगारी पूजा और विशेष दर्शन (शीघ्र दर्शन) के बुकिंग पासेज आधिकारिक वेबसाइट या मंदिर के काउंटर से प्राप्त किए जा सकते हैं।"
  ],
  festivals: [
    { name: "श्रावणी मेला (काँवर यात्रा)", date: "सावन मास (जुलाई - अगस्त)", description: "यह मंदिर का सबसे बड़ा वार्षिक उत्सव है। सुल्तानगंज से उत्तरवाहिनी गंगा का पवित्र जल लेकर लाखों काँवरिये लगभग 105 किमी पैदल चलकर बाबा बासुकीनाथ को जलार्पण करने पहुँचते हैं।" },
    { name: "महाशिवरात्रि", date: "फाल्गुन कृष्ण चतुर्दशी", description: "बाबा बासुकीनाथ और माता पार्वती के पावन विवाह के उपलक्ष्य में भव्य बारात निकाली जाती है और विशेष रात्रि चार प्रहर की पूजा आयोजित होती है।" },
    { name: "बसंत पंचमी (तिलक उत्सव)", date: "माघ शुक्ल पंचमी", description: "इस शुभ दिन बाबा का विशेष तिलक उत्सव मनाया जाता है। भारी भीड़ के कारण इस दिन शृंगारी पूजा की ऑनलाइन बुकिंग स्थगित रखी जाती है।" }
  ],
  donations: "बाबा बासुकीनाथ मंदिर न्यास समिति के आधिकारिक बैंक खाते में सीधे दान दिया जा सकता है:\nबैंक: भारतीय स्टेट बैंक (SBI)\nखाता नाम: बाबा बासुकीनाथ मंदिर न्यास समिति\nखाता संख्या: 39112233445\nIFSC कोड: SBIN0001037\nUPI ID: basukinathmandir@sbi\n(दान में प्राप्त राशि का उपयोग मंदिर परिसर के रख-रखाव, चिकित्सा शिविरों और काँवरियों की निशुल्क भोजन-आवास व्यवस्था में किया जाता है)।",
  contact: "हेल्पलाइन: +91 94313 XXXXX\nईमेल: basukinathmandir@gmail.com\nपता: बाबा बासुकीनाथ मंदिर न्यास समिति कार्यालय, जरमुंडी, दुमका, झारखंड - 814141",
  customSections: [
    {
      title: "तीर्थयात्री सेवा बुकिंग (Services)",
      content: "बाबा बासुकीनाथ मंदिर में श्रद्धालुओं के लिए विभिन्न ऑनलाइन व ऑफलाइन सेवाएं उपलब्ध हैं:\n- **शीघ्र दर्शन (Shighra Darshan)**: लंबी कतारों से बचने के लिए उपलब्ध विशेष प्रवेश व्यवस्था।\n- **शृंगारी पूजा (Sringari)**: बाबा भोलेनाथ का गंगाजल, फूलों और उत्तम सामग्रियों से किया जाने वाला विशेष पूजन। (प्रतिदिन केवल 22 स्लॉट उपलब्ध हैं)\n- **अन्य पूजा अनुष्ठान**: मनकामना पूजा, वंश पूजा, ध्वजारोहण, रुद्राभिषेक, चौपहरा, उपनयन संस्कार, मुंडन, और विवाह संस्कार आदि मंदिर परिसर के विभिन्न मंडपों में पुरोहितों द्वारा विधि-विधान से संपन्न कराए जाते हैं।"
    },
    {
      title: "श्रावणी मेला व सुविधाएं (Shrawani Mela Camps)",
      content: "श्रावण मास (जुलाई-अगस्त) के दौरान सुल्तानगंज से पवित्र गंगाजल लेकर पैदल यात्रा करने वाले लाखों 'काँवरियों' के लिए दुमका जिला प्रशासन द्वारा विशेष प्रबंध किए जाते हैं:\n- **आवास व्यवस्था (Accommodation)**: श्रद्धालुओं के आराम के लिए मार्ग में सुरक्षित एवं निशुल्क विश्राम शिविर (Camps) स्थापित किए जाते हैं।\n- **चिकित्सा शिविर (Medical Camps)**: संपूर्ण काँवरिया पथ पर प्राथमिक और आपातकालीन चिकित्सा सहायता प्रदान करने के लिए मेडिकल टीमें तैनात रहती हैं।\n- **परिवहन (Transportation)**: भक्तों की सुगम आवाजाही के लिए मंदिर परिसर और दुमका/देवघर रेलवे स्टेशनों व बस स्टैंडों के बीच अतिरिक्त बसों व वाहनों की व्यवस्था की जाती है।"
    }
  ],
  temporaryCamps: [],
  helplines: [
    {
      name: "पुलिस थाना जरमुंडी (Jarmundi Police Station)",
      number: "+91-9431706240",
      description: "आपातकालीन सुरक्षा एवं पुलिस सहायता के लिए (Emergency assistance)"
    },
    {
      name: "एंबुलेंस और चिकित्सा सेवा (Ambulance & Medical)",
      number: "108",
      description: "आपातकालीन स्वास्थ्य सहायता के लिए (Emergency medical assistance)"
    },
    {
      name: "मंदिर न्यास समिति हेल्पलाइन (Temple Trust Helpline)",
      number: "+91-9431301037",
      description: "मंदिर परिसर की जानकारी एवं पूजा बुकिंग सहायता के लिए (Temple info & puja booking)"
    },
    {
      name: "फायर ब्रिगेड / दमकल सेवा (Fire Brigade)",
      number: "101",
      description: "अग्निशमन आपातकाल के लिए (Fire emergencies)"
    }
  ],
  disabledAssistance: {
    wheelchairsAvailable: "मुख्य बस स्टैंड और मंदिर न्यास कार्यालय (गेट नंबर 1) पर निशुल्क व्हीलचेयर उपलब्ध हैं।",
    eRickshawRoutes: "बस स्टैंड से सिंह द्वार तक निशुल्क ई-रिक्शा सेवा सक्रिय है।",
    specialEntryGates: "70 वर्ष से अधिक आयु के बुजुर्गों और दिव्यांगों के लिए गेट नंबर 3 से सीधे निशुल्क प्रवेश की व्यवस्था है (लाइन में लगने की आवश्यकता नहीं है)।",
    helplineNumber: "+91-9431301037"
  }
};

async function seedDefaultData() {
  try {
    const existing = await Temple.findOne();
    if (existing && existing.name !== "बाबा बासुकीनाथ धाम मंदिर") {
      console.log('🔄 Old temple data detected (Ram Mandir). Dropping database to transition to Baba Basukinath Dham...');
      await Temple.deleteMany({});
    }

    const count = await Temple.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding default Baba Basukinath Dham Mandir data...');
      await Temple.create(defaultTempleData);
      console.log('✅ Default Basukinath data seeded successfully!');
    } else {
      console.log('📁 Database already has Basukinath temple data. Skipping seed.');
    }
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  }
}

// Connect Database & Start Server
connectDB().then(() => {
  seedDefaultData();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port http://localhost:${PORT}`);
  });
});
