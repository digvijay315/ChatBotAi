

async function runEmergencyTest() {
  const BACKEND_URL = 'http://localhost:5000/api';
  console.log('🏁 Starting integration verification tests for Emergency Helplines Quick Reply...');

  try {
    // 1. Devotee Registration
    const randomEmail = `devotee_emergency_${Math.floor(Math.random() * 100000)}@gmail.com`;
    console.log(`\n➡️ Step 1: Registering a test devotee (${randomEmail})...`);
    const regRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'आपातकालीन परीक्षक',
        email: randomEmail,
        password: 'password123'
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    console.log('✅ Devotee registered successfully!');

    // 2. Devotee Login
    console.log('\n➡️ Step 2: Logging in as devotee to obtain session token...');
    const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: randomEmail,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(`Devotee login failed: ${JSON.stringify(loginData)}`);
    const devoteeToken = loginData.token;
    console.log('✅ Devotee logged in successfully! Obtained token.');

    // 3. Create Chat Session
    console.log('\n➡️ Step 3: Creating a new Devotee Chat Session...');
    const sessionRes = await fetch(`${BACKEND_URL}/sessions/new`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${devoteeToken}`
      },
      body: JSON.stringify({ title: 'आपातकालीन हेल्पलाइन सत्र' })
    });
    const sessionData = await sessionRes.json();
    if (!sessionRes.ok) throw new Error(`Session creation failed: ${JSON.stringify(sessionData)}`);
    const sessionId = sessionData._id;
    console.log(`✅ Session created successfully! Session ID: ${sessionId}`);

    // 4. Devotee Queries Emergency Helplines in Hindi (matching the exact quick prompt query)
    const hindiQuery = "मंदिर के आसपास आपातकालीन हेल्पलाइन नंबर और सहायता नंबर दिखाओ";
    console.log(`\n➡️ Step 4: Querying Chatbot with Hindi Quick Prompt: "${hindiQuery}"...`);
    const chatRes1 = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${devoteeToken}`
      },
      body: JSON.stringify({
        message: hindiQuery,
        sessionId: sessionId
      })
    });
    const chatData1 = await chatRes1.json();
    if (!chatRes1.ok) throw new Error(`Chat transmission failed: ${JSON.stringify(chatData1)}`);
    
    console.log('\n--- PUJARI JI HINDI EMERGENCY RESPONSE ---');
    console.log(chatData1.reply);
    console.log('-------------------------------------------\n');

    // Verify response contains helpline markers
    const hasEmergencyTitle = chatData1.reply.includes("🚨") || chatData1.reply.includes("हेल्पलाइन") || chatData1.reply.includes("Emergency");
    if (hasEmergencyTitle) {
      console.log('✅ Success: Pujari Ji responded with emergency helpline contacts!');
    } else {
      throw new Error('Failure: Pujari Ji did not return helplines for Hindi query.');
    }

    // 5. Devotee Queries in English
    const englishQuery = "Show emergency helplines and assistance contact numbers around the temple";
    console.log(`\n➡️ Step 5: Querying Chatbot with English Quick Prompt: "${englishQuery}"...`);
    const chatRes2 = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${devoteeToken}`
      },
      body: JSON.stringify({
        message: englishQuery,
        sessionId: sessionId
      })
    });
    const chatData2 = await chatRes2.json();
    if (!chatRes2.ok) throw new Error(`Chat transmission failed: ${JSON.stringify(chatData2)}`);

    console.log('\n--- PUJARI JI ENGLISH EMERGENCY RESPONSE ---');
    console.log(chatData2.reply);
    console.log('---------------------------------------------\n');

    if (chatData2.reply.includes("🚨") || chatData2.reply.includes("Emergency") || chatData2.reply.includes("Helplines")) {
      console.log('✅ Success: Pujari Ji responded with emergency helpline contacts in English!');
    } else {
      throw new Error('Failure: Pujari Ji did not return helplines for English query.');
    }

    console.log('\n🎉 ALL HELPLINE QUICK PROMPT INTEGRATION TESTS PASSED SUCCESSFULLY!');

  } catch (error) {
    console.error('\n🚨 Verification Error:', error.message);
    process.exit(1);
  }
}

runEmergencyTest();
