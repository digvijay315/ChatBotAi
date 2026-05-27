import { GoogleGenerativeAI } from '@google/generative-ai';
import Session from '../models/Session.js';
import Message from '../models/Message.js';
import Temple from '../models/Temple.js';

// --- HAVERSINE FORMULA FOR DISTANCE CALCULATION ---
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(2)); // Round to 2 decimal places
}

const verifiedLocalPlaces = [
  { name: "बाबा बासुकीनाथ मुख्य मंदिर (Baba Basukinath Temple)", lat: 24.3850, lng: 87.2514, category: "temple", query: "Baba+Basukinath+Dham+Mandir+Jarmundi" },
  { name: "पर्यटन विहार धर्मशाला (Paryatan Vihar Dharamshala)", lat: 24.3835, lng: 87.2505, category: "hotel", query: "Paryatan+Vihar+Basukinath+Jarmundi" },
  { name: "शिव कृपा होटल (Hotel Shiv Kripa)", lat: 24.3860, lng: 87.2530, category: "hotel", query: "Hotel+Shiv+Kripa+Basukinath+Jarmundi" },
  { name: "बासुकीनाथ गेस्ट हाउस (Basukinath Guest House)", lat: 24.3828, lng: 87.2482, category: "hotel", query: "Basukinath+Guest+House+Jarmundi" },
  { name: "पावन बासुकीनाथ आश्रम (Basukinath Ashram)", lat: 24.3880, lng: 87.2490, category: "ashram", query: "Basukinath+Ashram+Jarmundi" },
  { name: "सामुदायिक स्वास्थ्य केंद्र, जरमुंडी (Community Health Centre, Jarmundi)", lat: 24.3780, lng: 87.2380, category: "hospital", query: "Community+Health+Centre+Jarmundi" },
  { name: "निशुल्क स्वास्थ्य शिविर (Free Medical Camp near Temple)", lat: 24.3845, lng: 87.2525, category: "hospital", query: "Baba+Basukinath+Dham+Mandir+Jarmundi" },
  { name: "भारत पेट्रोलियम जरमुंडी (BPCL Petrol Pump Jarmundi)", lat: 24.3765, lng: 87.2340, category: "petrol_pump", query: "BPCL+Petrol+Pump+Jarmundi" },
  { name: "बासुकीनाथ बस स्टैंड (Basukinath Bus Stand)", lat: 24.3865, lng: 87.2535, category: "bus_stand", query: "Basukinath+Bus+Stand" },
  { name: "बासुकीनाथ रेलवे स्टेशन (Basukinath Railway Station)", lat: 24.3800, lng: 87.2440, category: "railway_station", query: "Basukinath+Railway+Station" },
  { name: "भारतीय स्टेट बैंक एटीएम 🏧 (SBI ATM Basukinath)", lat: 24.3855, lng: 87.2520, category: "atm", query: "SBI+ATM+Basukinath" },
  { name: "एचडीएफसी बैंक एटीएम 🏧 (HDFC Bank ATM Basukinath)", lat: 24.3840, lng: 87.2508, category: "atm", query: "HDFC+Bank+ATM+Basukinath" }
];

// --- OFF-LINE KEYWORD SEARCH ENGINE (FALLBACK) ---
function getSimulatedResponse(question, data, latitude, longitude, activePlaces) {
  const q = question.toLowerCase();
  const deity = data.deity;
  const name = data.name;
  const placesList = activePlaces || verifiedLocalPlaces;

  let reply = `प्रणाम भक्तगण! 🙏 मैं ${name} का डिजिटल मार्गदर्शक हूँ। `;

  // Check categories with Latin/English/Hinglish and Hindi Devanagari keywords
  const isHotelQuery = q.includes('hotel') || q.includes('dharamshala') || q.includes('stay') || q.includes('rukne') || q.includes('lodg') || q.includes('aashram') || q.includes('ashram') ||
                       q.includes('होटल') || q.includes('धर्मशाला') || q.includes('रुकने') || q.includes('ठहरने') || q.includes('लॉज') || q.includes('आश्रम');
                       
  const isHospitalQuery = q.includes('hospital') || q.includes('ill') || q.includes('doctor') || q.includes('chikit') || q.includes('dawai') || q.includes('medical') ||
                          q.includes('अस्पताल') || q.includes('हॉस्पिटल') || q.includes('बीमार') || q.includes('डॉक्टर') || q.includes('चिकित्सा') || q.includes('दवाई') || q.includes('मेडिकल');
                          
  const isPetrolQuery = q.includes('petrol') || q.includes('pump') || q.includes('fuel') || q.includes('tel') ||
                        q.includes('पेट्रोल') || q.includes('पंप') || q.includes('ईंधन') || q.includes('तेल');
                        
  const isTransportQuery = q.includes('bus') || q.includes('railway') || q.includes('station') || q.includes('train') || q.includes('stand') || q.includes('transport') ||
                           q.includes('बस') || q.includes('रेलवे') || q.includes('स्टेशन') || q.includes('ट्रेन') || q.includes('स्टैंड') || q.includes('परिवहन') || q.includes('गाड़ी') || q.includes('गाडी');
                           
  const isAtmQuery = q.includes('atm') || q.includes('bank') || q.includes('cash') || q.includes('paise nikalne') ||
                     q.includes('एटीएम') || q.includes('बैंक') || q.includes('कैश') || q.includes('पैसा') || q.includes('पैसे');
                     
  const isFoodQuery = q.includes('bhandara') || q.includes('langar') || q.includes('food') || q.includes('khana') ||
                      q.includes('भंडारा') || q.includes('लंगर') || q.includes('भोजन') || q.includes('खाना') || q.includes('प्रसाद');
                      
  const isCampQuery = q.includes('camp') || q.includes('shivir') ||
                      q.includes('शिविर') || q.includes('कैंप');

  const isAmenitiesSearch = isHotelQuery || isHospitalQuery || isPetrolQuery || isTransportQuery || isAtmQuery || isFoodQuery || isCampQuery ||
                            q.includes('facility') || q.includes('suvidha') || q.includes('nearby') || q.includes('paas') ||
                            q.includes('सुविधा') || q.includes('पास') || q.includes('नजदीक');

  if (isAmenitiesSearch) {
    let targetCategories = [];
    let facilityName = "जन-सुविधाओं और शिविरों";

    if (isHotelQuery) {
      targetCategories = ['hotel', 'ashram', 'stay'];
      facilityName = "ठहरने की उत्तम व्यवस्था (होटल, धर्मशाला और आश्रम)";
    } else if (isHospitalQuery) {
      targetCategories = ['hospital', 'medical'];
      facilityName = "स्वास्थ्य सुविधाओं और चिकित्सा शिविरों";
    } else if (isPetrolQuery) {
      targetCategories = ['petrol_pump'];
      facilityName = "पेट्रोल पंप और ईंधन स्टेशनों";
    } else if (isTransportQuery) {
      targetCategories = ['bus_stand', 'railway_station', 'transport'];
      facilityName = "परिवहन सुविधाओं (बस स्टैंड और रेलवे स्टेशन)";
    } else if (isAtmQuery) {
      targetCategories = ['atm'];
      facilityName = "एटीएम और बैंकिंग सेवाओं";
    } else if (isFoodQuery) {
      targetCategories = ['food'];
      facilityName = "भोजन और लंगर शिविरों";
    } else if (isCampQuery) {
      targetCategories = ['stay', 'medical', 'food', 'hospital'];
      facilityName = "अस्थायी शिविरों (आवास, स्वास्थ्य और भोजन)";
    }

    const filteredPlaces = targetCategories.length > 0 
      ? placesList.filter(p => targetCategories.includes(p.category))
      : placesList;

    reply += `यहाँ आपके सबसे पास की ${facilityName} की जानकारी दी गई है। `;
    
    if (filteredPlaces.length === 0) {
      reply += `वर्तमान में इस श्रेणी की कोई सुविधा उपलब्ध नहीं है।`;
      return reply;
    }

    if (latitude && longitude) {
      reply += `आपके लाइव स्थान (Live GPS) के अनुसार दूरी:\n\n`;
      filteredPlaces.forEach(p => {
        const dist = calculateDistance(latitude, longitude, p.lat, p.lng);
        const routeLink = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${p.query}`;
        reply += `📍 **${p.name}**:\n   - **दूरी**: ${dist} किमी दूर\n   - **दिशा-निर्देश**: [Google Maps पर रास्ता देखें](${routeLink})\n\n`;
      });
    } else {
      reply += `मुख्य मंदिर से इन सुविधाओं की दूरी इस प्रकार है (अपने लाइव स्थान से दूरी देखने के लिए कृपया ब्राउज़र में लोकेशन की अनुमति दें):\n\n`;
      filteredPlaces.forEach(p => {
        const dist = calculateDistance(24.3850, 87.2514, p.lat, p.lng);
        const routeLink = `https://www.google.com/maps/search/?api=1&query=${p.query}`;
        reply += `📍 **${p.name}**:\n   - **मंदिर से दूरी**: लगभग ${dist} किमी\n   - **गूगल मैप्स**: [यहाँ खोजें](${routeLink})\n\n`;
      });
    }
    return reply;
  }

  if (q.includes('samay') || q.includes('time') || q.includes('timing') || q.includes('aarti') || q.includes('arti') || q.includes('khulna') || q.includes('kapt') || q.includes('band')) {
    reply += `यहाँ ${deity} के दर्शन और आरती की समय सारिणी दी गई है:\n\n`;
    data.timings.forEach(t => {
      reply += `🔔 **${t.name}**: ${t.time}\n`;
    });
    reply += `\nकृपया समय अनुसार पधारें और ${deity} की कृपा प्राप्त करें।`;
    return reply;
  }

  if (q.includes('history') || q.includes('itihas') || q.includes('katha') || q.includes('story') || q.includes('kab bana') || q.includes('kisne banaya') || q.includes('architecture') || q.includes('style')) {
    reply += `यहाँ मंदिर का पावन इतिहास और जानकारी दी गई है:\n\n${data.history}\n\nयह स्थान ${data.location} में स्थित है जहाँ ${deity} विराजमान हैं।`;
    return reply;
  }

  if (q.includes('rule') || q.includes('niyam') || q.includes('allow') || q.includes('phone') || q.includes('camera') || q.includes('cloth') || q.includes('kapde') || q.includes('dress')) {
    reply += `मंदिर में दर्शन करने के कुछ नियम और सुविधाएं नीचे दी गई हैं, जिनका पालन करना आवश्यक है:\n\n`;
    data.rules.forEach((r, idx) => {
      reply += `${idx + 1}. ${r}\n`;
    });
    return reply;
  }

  if (q.includes('festival') || q.includes('tyohar') || q.includes('event') || q.includes('utsa') || q.includes('utsav')) {
    reply += `मंदिर में मनाए जाने वाले प्रमुख उत्सवों की सूची निम्नलिखित है:\n\n`;
    data.festivals.forEach(f => {
      reply += `✨ **${f.name}** (${f.date}):\n${f.description}\n\n`;
    });
    return reply;
  }

  if (q.includes('donat') || q.includes('dan') || q.includes('money') || q.includes('paisa') || q.includes('upi') || q.includes('bank') || q.includes('bheyt') || q.includes('dakshina')) {
    reply += `यदि आप मंदिर निर्माण या समाज सेवा कार्यों में अपना योगदान देना चाहते हैं, तो दान की जानकारी यहाँ है:\n\n${data.donations}`;
    return reply;
  }

  if (q.includes('contact') || q.includes('phone') || q.includes('helpline') || q.includes('email') || q.includes('address') || q.includes('location') || q.includes('pata') || q.includes('kahan') || q.includes('reach') || q.includes('rasta') || q.includes('route') || q.includes('police') || q.includes('medical') || q.includes('emergency')) {
    reply += `मंदिर का पता और संपर्क सूत्र इस प्रकार है:\n\n📍 **स्थान**: ${data.location}\n\n${data.contact}`;
    if (data.helplines && data.helplines.length > 0) {
      reply += `\n\n🚨 **आपातकालीन हेल्पलाइन नंबर (Emergency Helplines)**:\n`;
      data.helplines.forEach(h => {
        reply += `- **${h.name}**: ${h.number}${h.description ? ` (${h.description})` : ''}\n`;
      });
    }
    return reply;
  }

  // 🔸 Check custom Dynamic Sections added by Admin
  if (data.customSections && data.customSections.length > 0) {
    for (const cs of data.customSections) {
      const titleLower = cs.title.toLowerCase();
      // Match if query includes the custom section title or key words inside the title (stripping punctuations, keeping Hindi characters)
      const matchesTitle = titleLower.split(' ').some(word => {
        const cleaned = word.replace(/[().,?!\[\]{}'"]/g, '').trim();
        return cleaned.length > 2 && q.includes(cleaned);
      });
      if (q.includes(titleLower) || matchesTitle) {
        reply += `यहाँ **${cs.title}** के संबंध में जानकारी दी गई है:\n\n${cs.content}`;
        return reply;
      }
    }
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('pranam') || q.includes('namaste') || q.includes('ram') || q.includes('jai') || q.includes('shree') || q.includes('hari') || q.includes('shiv') || q.includes('shambh') || q.includes('bhole') || q.includes('om') || q.includes('mahadev')) {
    reply += `हर हर महादेव! मैं इस पावन धाम का डिजिटल सहायक हूँ। \n\nआप मुझसे मंदिर के **इतिहास (History)**, **दर्शन समय (Timings)**, **नियमों (Rules)**, **त्योहारों (Festivals)**, या **दान (Donations)** के बारे में पूछ सकते हैं।`;
    if (data.customSections && data.customSections.length > 0) {
      reply += ` इसके अतिरिक्त आप निम्न विषयों पर भी जानकारी प्राप्त कर सकते हैं:\n`;
      data.customSections.forEach(cs => {
        reply += `- **${cs.title}**\n`;
      });
    }
    reply += `\nआप क्या जानना चाहते हैं?`;
    return reply;
  }

  reply += `मैं आपके प्रश्न को पूरी तरह समझ नहीं पाया। 🙏\n\nचूंकि मैं इस मंदिर का मार्गदर्शक हूँ, मैं आपको केवल मंदिर के **इतिहास, आरती के समय, दर्शन के नियम, दान के तरीके, मुख्य त्योहारों**`;
  if (data.customSections && data.customSections.length > 0) {
    reply += ` और **${data.customSections.map(cs => cs.title).join(', ')}**`;
  }
  reply += ` के बारे में ही सटीक जानकारी दे सकता हूँ। कृपया इनसे संबंधित कोई प्रश्न पूछें।`;
  return reply;
}

// --- CONTROLLER FUNCTIONS ---

// 1. Get User's Sessions
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Sessions fetch failed', details: err.message });
  }
};

// 2. Create User Session
export const createSession = async (req, res) => {
  const { title } = req.body;
  try {
    const count = await Session.countDocuments({ userId: req.user.id });
    const sessionTitle = title || `चैट सत्र #${count + 1}`;
    
    const newSession = await Session.create({
      userId: req.user.id,
      title: sessionTitle
    });
    res.status(201).json(newSession);
  } catch (err) {
    res.status(550).json({ error: 'Session creation failed', details: err.message });
  }
};

// 3. Delete Session & Messages
export const deleteSession = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await Session.findOne({ _id: id, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Delete session and its messages
    await Session.findByIdAndDelete(id);
    await Message.deleteMany({ sessionId: id });

    res.json({ message: 'सत्र और संदेश इतिहास सफलतापूर्वक हटा दिया गया है!' });
  } catch (err) {
    res.status(500).json({ error: 'Session deletion failed', details: err.message });
  }
};

// 4. Get messages of a specific session
export const getSessionMessages = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await Session.findOne({ _id: id, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    const messages = await Message.find({ sessionId: id }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Messages fetch failed', details: err.message });
  }
};

// 5. Post message & Get Chatbot response
export const postMessage = async (req, res) => {
  const { message, sessionId, latitude, longitude } = req.body;

  try {
    // 1. Verify session ownership
    const session = await Session.findOne({ _id: sessionId, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    // 2. Fetch Temple details for context
    const data = await Temple.findOne();
    if (!data) {
      return res.status(404).json({ error: 'Temple details not loaded' });
    }

    // Build the dynamic merged list of places (static + database-backed temporary camps)
    const activeLocalPlaces = [...verifiedLocalPlaces];
    if (data.temporaryCamps && data.temporaryCamps.length > 0) {
      data.temporaryCamps.forEach(camp => {
        let categoryEmoji = '📍';
        if (camp.category === 'stay') categoryEmoji = '🏨';
        else if (camp.category === 'medical') categoryEmoji = '🏥';
        else if (camp.category === 'food') categoryEmoji = '🍱';
        else if (camp.category === 'transport') categoryEmoji = '🚌';
        else if (camp.category === 'atm') categoryEmoji = '🏧';

        activeLocalPlaces.push({
          name: `${camp.name} ${categoryEmoji} (${camp.category === 'stay' ? 'अस्थायी आवास' : camp.category === 'medical' ? 'अस्थायी चिकित्सा शिविर' : camp.category === 'food' ? 'अस्थायी भोजन/लंगर शिविर' : camp.category === 'atm' ? 'एटीएम/बैंक' : 'अस्थायी परिवहन सेवा'}) - ${camp.description}`,
          lat: camp.lat,
          lng: camp.lng,
          category: camp.category,
          query: `${camp.lat},${camp.lng}`,
          description: camp.description
        });
      });
    }

    // 3. Save User Message in DB
    const userMsg = await Message.create({
      sessionId,
      userId: req.user.id,
      sender: 'user',
      text: message
    });

    // 4. Fetch past messages for history context
    const pastMessages = await Message.find({ sessionId }).sort({ timestamp: 1 }).limit(10);

    let reply = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // 🔸 Fallback simulated offline search engine
      reply = getSimulatedResponse(message, data, latitude, longitude, activeLocalPlaces);
      await new Promise(resolve => setTimeout(resolve, 800));
    } else {
      // 🔸 Call live Gemini API with context RAG with robust fallback chain
      const genAI = new GoogleGenerativeAI(apiKey);

      let locationContext = "";
      if (latitude && longitude) {
        const distFromTemple = calculateDistance(latitude, longitude, 24.3850, 87.2514);
        locationContext = `
Devotee's LIVE GPS COORDINATES are available: Latitude ${latitude}, Longitude ${longitude}.
The devotee is currently approximately ${distFromTemple} km away from the main Baba Basukinath Temple.

Here are the exact calculated straight-line (GPS) distances from the devotee to important local static amenities and database-saved temporary camps around the temple. You MUST use these exact distance values to answer their queries:
${activeLocalPlaces.map(p => {
  const dist = calculateDistance(latitude, longitude, p.lat, p.lng);
  const mapsLink = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${p.query}`;
  return `- **${p.name}**: ${dist} km away from user's current position. Dynamic Route Link: [गूगल मैप्स पर मार्ग देखें](${mapsLink})`;
}).join('\n')}

Crucial Instructions for Pujari Ji:
1. Check the devotee's distance from the main temple:
   - If they are FAR AWAY from the temple (e.g. more than 10 km away): Do NOT call the hotels "nearby to their current location" as 500+ km is not nearby. Instead, politely explain: "चूंकि आप अभी मुख्य मंदिर से लगभग ${distFromTemple} किमी दूर हैं, इसलिए मैं आपको **बाबा बासुकीनाथ मुख्य मंदिर धाम के आसपास स्थित** ठहरने/सुविधाओं/अस्थायी शिविरों की जानकारी दे रहा हूँ ताकि जब आप यहाँ दर्शन के लिए पधारें तो आपको कोई असुविधा न हो। आप अपने वर्तमान स्थान से सीधे वहाँ पहुँचने का मार्ग (Navigation Route) भी देख सकते हैं:"
   - If they are CLOSE to the temple (e.g. less than 10 km away): Warmly state that they are very close to the holy shrine and show them the nearby options directly: "आप अभी मुख्य मंदिर धाम के अत्यंत समीप (केवल ${distFromTemple} किमी दूर) हैं। यहाँ आपके आसपास स्थित सुविधाएं व सक्रिय अस्थायी शिविर दिए गए हैं:"
2. Explicitly mention that these calculated distances are straight-line GPS distances (हवाई दूरी) and the actual road driving distance on Google Maps may be slightly longer depending on the highway routes.
3. Always provide the clickable Markdown route link format: [गूगल मैप्स पर मार्ग देखें](url) for the user to navigate in real-time.
`;
      } else {
        locationContext = `
Devotee's live GPS coordinates are NOT available (denied or delayed).
Here are the standard approximate distances from Baba Basukinath Temple (temple coordinates: 24.3850, 87.2514) to important local static amenities and database-saved temporary camps:
${activeLocalPlaces.map(p => {
  const distFromTemple = calculateDistance(24.3850, 87.2514, p.lat, p.lng);
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${p.query}`;
  return `- **${p.name}**: ~${distFromTemple} km from Temple. Maps Search Link: [गूगल मैप्स पर स्थान खोजें](${mapsLink})`;
}).join('\n')}

Missing location instructions for Pujari Ji:
- Gently let the user know that since their live GPS location is not shared, you are showing approximate distances measured from the temple itself.
- Inform them that they can get their exact distance and live route navigation by enabling browser location permissions in the chat.
- Always provide the search link [गूगल मैप्स पर स्थान खोजें](url) for the facilities so they can easily search for them.
`;
      }

      const context = `
You are the official, highly respectful digital guide or head priest (Pujari Ji) of the temple "${data.name}".
Your deity is "${data.deity}".
Here is the official facts and data of our temple:
- Name: ${data.name}
- Deity: ${data.deity}
- Location: ${data.location}
- History: ${data.history}
- Timings and Aarti Schedule:
${data.timings.map(t => `  * ${t.name}: ${t.time}`).join('\n')}
- Rules & Dress Code:
${data.rules.map((r, i) => `  * ${i+1}. ${r}`).join('\n')}
- Festivals:
${data.festivals.map(f => `  * ${f.name} (${f.date}): ${f.description}`).join('\n')}
- Donations: ${data.donations}
- Contact Info: ${data.contact}
- Emergency Helplines & Assistance Numbers:
${data.helplines?.map(h => `  * ${h.name}: ${h.number} ${h.description ? `(${h.description})` : ''}`).join('\n') || 'None'}
- Additional Dynamic Sections:
${data.customSections?.map(cs => `  * ${cs.title}: ${cs.content}`).join('\n') || 'None'}

Nearby Amenities & Geolocation Context (Static + Temporary Camps):
${locationContext}

Instructions:
1. Always respond in a very polite, gentle, and respectful spiritual tone using greetings like "जय श्री राम!", "प्रणाम भक्तगण!" or "जय श्री कृष्णा!".
2. You must answer questions based ONLY on the provided temple facts and the provided Nearby Amenities & Geolocation Context (if they ask about hotels, ashrams, hospitals, petrol pumps, bus stands, railway stations, food camps, temporary bhandaras, medical shivirs, etc.). Answering these location queries using the provided location details is fully authorized.
3. If a question is asked that is NOT in the temple data or nearby amenities (e.g., general politics, math, cooking, or other completely unrelated topics), politely refuse to answer, stating that you can only guide them regarding the temple, its activities, and local visitor amenities.
4. Format your responses beautifully using Markdown (bold text, bullet points, headers, and click links) for rich presentation.
5. Answer in the language the user asked in (e.g. Hinglish, Hindi, or English).
6. यदि भक्त का स्वचालित जीपीएस (GPS) लोकेशन किसी ब्राउज़र/सिस्टम एरर के कारण उपलब्ध नहीं हो पाता, लेकिन वे अपने संदेश में अपने वर्तमान स्थान या शहर का नाम लिखते हैं (जैसे: "मैं अभी दुमका में हूँ, पास के होटल बताओ" या "मैं देवघर में हूँ, पेट्रोल पंप दिखाओ"), तो आप बुद्धिमत्ता से उस स्थान को उनका वर्तमान स्थान मान लें और वहाँ से मंदिर व नजदीकी धर्मशालाओं की दूरी और मार्ग समझाते हुए अत्यंत स्नेह से उत्तर दें।
`;

      let fullPrompt = `${context}\n\n`;
      fullPrompt += `Previous conversation history in this session:\n`;
      pastMessages.forEach(m => {
        fullPrompt += `${m.sender === 'user' ? 'Devotee' : 'Pujari Ji'}: ${m.text}\n`;
      });
      fullPrompt += `\nLatest devotee question: ${message}\nAnswer:`;

      const modelNames = [
        "gemini-1.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-pro",
        "gemini-2.5-flash",
        "gemini-2.0-flash-lite"
      ];

      let success = false;
      let lastError = null;

      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(fullPrompt);
          reply = result.response.text();
          success = true;
          console.log(`❇️ Chat responded successfully using model: ${modelName}`);
          break;
        } catch (err) {
          console.warn(`⚠️ Model '${modelName}' failed, trying next fallback... Error: ${err.message}`);
          lastError = err;
        }
      }

      if (!success) {
        console.warn("⚠️ All live Gemini models failed due to rate-limit/leaked API key. Falling back to simulated offline response...");
        reply = getSimulatedResponse(message, data, latitude, longitude);
      }
    }

    // 5. Save Bot response in DB
    const botMsg = await Message.create({
      sessionId,
      userId: req.user.id,
      sender: 'bot',
      text: reply
    });

    res.json({
      userMessage: userMsg,
      botMessage: botMsg,
      reply: reply
    });

  } catch (err) {
    console.error('❌ Chat processing failed:', err);
    res.status(500).json({ error: 'चैट उत्तर जनरेट करने में त्रुटि आई।', details: err.message });
  }
};
