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
  { name: "बाबा बासुकीनाथ मुख्य मंदिर (Baba Basukinath Temple)", lat: 24.3850, lng: 87.0872, category: "temple", query: "Baba+Basukinath+Dham+Mandir+Jarmundi" },
  { name: "पर्यटन विहार धर्मशाला (Paryatan Vihar Dharamshala)", lat: 24.3835, lng: 87.0863, category: "hotel", query: "Paryatan+Vihar+Basukinath+Jarmundi" },
  { name: "शिव कृपा होटल (Hotel Shiv Kripa)", lat: 24.3860, lng: 87.0888, category: "hotel", query: "Hotel+Shiv+Kripa+Basukinath+Jarmundi" },
  { name: "बासुकीनाथ गेस्ट हाउस (Basukinath Guest House)", lat: 24.3828, lng: 87.0840, category: "hotel", query: "Basukinath+Guest+House+Jarmundi" },
  { name: "पावन बासुकीनाथ आश्रम (Basukinath Ashram)", lat: 24.3880, lng: 87.0848, category: "ashram", query: "Basukinath+Ashram+Jarmundi" },
  { name: "सामुदायिक स्वास्थ्य केंद्र, जरमुंडी (Community Health Centre, Jarmundi)", lat: 24.3780, lng: 87.0738, category: "hospital", query: "Community+Health+Centre+Jarmundi" },
  { name: "निशुल्क स्वास्थ्य शिविर (Free Medical Camp near Temple)", lat: 24.3845, lng: 87.0883, category: "hospital", query: "Baba+Basukinath+Dham+Mandir+Jarmundi" },
  { name: "भारत पेट्रोलियम जरमुंडी (BPCL Petrol Pump Jarmundi)", lat: 24.3765, lng: 87.0698, category: "petrol_pump", query: "BPCL+Petrol+Pump+Jarmundi" },
  { name: "बासुकीनाथ बस स्टैंड (Basukinath Bus Stand)", lat: 24.3865, lng: 87.0893, category: "bus_stand", query: "Basukinath+Bus+Stand" },
  { name: "बासुकीनाथ रेलवे स्टेशन (Basukinath Railway Station)", lat: 24.3800, lng: 87.0798, category: "railway_station", query: "Basukinath+Railway+Station" },
  { name: "भारतीय स्टेट बैंक एटीएम 🏧 (SBI ATM Basukinath)", lat: 24.3855, lng: 87.0878, category: "atm", query: "SBI+ATM+Basukinath" },
  { name: "एचडीएफसी बैंक एटीएम 🏧 (HDFC Bank ATM Basukinath)", lat: 24.3840, lng: 87.0866, category: "atm", query: "HDFC+Bank+ATM+Basukinath" }
];

// --- OFF-LINE KEYWORD SEARCH ENGINE (FALLBACK) ---
function getSimulatedResponse(question, data, latitude, longitude, activePlaces) {
  const q = question.toLowerCase();
  const isHindi = /[\u0900-\u097F]/.test(question) || q.includes('bheed') || q.includes('katar') || q.includes('samay') || q.includes('rasta') || q.includes('shivir') || q.includes('bhir') || q.includes('bheed') || q.includes('prashad');
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
                        
  const isTransportQuery = q.includes('bus') || q.includes('railway') || q.includes('station') || q.includes('train') || q.includes('transport') ||
                           q.includes('बस') || q.includes('रेलवे') || q.includes('स्टेशन') || q.includes('ट्रेन') || q.includes('परिवहन');
                           
  const isAtmQuery = q.includes('atm') || q.includes('bank') || q.includes('cash') || q.includes('paise nikalne') ||
                     q.includes('एटीएम') || q.includes('बैंक') || q.includes('कैश') || q.includes('पैसा') || q.includes('पैसे');
                     
  const isFoodQuery = q.includes('bhandara') || q.includes('langar') || q.includes('food') || q.includes('khana') ||
                      q.includes('भंडारा') || q.includes('लंगर') || q.includes('भोजन') || q.includes('खाना') || q.includes('प्रसाद') ||
                      q.includes('milk') || q.includes('dudh') || q.includes('doodh') || q.includes('दूध') || q.includes('cow') ||
                      q.includes('vitran') || q.includes('वितरण');
                      
  const isCampQuery = q.includes('camp') || q.includes('shivir') ||
                      q.includes('शिविर') || q.includes('कैंप');

  const isActiveCampsQuery = q.includes('active camp') || q.includes('temporary camp') || q.includes('camp list') || q.includes('all shivir') || q.includes('active shivir') ||
                             q.includes('सक्रिय शिविर') || q.includes('अस्थायी शिविर') || q.includes('शिविरों की सूची') || q.includes('sabhi shivir') || q.includes('shivir list');

  const isInstantCashQuery = q.includes('instant cash') || q.includes('quick cash') || q.includes('qr cash') || q.includes('qr code cash') || q.includes('cash counter') || q.includes('नकद') || q.includes('कैश');
  
  const isParkingQuery = q.includes('parking') || q.includes('park') || q.includes('gadi khada') || q.includes('gaadi khadi') || q.includes('vahan stand') ||
                         q.includes('पार्किंग') || q.includes('गाड़ी खड़ी') || q.includes('गाडी खडी') || q.includes('वाहन स्टैंड');

  const isAmenitiesSearch = isHotelQuery || isHospitalQuery || isPetrolQuery || isTransportQuery || isAtmQuery || isFoodQuery || isCampQuery || isActiveCampsQuery || isInstantCashQuery || isParkingQuery ||
                            q.includes('facility') || q.includes('suvidha') || q.includes('nearby') || q.includes('paas') ||
                            q.includes('सुविधा') || q.includes('पास') || q.includes('नजदीक');

  if (isAmenitiesSearch) {
    let targetCategories = [];
    let facilityName = "जन-सुविधाओं और शिविरों";
    let showOnlyTemporary = false;

    if (isActiveCampsQuery) {
      showOnlyTemporary = true;
      let targetCampCategory = null;
      let categoryLabel = "अस्थायी शिविरों";
      
      if (q.includes('stay') || q.includes('accommodation') || q.includes('aawas') || q.includes('thaharne') || q.includes('rukne') || q.includes('आवास') || q.includes('ठहरने') || q.includes('रुकने')) {
        targetCampCategory = 'stay';
        categoryLabel = "अस्थायी आवास / ठहरने के शिविर (Accommodation Camps)";
      } else if (q.includes('medical') || q.includes('hospital') || q.includes('doctor') || q.includes('chikit') || q.includes('dawai') || q.includes('dawa') || q.includes('health') || q.includes('चिकित्सा') || q.includes('स्वास्थ्य') || q.includes('अस्पताल') || q.includes('इलाज') || q.includes('दवाई')) {
        targetCampCategory = 'medical';
        categoryLabel = "अस्थायी चिकित्सा शिविर (Medical Help Camps)";
      } else if (q.includes('food') || q.includes('langar') || q.includes('bhandara') || q.includes('khana') || q.includes('dudh') || q.includes('milk') || q.includes('भोजन') || q.includes('लंगर') || q.includes('भंडारा') || q.includes('खाना') || q.includes('दूध')) {
        targetCampCategory = 'food';
        categoryLabel = "भोजन / भंडारा / लंगर सेवा शिविर (Food & Langar Camps)";
      } else if (q.includes('parking') || q.includes('park') || q.includes('vahan') || q.includes('gadi') || q.includes('पार्किंग') || q.includes('वाहन') || q.includes('गाड़ी')) {
        targetCampCategory = 'parking';
        categoryLabel = "अस्थायी पार्किंग स्थल / वाहन स्टैंड (Parking Camps)";
      } else if (q.includes('transport') || q.includes('bus') || q.includes('station') || q.includes('stand') || q.includes('परिवहन') || q.includes('बस') || q.includes('रेलवे') || q.includes('स्टेशन') || q.includes('स्टैंड')) {
        targetCampCategory = 'transport';
        categoryLabel = "अस्थायी परिवहन / बस सेवा शिविर (Transport Camps)";
      } else if (q.includes('atm') || q.includes('bank') || q.includes('cash') || q.includes('paise')) {
        targetCampCategory = 'atm';
        categoryLabel = "अस्थायी एटीएम / बैंकिंग शिविर (ATM Camps)";
      } else if (q.includes('instant cash') || q.includes('quick cash') || q.includes('qr cash') || q.includes('qr code cash') || q.includes('cash counter') || q.includes('नकद') || q.includes('कैश')) {
        targetCampCategory = 'instant_cash';
        categoryLabel = "त्वरित नकद सेवा / QR कोड से कैश (Instant Cash via QR)";
      }
      
      facilityName = `सक्रिय ${categoryLabel}`;
      if (targetCampCategory) {
        targetCategories = [targetCampCategory];
      }
    } else if (isHotelQuery) {
      targetCategories = ['hotel', 'ashram', 'stay'];
      facilityName = "ठहरने की उत्तम व्यवस्था (होटल, धर्मशाला और आश्रम)";
    } else if (isHospitalQuery) {
      targetCategories = ['hospital', 'medical'];
      facilityName = "स्वास्थ्य सुविधाओं और चिकित्सा शिविरों";
    } else if (isPetrolQuery) {
      targetCategories = ['petrol_pump'];
      facilityName = "पेट्रोल पंप और ईंधन स्टेशनों";
    } else if (isParkingQuery) {
      targetCategories = ['parking'];
      facilityName = "अस्थायी व स्थायी पार्किंग स्थलों और वाहन स्टैंडों";
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
      targetCategories = ['stay', 'medical', 'food', 'hospital', 'instant_cash', 'parking'];
      facilityName = "अस्थायी शिविरों (आवास, स्वास्थ्य, भोजन, त्वरित कैश और पार्किंग)";
    }

    let filteredPlaces = targetCategories.length > 0 
      ? placesList.filter(p => targetCategories.includes(p.category))
      : placesList;

    if (showOnlyTemporary) {
      filteredPlaces = placesList.filter(p => p.isTemporary === true);
      if (targetCategories.length > 0) {
        filteredPlaces = filteredPlaces.filter(p => targetCategories.includes(p.category));
      }
    }

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
        const dist = calculateDistance(24.3850, 87.0872, p.lat, p.lng);
        const routeLink = `https://www.google.com/maps/search/?api=1&query=${p.query}`;
        reply += `📍 **${p.name}**:\n   - **मंदिर से दूरी**: लगभग ${dist} किमी\n   - **गूगल मैप्स**: [यहाँ खोजें](${routeLink})\n\n`;
      });
    }
    return reply;
  }

  if (q.includes('wheelchair') || q.includes('disabled') || q.includes('divyang') || q.includes('buzurg') || q.includes('buda') || q.includes('chalne me dikkat') || q.includes('parents') || q.includes('dadi') || q.includes('dada') || q.includes('दिव्यांग') || q.includes('बुजुर्ग') || q.includes('व्हीलचेयर') || q.includes('सहायता')) {
    const da = data.disabledAssistance || {
      wheelchairsAvailable: "मुख्य बस स्टैंड और मंदिर न्यास कार्यालय (गेट नंबर 1) पर निशुल्क व्हीलचेयर उपलब्ध हैं।",
      eRickshawRoutes: "बस स्टैंड से सिंह द्वार तक निशुल्क ई-रिक्शा सेवा सक्रिय है।",
      specialEntryGates: "70 वर्ष से अधिक आयु के बुजुर्गों और दिव्यांगों के लिए गेट नंबर 3 से सीधे निशुल्क प्रवेश की व्यवस्था है (लाइन में लगने की आवश्यकता नहीं है)।",
      helplineNumber: "+91-9431301037"
    };

    reply += `वृद्ध एवं दिव्यांग श्रद्धालुओं के लिए मंदिर परिसर में निम्नलिखित विशेष व्यवस्थाएं की गई हैं:\n\n`;
    reply += `♿ **निशुल्क व्हीलचेयर सेवा (Wheelchair Pick-up):**\n   - ${da.wheelchairsAvailable || 'मुख्य द्वारों पर निशुल्क उपलब्ध।'}\n\n`;
    reply += `🛺 **निशुल्क ई-रिक्शा रूट (Free E-Rickshaw):**\n   - ${da.eRickshawRoutes || 'बस स्टैंड से सिंह द्वार मार्ग पर संचालित।'}\n\n`;
    reply += `🎟️ **विशेष प्रवेश द्वार (Special Direct Darshan Gate):**\n   - ${da.specialEntryGates || 'बुजुर्गों और दिव्यांगों के लिए डायरेक्ट प्रवेश उपलब्ध।'}\n\n`;
    if (da.helplineNumber) {
      reply += `📞 **विशेष सहायता डेस्क (Volunteer Support Helpline):**\n   - [कॉल करें (${da.helplineNumber})](tel:${da.helplineNumber})\n\n`;
    }
    reply += `कृपया इन सुविधाओं का लाभ उठाएं। बाबा बासुकीनाथ आपकी यात्रा मंगलमय करें! 🙏`;
    return reply;
  }

  const isCrowdQuery = q.includes('crowd') || q.includes('queue') || q.includes('rush') || 
                       (q.includes('line') && !q.includes('helpline') && !q.includes('online')) || 
                       q.includes('waiting') || q.includes('wait time') || 
                       q.includes('bheed') || q.includes('vheed') || q.includes('katar') || q.includes('bhira') || q.includes('bhir') ||
                       q.includes('भीड़') || q.includes('कतार') || q.includes('रश') || q.includes('कतार में') || 
                       (q.includes('लाइन') && !q.includes('हेल्पलाइन') && !q.includes('ऑनलाइन'));
  
  if (isCrowdQuery) {
    const cs = data.crowdStatus || {
      status: 'normal',
      waitTime: '30 मिनट',
      description: 'कतार सामान्य है, दर्शन आसानी से हो रहे हैं।',
      descriptionEn: 'Queue is normal, darshan is smooth.',
      updatedAt: new Date()
    };
    
    let statusText = "सामान्य (Normal)";
    let emoji = "🟢";
    if (cs.status === 'low') { statusText = "कम (Low)"; emoji = "🟢"; }
    else if (cs.status === 'heavy') { statusText = "भारी (Heavy)"; emoji = "🟡"; }
    else if (cs.status === 'peak') { statusText = "अत्यधिक भीड़ (Peak Rush) ⚠️"; emoji = "🔴"; }

    const timeDiff = Math.max(0, Math.floor((Date.now() - new Date(cs.updatedAt).getTime()) / 60000));
    let timeStr = timeDiff === 0 ? "अभी-अभी" : `${timeDiff} मिनट पहले`;
    if (timeDiff >= 60) {
      const hr = Math.floor(timeDiff / 60);
      timeStr = `${hr} घंटे पहले`;
    }

    reply += `📊 **लाइव भीड़ और कतार स्थिति (Live Crowd & Queue Status)**:\n\n`;
    reply += `${emoji} **भीड़ का स्तर (Crowd Level)**: ${statusText}\n`;
    reply += `⏳ **कतार में लगने वाला समय (Queue Wait Time)**: ~ ${cs.waitTime || '30 मिनट'} (मंदिर पहुँचने के बाद)\n`;

    // Dynamic travel time calculation based on live distance!
    if (latitude && longitude) {
      const distFromTemple = calculateDistance(latitude, longitude, 24.3850, 87.0872);
      
      let travelTimeMins = 0;
      let travelMode = isHindi ? "वाहन (Vehicle)" : "Vehicle";
      if (distFromTemple <= 1.5) {
        travelMode = isHindi ? "पैदल (Walking)" : "Walking";
        travelTimeMins = Math.round((distFromTemple / 4.5) * 60); // Walking: ~4.5 km/hr
      } else {
        travelTimeMins = Math.round((distFromTemple / 25) * 60); // Driving: ~25 km/hr in traffic
      }
      
      let travelTimeStr = isHindi ? `${travelTimeMins} मिनट` : `${travelTimeMins} mins`;
      if (travelTimeMins >= 60) {
        const h = Math.floor(travelTimeMins / 60);
        const m = travelTimeMins % 60;
        if (isHindi) {
          travelTimeStr = m > 0 ? `${h} घंटा ${m} मिनट` : `${h} घंटा`;
        } else {
          travelTimeStr = m > 0 ? `${h} hr ${m} mins` : `${h} hr`;
        }
      }
      
      if (isHindi) {
        reply += `🚗 **यात्रा का अनुमानित समय (Travel Time)**: ~ ${travelTimeStr} (${travelMode} द्वारा, दूरी ${distFromTemple} किमी)\n`;
        reply += `🔔 **कुल अनुमानित समय (Total Time to Darshan)**: लगभग **${travelTimeStr}** (यात्रा) + **${cs.waitTime}** (कतार)\n`;
      } else {
        reply += `🚗 **Travel Time to Temple**: ~ ${travelTimeStr} (via ${travelMode}, distance ${distFromTemple} km)\n`;
        reply += `🔔 **Total Expected Time**: ~ **${travelTimeStr}** (Travel) + **${cs.waitTime}** (Queue)\n`;
      }
    } else {
      if (isHindi) {
        reply += `ℹ️ *नोट: यदि आप अपनी लोकेशन शेयर करते हैं, तो मैं आपके वर्तमान स्थान से यात्रा का समय जोड़कर कुल दर्शन समय भी बता सकता हूँ।*\n`;
      } else {
        reply += `ℹ️ *Note: Share your live location to view travel time added to queue wait time.*\n`;
      }
    }

    reply += `\n📢 **ताज़ा स्थिति (Live Update)**: ${cs.description || 'दर्शन सुचारू रूप से चल रहे हैं।'}\n`;
    reply += `⏱️ **अंतिम अपडेट (Last Updated)**: ${timeStr}\n\n`;
    reply += `बाबा बासुकीनाथ के दर्शन के लिए आ रहे सभी श्रद्धालुओं से अनुरोध है कि नियमों का पालन करें। हर हर महादेव! 🙏`;
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

  if (q.includes('contact') || q.includes('phone') || q.includes('helpline') || q.includes('email') || q.includes('address') || q.includes('location') || q.includes('pata') || q.includes('kahan') || q.includes('reach') || q.includes('rasta') || q.includes('route') || q.includes('police') || q.includes('medical') || q.includes('emergency') ||
      q.includes('आपातकालीन') || q.includes('हेल्पलाइन') || q.includes('संपर्क') || q.includes('सम्पर्क') || q.includes('नंबर') || q.includes('फोन') || q.includes('आपात') || q.includes('apatkalin')) {
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

    // Defensive check: Initialize crowdStatus defaults if missing in pre-existing database record
    if (!data.crowdStatus || !data.crowdStatus.status) {
      data.crowdStatus = {
        status: 'normal',
        waitTime: '30 मिनट',
        description: 'कतार सामान्य है, दर्शन आसानी से हो रहे हैं।',
        descriptionEn: 'Queue is normal, darshan is smooth.',
        updatedAt: new Date()
      };
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
         else if (camp.category === 'instant_cash') categoryEmoji = '💵';
         else if (camp.category === 'parking') categoryEmoji = '🅿️';
 
         activeLocalPlaces.push({
           name: `${camp.name} ${categoryEmoji} (${camp.category === 'stay' ? 'अस्थायी आवास' : camp.category === 'medical' ? 'अस्थायी चिकित्सा शिविर' : camp.category === 'food' ? 'अस्थायी भोजन/लंगर शिविर' : camp.category === 'atm' ? 'एटीएम/बैंक' : camp.category === 'instant_cash' ? 'त्वरित नकद (QR कोड से कैश)' : camp.category === 'parking' ? 'अस्थायी पार्किंग स्थल व स्टैंड' : 'अस्थायी परिवहन सेवा'}) - ${camp.description}`,
           lat: camp.lat,
           lng: camp.lng,
           category: camp.category,
           query: `${camp.lat},${camp.lng}`,
           description: camp.description,
           isTemporary: true
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

    // --- INTENT PARSING FOR CAMP GUIDED WORKFLOW ---
    const q = message.toLowerCase();
    const isActiveCampsQuery = q.includes('active camp') || q.includes('temporary camp') || q.includes('camp list') || q.includes('all shivir') || q.includes('active shivir') ||
                               q.includes('सक्रिय शिविर') || q.includes('अस्थायी शिविर') || q.includes('शिविरों की सूची') || q.includes('sabhi shivir') || q.includes('shivir list');
                               
    const hasStay = q.includes('stay') || q.includes('accommodation') || q.includes('aawas') || q.includes('thaharne') || q.includes('rukne') || q.includes('आवास') || q.includes('ठहरने') || q.includes('रुकने');
    const hasMedical = q.includes('medical') || q.includes('hospital') || q.includes('doctor') || q.includes('chikit') || q.includes('dawai') || q.includes('dawa') || q.includes('health') || q.includes('चिकित्सा') || q.includes('स्वास्थ्य') || q.includes('अस्पताल') || q.includes('इलाज') || q.includes('दवाई') || q.includes('डॉक्टर');
    const hasFood = q.includes('food') || q.includes('langar') || q.includes('bhandara') || q.includes('khana') || q.includes('doodh') || q.includes('dudh') || q.includes('milk') || q.includes('भोजन') || q.includes('लंगर') || q.includes('भंडारा') || q.includes('खाना') || q.includes('दूध') || q.includes('प्रसाद');
    const hasTransport = q.includes('transport') || q.includes('bus') || q.includes('railway') || q.includes('station') || q.includes('train') || q.includes('परिवहन') || q.includes('बस') || q.includes('रेलवे') || q.includes('स्टेशन') || q.includes('ट्रेन');
    const hasAtm = q.includes('atm') || q.includes('bank') || q.includes('cash') || q.includes('paise') || q.includes('एटीएम') || q.includes('बैंक') || q.includes('कैश') || q.includes('पैसा');
    const hasInstantCash = q.includes('instant cash') || q.includes('quick cash') || q.includes('qr cash') || q.includes('qr code cash') || q.includes('cash counter') || q.includes('नकद') || q.includes('कैश');
    const hasParking = q.includes('parking') || q.includes('park') || q.includes('gadi khada') || q.includes('gaadi khadi') || q.includes('vahan stand') || q.includes('पार्किंग') || q.includes('गाड़ी खड़ी') || q.includes('गाडी खडी') || q.includes('वाहन स्टैंड');
    
    const hasSpecificCampCategory = hasStay || hasMedical || hasFood || hasTransport || hasAtm || hasInstantCash || hasParking;

    // A: Bypassing logic for general Camp requests to offer interactive selection
    if (isActiveCampsQuery && !hasSpecificCampCategory) {
      const guidedReply = `जय श्री राम! 🙏 बाबा बासुकीनाथ धाम में श्रद्धालुओं की सेवा के लिए कई प्रकार के अस्थायी शिविर (Temporary Camps) लगाए गए हैं। 

सही जानकारी के लिए कृपया बताएं कि आपको किस प्रकार के शिविर की आवश्यकता है:
1. 🏨 **अस्थायी आवास / ठहरने की व्यवस्था (Stay & Accommodation)**
2. 🏥 **अस्थायी चिकित्सा शिविर (Medical Help & Shivir)**
3. 🍱 **भोजन / भंडारा / लंगर सेवा (Free Food & Langar)**
4. 🚌 **अस्थायी परिवहन / बस सेवा (Transport & Bus)**
5. 🏧 **अस्थायी एटीएम / बैंकिंग (ATM & Banking)**
6. 💵 **त्वरित नकद सेवा / QR कोड से कैश (Instant Cash via QR)**
7. 🅿️ **अस्थायी पार्किंग स्थल / वाहन स्टैंड (Temporary Parking & Stand)**

*(आप नीचे सजेशन बार में से भी सीधे अपनी पसंद की श्रेणी चुन सकते हैं!)*`;

      const botMsg = await Message.create({
        sessionId,
        userId: req.user.id,
        sender: 'bot',
        text: guidedReply
      });

      return res.json({
        userMessage: userMsg,
        botMessage: botMsg,
        reply: guidedReply
      });
    }

    // B: If a specific category was requested, filter activeLocalPlaces strictly to keep context highly focused!
    let finalPlacesList = [...activeLocalPlaces];
    if (isActiveCampsQuery && hasSpecificCampCategory) {
      let matchedCampCategory = null;
      if (hasStay) matchedCampCategory = 'stay';
      else if (hasMedical) matchedCampCategory = 'medical';
      else if (hasFood) matchedCampCategory = 'food';
      else if (hasParking) matchedCampCategory = 'parking';
      else if (hasTransport) matchedCampCategory = 'transport';
      else if (hasAtm) matchedCampCategory = 'atm';
      else if (hasInstantCash) matchedCampCategory = 'instant_cash';

      if (matchedCampCategory) {
        finalPlacesList = activeLocalPlaces.filter(p => p.category === matchedCampCategory);
      }
    }

    // 4. Fetch past messages for history context
    const pastMessages = await Message.find({ sessionId }).sort({ timestamp: 1 }).limit(10);

    let reply = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // 🔸 Fallback simulated offline search engine
      reply = getSimulatedResponse(message, data, latitude, longitude, finalPlacesList);
      await new Promise(resolve => setTimeout(resolve, 800));
    } else {
      // 🔸 Call live Gemini API with context RAG with robust fallback chain
      const genAI = new GoogleGenerativeAI(apiKey);

      let locationContext = "";
      if (latitude && longitude) {
        const distFromTemple = calculateDistance(latitude, longitude, 24.3850, 87.0872);
        locationContext = `
Devotee's LIVE GPS COORDINATES are available: Latitude ${latitude}, Longitude ${longitude}.
The devotee is currently approximately ${distFromTemple} km away from the main Baba Basukinath Temple.

Here are the exact calculated straight-line (GPS) distances from the devotee to important local static amenities and database-saved temporary camps around the temple. You MUST use these exact distance values to answer their queries:
${finalPlacesList.map(p => {
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
Here are the standard approximate distances from Baba Basukinath Temple (temple coordinates: 24.3850, 87.0872) to important local static amenities and database-saved temporary camps:
${finalPlacesList.map(p => {
  const distFromTemple = calculateDistance(24.3850, 87.0872, p.lat, p.lng);
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
- Elderly & Disabled Assistance (वृद्ध एवं दिव्यांग सहायता):
  * Wheelchairs Pick-up: ${data.disabledAssistance?.wheelchairsAvailable || 'Not Configured'}
  * Free E-Rickshaw Routes: ${data.disabledAssistance?.eRickshawRoutes || 'Not Configured'}
  * Special Fast Darshan Entry Gates: ${data.disabledAssistance?.specialEntryGates || 'Not Configured'}
  * Volunteer Sahayata Helpline Number: ${data.disabledAssistance?.helplineNumber || 'Not Configured'}
- Additional Dynamic Sections:
${data.customSections?.map(cs => `  * ${cs.title}: ${cs.content}`).join('\n') || 'None'}
- LIVE CROWD & QUEUE STATUS TRACKER (लाइव भीड़ और कतार की स्थिति):
  * Current Crowd Level: ${data.crowdStatus?.status || 'normal'} (Values could be: low, normal, heavy, peak)
  * Estimated Wait Time in queue: ${data.crowdStatus?.waitTime || '30 मिनट'}
  * Live Queue Update Description (Hindi): ${data.crowdStatus?.description || 'कतार सामान्य है, दर्शन सुचारू रूप से चल रहे हैं।'}
  * Live Queue Update Description (English): ${data.crowdStatus?.descriptionEn || 'Queue is normal, darshan is smooth.'}
  * Status Last Updated: ${data.crowdStatus?.updatedAt ? new Date(data.crowdStatus.updatedAt).toLocaleTimeString('hi-IN') : 'Just now'}

Nearby Amenities & Geolocation Context (Static + Temporary Camps):
${locationContext}

Instructions:
0. CRITICAL SYSTEM INSTRUCTION: You have direct, real-time access to the official temple administration database containing the current live crowd levels and waiting times. This is NOT a real-time web query; it is your official administrative data. You are FULLY AUTHORIZED to present this information to the devotee. You MUST NOT apologize, and you MUST NOT say "क्षमस्व, मेरे पास वर्तमान में लाइव जानकारी उपलब्ध नहीं है" or say you don't know. You MUST answer directly using the provided crowd level, wait time, and queue description in the database.
1. Always respond in a very polite, gentle, and respectful spiritual tone using greetings like "जय श्री राम!", "प्रणाम भक्तगण!" or "जय श्री कृष्णा!".
2. You must answer questions based ONLY on the provided temple facts, live crowd status tracker, and the provided Nearby Amenities & Geolocation Context (if they ask about hotels, ashrams, hospitals, petrol pumps, bus stands, railway stations, food camps, temporary bhandaras, medical shivirs, etc.). Answering these location queries using the provided location details is fully authorized.
3. If a question is asked that is NOT in the temple data, live crowd status, or nearby amenities (e.g., general politics, math, cooking, or other completely unrelated topics), politely refuse to answer, stating that you can only guide them regarding the temple, live queue status, its activities, and local visitor amenities.
4. Format your responses beautifully using Markdown (bold text, bullet points, headers, and click links) for rich presentation.
5. Answer in the language the user asked in (e.g. Hinglish, Hindi, or English).
6. यदि भक्त का स्वचालित जीपीएस (GPS) लोकेशन किसी ब्राउज़र/सिस्टम एरर के कारण उपलब्ध नहीं हो पाता, लेकिन वे अपने संदेश में अपने वर्तमान स्थान या शहर का नाम लिखते हैं (जैसे: "मैं अभी दुमका में हूँ, पास के होटल बताओ" या "मैं देवघर में हूँ, पेट्रोल पंप दिखाओ"), तो आप बुद्धिमत्ता से उस स्थान को उनका वर्तमान स्थान मान लें और वहाँ से मंदिर व नजदीकी धर्मशालाओं की दूरी और मार्ग समझाते हुए अत्यंत स्नेह से उत्तर दें।
7. When devotee asks about crowd, waiting time, rush, lines or crowd tracker ("भीड़ कैसी है?", "दर्शन में कितना समय लगेगा?", "कतार की स्थिति", "wait time", "rush", "line status"), you MUST present this live crowd status, estimated waiting time, and description to them. Ensure the crowd level is translated respectfully (low: कम, normal: सामान्य, heavy: भारी, peak: अत्यधिक भीड़ ⚠️) and highlight the estimated wait time.
8. Location-Aware Darshan Calculations (भक्त के स्थान आधारित दर्शन गणना):
   - If devotee's live GPS coordinates are shared, calculate approximate travel duration. Assume average walking speed is ~4.5 km/h (for distances <= 1.5 km) and driving speed is ~25 km/h through local traffic (for distances > 1.5 km).
   - Inform the devotee of both:
     a) Travel Time (यात्रा का समय): The estimated time it takes to travel from their current location.
     b) Queue Wait Time (कतार का समय): The wait time in the temple queue set by the Admin (${data.crowdStatus?.waitTime || '30 मिनट'}).
     c) Total Expected Time (कुल अनुमानित समय): Sum of travel time and queue wait time! For example: "चूंकि आप मंदिर से 5 किमी दूर हैं, वहां से यहाँ पहुँचने में लगभग 12 मिनट लगेंगे। अभी मंदिर की कतार में लगभग 30 मिनट का समय लग रहा है, अतः दर्शन पूरे होने में कुल लगभग 42 मिनट (12 मिनट यात्रा + 30 मिनट कतार) का समय लगेगा।"
   - If GPS coordinates are not available, gently state that travel time cannot be added, but they can get exact total travel + queue wait times by enabling location permissions!
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
        reply = getSimulatedResponse(message, data, latitude, longitude, finalPlacesList);
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
