async function runTest() {
  const BACKEND_URL = 'http://localhost:5000/api';
  console.log('🏁 Starting integration verification tests for Temporary Parking Camps...');

  try {
    // 1. Devotee Registration
    const randomEmail = `devotee_parking_${Math.floor(Math.random() * 100000)}@gmail.com`;
    console.log(`\n➡️ Step 1: Registering a test devotee (${randomEmail})...`);
    const regRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'पार्किंग परीक्षक',
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
      body: JSON.stringify({ title: 'पार्किंग शिविर सत्यापन सत्र' })
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
    const templeBaseData = templeGetData;
    console.log(`✅ Current temple data fetched: "${templeBaseData.name}"`);

    // Save original camps to restore later
    const originalCamps = templeBaseData.temporaryCamps || [];

    // 6. Add a Temporary Parking Camp
    console.log('\n➡️ Step 6: Injecting a temporary Parking Spot under the parking category via Admin API...');
    const testParkingCamp = {
      name: "मुख्य मेला गेट 1 पार्किंग व बस स्टैंड (Main Mela Parking Gate 1)",
      category: "parking",
      lat: 24.3872,
      lng: 87.2539,
      description: "श्रद्धालुओं के दोपहिया व चारपहिया वाहनों के लिए विशाल सुरक्षित पार्किंग स्थल एवं सीसीटीवी निगरानी।"
    };

    const updatedTempleData = {
      ...templeBaseData,
      temporaryCamps: [
        ...originalCamps,
        testParkingCamp
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
    console.log('✅ Temporary Parking Camp injected successfully to MongoDB!');

    // 6.5. Devotee Queries general Camps (to verify guided choice shows Parking option)
    console.log('\n➡️ Step 6.5: Querying Chatbot generally for active camps (should return Category Guided Menu containing option 7)...');
    const generalRes = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${devoteeToken}`
      },
      body: JSON.stringify({
        message: "सक्रिय अस्थायी शिविर ⛺",
        sessionId: sessionId
      })
    });
    const generalData = await generalRes.json();
    if (!generalRes.ok) throw new Error(`General camps query failed: ${JSON.stringify(generalData)}`);
    console.log('\n--- PUJARI JI GENERAL CAMPS RESPONSE ---');
    console.log(generalData.reply);
    console.log('-----------------------------------------\n');
    
    const containsParkingOption = generalData.reply.includes("अस्थायी पार्किंग स्थल / वाहन स्टैंड") || generalData.reply.includes("🅿️");
    if (containsParkingOption) {
      console.log('✅ Success: Pujari Ji returned the guided category selection menu containing Parking option successfully!');
    } else {
      throw new Error('Failure: Pujari Ji did not include Parking option in guided menu.');
    }

    // 7. Devotee Queries Chatbot with Geolocation Fallback for Parking Camps
    console.log('\n➡️ Step 7: Chatting with Pujari Ji about nearby parking locations with devotee live GPS coordinates...');
    
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
        message: "गाड़ी कहाँ खड़ी करें? पार्किंग की जगह बताओ",
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
    console.log('---------------------------');

    // 8. Verify Pujari Ji Response for Parking details
    console.log('\n➡️ Step 8: Verifying Pujari Ji response correctness...');
    const containsCampName = botReply.includes("मुख्य मेला गेट 1 पार्किंग") || botReply.includes("Main Mela Parking");
    const containsGoogleMapLink = botReply.includes("24.3872,87.2539") || botReply.includes("destination=24.3872,87.2539") || botReply.includes("query=24.3872,87.2539");
    const containsParkingEmoji = botReply.includes("🅿️") || botReply.includes("पार्किंग");
    
    if (containsCampName) {
      console.log('✅ Success: Pujari Ji recognized and described the temporary parking camp!');
    } else {
      console.log('❌ Failure: Pujari Ji did not mention the temporary parking camp.');
    }

    if (containsGoogleMapLink) {
      console.log('✅ Success: Navigation link accurately points to GPS coordinates 24.3872,87.2539!');
    } else {
      console.log('❌ Failure: Google maps route link with correct coordinates is missing.');
    }

    if (containsParkingEmoji) {
      console.log('✅ Success: Response contains parking indicator or emoji!');
    } else {
      console.log('❌ Failure: Response lacks parking keywords or emoji.');
    }

    // 9. Database Cleanup (Restore original state)
    console.log('\n➡️ Step 9: Cleaning up test data from MongoDB database...');
    const latestRes = await fetch(`${BACKEND_URL}/temple-data`);
    const latestData = await latestRes.json();

    const cleanupTempleData = {
      ...latestData,
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
    const cleanupData = await cleanupRes.json();
    if (!cleanupRes.ok) {
      console.log('⚠️ Cleanup save failed! Error details:', JSON.stringify(cleanupData));
    } else {
      console.log('✅ Database cleaned up and restored perfectly!');
    }

    if (containsCampName && containsGoogleMapLink && containsParkingEmoji) {
      console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! The Temporary Parking feature is 100% correct.');
    } else {
      throw new Error('Integration verification checks failed.');
    }

  } catch (error) {
    console.error('\n🚨 Verification Error:', error.message);
    process.exit(1);
  }
}

runTest();
