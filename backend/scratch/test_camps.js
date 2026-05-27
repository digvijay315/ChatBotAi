async function runTest() {
  const BACKEND_URL = 'http://localhost:5000/api';
  console.log('🏁 Starting integration verification tests for Temporary Camps & Shivirs Manager...');

  try {
    // 1. Devotee Registration
    const randomEmail = `devotee_${Math.floor(Math.random() * 100000)}@gmail.com`;
    console.log(`\n➡️ Step 1: Registering a test devotee (${randomEmail})...`);
    const regRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'परीक्षक भक्त',
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
    const sessionRes = await fetch(`${BACKEND_URL}/chat/sessions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${devoteeToken}`
      },
      body: JSON.stringify({ title: 'शिविर सत्यापन सत्र' })
    });
    const sessionData = await sessionRes.json();
    if (!sessionRes.ok) throw new Error(`Session creation failed: ${JSON.stringify(sessionData)}`);
    const sessionId = sessionData._id;
    console.log(`✅ Session created successfully! Session ID: ${sessionId}`);

    // 4. Admin Login
    console.log('\n➡️ Step 4: Logging in as Admin to authorize database modifications...');
    const adminRes = await fetch(`${BACKEND_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'admin@123'
      })
    });
    const adminData = await adminRes.json();
    if (!adminRes.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminData)}`);
    const adminToken = adminData.token;
    console.log('✅ Admin logged in successfully! Admin token generated.');

    // 5. Fetch Current Temple Data
    console.log('\n➡️ Step 5: Fetching current Temple Details from MongoDB...');
    const templeGetRes = await fetch(`${BACKEND_URL}/temple-data`);
    const templeGetData = await templeGetRes.json();
    if (!templeGetRes.ok) throw new Error(`Fetch temple data failed: ${JSON.stringify(templeGetData)}`);
    const templeBaseData = templeGetData.data;
    console.log(`✅ Current temple data fetched: "${templeBaseData.name}"`);

    // Save original camps to restore later
    const originalCamps = templeBaseData.temporaryCamps || [];

    // 6. Add a Temporary Bhandara Food Camp
    console.log('\n➡️ Step 6: Injecting a temporary Bhandara Langar Camp via Admin API...');
    const testCamp = {
      name: "परीक्षक बाबा लंगर और भंडारा (Test Langar Camp)",
      category: "food",
      lat: 24.3885,
      lng: 87.2525,
      description: "श्रद्धालुओं के लिए निशुल्क गर्म प्रसाद, खिचड़ी एवं शीतल पेयजल व्यवस्था।"
    };

    const updatedTempleData = {
      ...templeBaseData,
      temporaryCamps: [
        ...originalCamps,
        testCamp
      ]
    };

    const templeUpdateRes = await fetch(`${BACKEND_URL}/temple-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(updatedTempleData)
    });
    const templeUpdateData = await templeUpdateRes.json();
    if (!templeUpdateRes.ok) throw new Error(`Admin save failed: ${JSON.stringify(templeUpdateData)}`);
    console.log('✅ Temporary Camp injected successfully to MongoDB!');

    // 7. Devotee Queries Chatbot with Geolocation Fallback
    console.log('\n➡️ Step 7: Chatting with Pujari Ji about nearby food/langar camps with devotee live GPS coordinates...');
    
    // Live coordinates close to temple: lat 24.3850, lng 87.2514
    const devLatitude = 24.3850;
    const devLongitude = 87.2514;

    const chatRes = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${devoteeToken}`
      },
      body: JSON.stringify({
        message: "भोजन शिविर या लंगर कहाँ लगा है?",
        sessionId: sessionId,
        latitude: devLatitude,
        longitude: devLongitude
      })
    });
    const chatData = await chatRes.json();
    if (!chatRes.ok) throw new Error(`Chat transmission failed: ${JSON.stringify(chatData)}`);
    
    const botReply = chatData.reply;
    console.log('\n--- PUJARI JI RESPONSE ---');
    console.log(botReply);
    console.log('---------------------------\n');

    // 8. Verify Pujari Ji Response
    console.log('➡️ Step 8: Verifying Pujari Ji response correctness...');
    const containsCampName = botReply.includes("परीक्षक बाबा लंगर और भंडारा") || botReply.includes("Test Langar Camp");
    const containsGoogleMapLink = botReply.includes("24.3885,87.2525");
    
    if (containsCampName) {
      console.log('✅ Success: Pujari Ji recognized and described the temporary camp!');
    } else {
      console.log('❌ Failure: Pujari Ji did not mention the temporary camp.');
    }

    if (containsGoogleMapLink) {
      console.log('✅ Success: Navigation link accurately points to GPS coordinates 24.3885,87.2525!');
    } else {
      console.log('❌ Failure: Google maps route link with correct coordinates is missing.');
    }

    // 9. Database Cleanup (Restore original state)
    console.log('\n➡️ Step 9: Cleaning up test data from MongoDB database...');
    const cleanupTempleData = {
      ...templeBaseData,
      temporaryCamps: originalCamps
    };
    const cleanupRes = await fetch(`${BACKEND_URL}/temple-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(cleanupTempleData)
    });
    if (!cleanupRes.ok) {
      console.log('⚠️ Cleanup save failed!');
    } else {
      console.log('✅ Database cleaned up and restored perfectly!');
    }

    if (containsCampName && containsGoogleMapLink) {
      console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! The Temporary Camps feature is 100% correct.');
    } else {
      throw new Error('Integration verification checks failed.');
    }

  } catch (error) {
    console.error('\n🚨 Verification Error:', error.message);
    process.exit(1);
  }
}

runTest();
