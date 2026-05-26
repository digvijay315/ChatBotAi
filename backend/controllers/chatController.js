import { GoogleGenerativeAI } from '@google/generative-ai';
import Session from '../models/Session.js';
import Message from '../models/Message.js';
import Temple from '../models/Temple.js';

// --- OFF-LINE KEYWORD SEARCH ENGINE (FALLBACK) ---
function getSimulatedResponse(question, data) {
  const q = question.toLowerCase();
  const deity = data.deity;
  const name = data.name;

  let reply = `प्रणाम भक्तगण! 🙏 मैं ${name} का डिजिटल मार्गदर्शक हूँ। `;

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

  if (q.includes('contact') || q.includes('phone') || q.includes('helpline') || q.includes('email') || q.includes('address') || q.includes('location') || q.includes('pata') || q.includes('kahan') || q.includes('reach') || q.includes('rasta') || q.includes('route')) {
    reply += `मंदिर का पता और संपर्क सूत्र इस प्रकार है:\n\n📍 **स्थान**: ${data.location}\n\n${data.contact}`;
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
  const { message, sessionId } = req.body;

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
      reply = getSimulatedResponse(message, data);
      await new Promise(resolve => setTimeout(resolve, 800));
    } else {
      // 🔸 Call live Gemini API with context RAG with robust fallback chain
      const genAI = new GoogleGenerativeAI(apiKey);

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
- Additional Dynamic Sections:
${data.customSections?.map(cs => `  * ${cs.title}: ${cs.content}`).join('\n') || 'None'}

Instructions:
1. Always respond in a very polite, gentle, and respectful spiritual tone using greetings like "जय श्री राम!", "प्रणाम भक्तगण!" or "जय श्री कृष्णा!".
2. You must strictly answer questions based ONLY on the provided temple facts.
3. If a question is asked that is NOT in the temple data (e.g., general politics, math, cooking, or other unrelated topics), politely refuse to answer, stating that you can only guide them regarding the temple and its activities.
4. Format your responses beautifully using Markdown (bold text, bullet points, headers) for rich presentation.
5. Answer in the language the user asked in (e.g. Hinglish, Hindi, or English).
`;

      let fullPrompt = `${context}\n\n`;
      fullPrompt += `Previous conversation history in this session:\n`;
      pastMessages.forEach(m => {
        fullPrompt += `${m.sender === 'user' ? 'Devotee' : 'Pujari Ji'}: ${m.text}\n`;
      });
      fullPrompt += `\nLatest devotee question: ${message}\nAnswer:`;

      const modelNames = [
        "gemini-2.5-flash",
        "gemini-2.0-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash",
        "gemini-2.5-pro"
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
        throw lastError || new Error("All generative models in the fallback chain failed.");
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
