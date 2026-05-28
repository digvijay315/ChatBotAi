import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { t } from '../utils/translations';
import api from '../utils/api';
import OLC from 'open-location-code';
import Swal from 'sweetalert2';

export default function AdminPanel({ 
  templeData, 
  onDataUpdate, 
  isDarkMode, 
  language, 
  adminToken 
}) {
  // Form states initialized with empty fields to prevent crash, then synced via useEffect
  const [formData, setFormData] = useState({
    name: '',
    deity: '',
    location: '',
    history: '',
    timings: [],
    rules: [],
    festivals: [],
    donations: '',
    contact: '',
    customSections: [],
    temporaryCamps: [],
    helplines: [],
    disabledAssistance: {
      wheelchairsAvailable: '',
      eRickshawRoutes: '',
      specialEntryGates: '',
      helplineNumber: ''
    },
    crowdStatus: {
      status: 'normal',
      waitTime: '30 मिनट',
      description: 'कतार सामान्य है, दर्शन आसानी से हो रहे हैं।',
      descriptionEn: 'Queue is normal, darshan is smooth.'
    }
  });
  
  const [newTiming, setNewTiming] = useState({ name: '', time: '' });
  const [newRule, setNewRule] = useState('');
  const [newFestival, setNewFestival] = useState({ name: '', date: '', description: '' });
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [newCamp, setNewCamp] = useState({ name: '', category: 'stay', lat: '', lng: '', description: '' });
  const [newHelpline, setNewHelpline] = useState({ name: '', number: '', description: '' });
  const [plusCodeInput, setPlusCodeInput] = useState('');
  
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Sync formData whenever templeData is successfully loaded from the server
  useEffect(() => {
    if (templeData) {
      setFormData({
        ...templeData,
        customSections: templeData.customSections || [],
        temporaryCamps: templeData.temporaryCamps || [],
        helplines: templeData.helplines || [],
        disabledAssistance: templeData.disabledAssistance || {
          wheelchairsAvailable: '',
          eRickshawRoutes: '',
          specialEntryGates: '',
          helplineNumber: ''
        },
        crowdStatus: templeData.crowdStatus || {
          status: 'normal',
          waitTime: '30 मिनट',
          description: 'कतार सामान्य है, दर्शन आसानी से हो रहे हैं।',
          descriptionEn: 'Queue is normal, darshan is smooth.'
        }
      });
    }
  }, [templeData]);

  const getSwalOptions = (title, text, icon) => ({
    title,
    text,
    icon,
    background: isDarkMode ? '#1c1917' : '#ffffff',
    color: isDarkMode ? '#f5f5f4' : '#1c1917',
    buttonsStyling: false,
    customClass: {
      popup: 'rounded-[24px] border border-orange-100/50 dark:border-stone-850 shadow-lg font-sans text-xs',
      title: 'font-spiritual font-extrabold text-base text-saffron-500',
      htmlContainer: 'font-semibold text-xs',
      confirmButton: 'rounded-xl px-5 py-2.5 font-bold text-xs shadow-md transition-all active:scale-95 text-white bg-saffron-500 hover:bg-saffron-600 mr-2 ml-2',
      cancelButton: 'rounded-xl px-5 py-2.5 font-bold text-xs shadow-md transition-all active:scale-95 text-stone-700 dark:text-stone-300 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 mr-2 ml-2'
    }
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 4000);
  };

  // Base input change handler
  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Timings list helpers
  const addTiming = () => {
    if (!newTiming.name || !newTiming.time) return;
    setFormData(prev => ({
      ...prev,
      timings: [...prev.timings, newTiming]
    }));
    setNewTiming({ name: '', time: '' });
  };

  const removeTiming = (index) => {
    setFormData(prev => ({
      ...prev,
      timings: prev.timings.filter((_, i) => i !== index)
    }));
  };

  // Rules list helpers
  const addRule = () => {
    if (!newRule) return;
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
    setNewRule('');
  };

  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  // Festivals list helpers
  const addFestival = () => {
    if (!newFestival.name || !newFestival.date || !newFestival.description) return;
    setFormData(prev => ({
      ...prev,
      festivals: [...prev.festivals, newFestival]
    }));
    setNewFestival({ name: '', date: '', description: '' });
  };

  const removeFestival = (index) => {
    setFormData(prev => ({
      ...prev,
      festivals: prev.festivals.filter((_, i) => i !== index)
    }));
  };

  // Custom sections list helpers
  const addCustomSection = () => {
    if (!newSectionTitle.trim() || !newSectionContent.trim()) return;
    setFormData(prev => ({
      ...prev,
      customSections: [
        ...(prev.customSections || []),
        { title: newSectionTitle.trim(), content: newSectionContent.trim() }
      ]
    }));
    setNewSectionTitle('');
    setNewSectionContent('');
  };

  const removeCustomSection = (index) => {
    setFormData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).filter((_, i) => i !== index)
    }));
  };

  const addTemporaryCamp = () => {
    if (!newCamp.name.trim() || !newCamp.category || !newCamp.lat || !newCamp.lng) {
      const alertMsg = language === 'hi'
        ? 'कृपया शिविर का नाम, श्रेणी, अक्षांश (Lat) और देशांतर (Lng) दर्ज करें।'
        : 'Please enter Camp Name, Category, Latitude, and Longitude.';
      Swal.fire(getSwalOptions(
        language === 'hi' ? 'जानकारी अधूरी ⚠️' : 'Fields Incomplete ⚠️',
        alertMsg,
        'warning'
      ));
      return;
    }

    const latNum = parseFloat(newCamp.lat);
    const lngNum = parseFloat(newCamp.lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      const errLocMsg = language === 'hi'
        ? 'अक्षांश (Lat) और देशांतर (Lng) संख्यात्मक होना चाहिए।'
        : 'Latitude and Longitude must be numerical.';
      Swal.fire(getSwalOptions(
        language === 'hi' ? 'अमान्य कोऑर्डिनेट्स ❌' : 'Invalid Coordinates ❌',
        errLocMsg,
        'error'
      ));
      return;
    }

    setFormData(prev => ({
      ...prev,
      temporaryCamps: [
        ...(prev.temporaryCamps || []),
        {
          name: newCamp.name.trim(),
          category: newCamp.category,
          lat: latNum,
          lng: lngNum,
          description: newCamp.description.trim()
        }
      ]
    }));

    setNewCamp({
      name: '',
      category: 'stay',
      lat: '',
      lng: '',
      description: ''
    });

    Swal.fire(getSwalOptions(
      language === 'hi' ? 'शिविर जोड़ा गया 🎉' : 'Camp Added 🎉',
      language === 'hi' ? 'अस्थायी शिविर सूची में सफलतापूर्वक शामिल कर लिया गया है।' : 'Temporary camp successfully added to the list.',
      'success'
    ));
  };

  const removeTemporaryCamp = (index) => {
    setFormData(prev => ({
      ...prev,
      temporaryCamps: (prev.temporaryCamps || []).filter((_, i) => i !== index)
    }));
  };

  const handleDecodePlusCode = () => {
    const rawInput = plusCodeInput.trim();
    if (!rawInput) {
      Swal.fire(getSwalOptions(
        language === 'hi' ? 'इनपुट गायब' : 'Missing Input',
        language === 'hi' ? 'कृपया पहले प्लस कोड दर्ज करें।' : 'Please enter a Plus Code first.',
        'warning'
      ));
      return;
    }

    try {
      const OpenLocationCode = OLC.OpenLocationCode || OLC;
      const olc = new OpenLocationCode();

      // Split by whitespace to find the token containing '+'
      const tokens = rawInput.split(/\s+/);
      const codeToken = tokens.find(t => t.includes('+'));

      if (!codeToken) {
        Swal.fire(getSwalOptions(
          language === 'hi' ? 'प्लस कोड नहीं मिला' : 'No Plus Code Found',
          language === 'hi'
            ? 'कृपया प्लस कोड दर्ज करें जिसमें "+" शामिल हो (जैसे: 7764+C2W Dumka, Jharkhand)।'
            : 'Please make sure it includes the "+" character (e.g. 7764+C2W Dumka, Jharkhand).',
          'warning'
        ));
        return;
      }

      // Clean the token to get only alphanumeric characters and '+'
      const cleanCode = codeToken.replace(/[^A-Za-z0-9+]/g, '').toUpperCase();

      if (!olc.isValid(cleanCode)) {
        Swal.fire(getSwalOptions(
          language === 'hi' ? 'अवैध प्लस कोड' : 'Invalid Plus Code',
          language === 'hi' 
            ? 'अवैध प्लस कोड! कृपया सही फॉर्मेट दर्ज करें (जैसे: 8G4P3CRM+E3 या 3CRM+E3)।' 
            : 'Invalid Plus Code format! Please enter a valid code (e.g. 8G4P3CRM+E3 or 3CRM+E3).',
          'error'
        ));
        return;
      }

      // Show loader while decoding (simulate instant feedback)
      Swal.fire({
        title: language === 'hi' ? 'प्लस कोड डिकोड हो रहा है...' : 'Decoding Plus Code...',
        background: isDarkMode ? '#1c1917' : '#ffffff',
        color: isDarkMode ? '#f5f5f4' : '#1c1917',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      let fullCode = cleanCode;
      // If it is a short code, recover using Baba Basukinath Temple as reference (24.3850, 87.2514)
      if (olc.isShort(cleanCode)) {
        const refLat = 24.3850;
        const refLng = 87.2514;
        fullCode = olc.recoverNearest(cleanCode, refLat, refLng);
      }

      const decoded = olc.decode(fullCode);
      const latVal = decoded.latitudeCenter.toFixed(6);
      const lngVal = decoded.longitudeCenter.toFixed(6);

      setNewCamp(prev => ({
        ...prev,
        lat: latVal,
        lng: lngVal
      }));

      setPlusCodeInput('');
      Swal.close();

      const successHtml = `
        <div class="text-left space-y-2.5 leading-relaxed font-semibold">
          <p class="text-stone-600 dark:text-stone-400">प्लस कोड सफलतापूर्वक डिकोड हुआ और फ़ील्ड्स में भर दिया गया है!</p>
          <div class="p-3 rounded-xl bg-orange-50/50 dark:bg-stone-900 border border-orange-100/50 dark:border-stone-800 text-[11px] font-mono">
            📍 <b>Latitude</b>: <span class="text-saffron-600 font-bold">${latVal}</span><br/>
            📍 <b>Longitude</b>: <span class="text-saffron-600 font-bold">${lngVal}</span>
          </div>
        </div>
      `;

      Swal.fire({
        ...getSwalOptions(
          language === 'hi' ? 'डिकोड सफल ⚡' : 'Decoded Successfully ⚡',
          '',
          'success'
        ),
        html: successHtml
      });
    } catch (err) {
      Swal.close();
      Swal.fire(getSwalOptions(
        language === 'hi' ? 'डिकोडिंग में त्रुटि' : 'Decoding Error',
        err.message,
        'error'
      ));
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire(getSwalOptions(
        language === 'hi' ? 'त्रुटि ⚠️' : 'Error ⚠️',
        language === 'hi' ? 'आपके ब्राउज़र में जियोलोकेशन (Geolocation) सपोर्ट नहीं है।' : 'Geolocation is not supported by your browser.',
        'error'
      ));
      return;
    }

    Swal.fire({
      ...getSwalOptions(
        language === 'hi' ? 'लोकेशन एक्सेस' : 'Location Access',
        language === 'hi' ? 'क्या आप ब्राउज़र से अपनी वर्तमान GPS लोकेशन प्राप्त करना चाहते हैं?' : 'Do you want to retrieve your current GPS location from the browser?',
        'question'
      ),
      showCancelButton: true,
      confirmButtonText: language === 'hi' ? 'हाँ, प्राप्त करें' : 'Yes, retrieve',
      cancelButtonText: language === 'hi' ? 'रद्द करें' : 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Show an animated premium loading spinner!
        Swal.fire({
          title: language === 'hi' ? 'GPS लोकेशन प्राप्त हो रही है...' : 'Retrieving GPS Location...',
          html: language === 'hi' ? '<b>कृपया प्रतीक्षा करें...</b><br/>हम आपकी सटीक लाइव लोकेशन और पता ढूंढ रहे हैं।' : '<b>Please wait...</b><br/>Searching for your precise live location and address.',
          background: isDarkMode ? '#1c1917' : '#ffffff',
          color: isDarkMode ? '#f5f5f4' : '#1c1917',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const latVal = position.coords.latitude.toFixed(6);
            const lngVal = position.coords.longitude.toFixed(6);

            // Auto-fill coordinates instantly
            setNewCamp(prev => ({
              ...prev,
              lat: latVal,
              lng: lngVal
            }));

            let addressName = '';
            try {
              // Fetch address using OpenStreetMap Nominatim Free Reverse Geocoding API!
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latVal}&lon=${lngVal}&accept-language=${language === 'hi' ? 'hi,en' : 'en'}`);
              if (res.ok) {
                const geoData = await res.json();
                addressName = geoData.display_name || '';
              }
            } catch (err) {
              console.warn('Reverse geocoding failed:', err);
            }

            // Close the loader
            Swal.close();

            let successHtml = '';
            if (language === 'hi') {
              successHtml = `
                <div class="text-left space-y-2.5 leading-relaxed font-semibold">
                  <p class="text-stone-600 dark:text-stone-400">सफलतापूर्वक आपकी लाइव लोकेशन प्राप्त हुई!</p>
                  <div class="p-3 rounded-xl bg-orange-50/50 dark:bg-stone-900 border border-orange-100/50 dark:border-stone-800 text-[11px] font-mono">
                    📍 <b>Latitude</b>: <span class="text-saffron-600 font-bold">${latVal}</span><br/>
                    📍 <b>Longitude</b>: <span class="text-saffron-600 font-bold">${lngVal}</span>
                  </div>
                  ${addressName ? `
                    <p class="text-stone-500 dark:text-stone-400 text-[11px] mt-2">
                      🏠 <b>जगह का पता (Address):</b><br/>
                      <span class="text-stone-700 dark:text-stone-300 font-bold">${addressName}</span>
                    </p>
                  ` : `
                    <p class="text-red-500 text-[10px] mt-2">⚠️ (पता खोजने में असमर्थ, लेकिन GPS कोऑर्डिनेट्स कैप्चर कर लिए गए हैं)</p>
                  `}
                </div>
              `;
            } else {
              successHtml = `
                <div class="text-left space-y-2.5 leading-relaxed font-semibold">
                  <p class="text-stone-600 dark:text-stone-400">Live location retrieved successfully!</p>
                  <div class="p-3 rounded-xl bg-orange-50/50 dark:bg-stone-900 border border-orange-100/50 dark:border-stone-800 text-[11px] font-mono">
                    📍 <b>Latitude</b>: <span class="text-saffron-600 font-bold">${latVal}</span><br/>
                    📍 <b>Longitude</b>: <span class="text-saffron-600 font-bold">${lngVal}</span>
                  </div>
                  ${addressName ? `
                    <p class="text-stone-500 dark:text-stone-400 text-[11px] mt-2">
                      🏠 <b>Address:</b><br/>
                      <span class="text-stone-700 dark:text-stone-300 font-bold">${addressName}</span>
                    </p>
                  ` : `
                    <p class="text-red-500 text-[10px] mt-2">⚠️ (Unable to fetch address string, but GPS coordinates are captured)</p>
                  `}
                </div>
              `;
            }

            Swal.fire({
              ...getSwalOptions(
                language === 'hi' ? 'सफलता 📍' : 'Success 📍',
                '',
                'success'
              ),
              html: successHtml
            });
          },
          (error) => {
            Swal.close();
            let errDetail = error.message;
            if (error.code === 1) {
              errDetail = language === 'hi' 
                ? 'लोकेशन एक्सेस ब्लॉक किया गया है। कृपया ब्राउज़र सेटिंग्स में लोकेशन परमिशन दें।' 
                : 'Permission denied. Please allow location access in your browser settings.';
            }
            Swal.fire(getSwalOptions(
              language === 'hi' ? 'लोकेशन प्राप्त करने में त्रुटि' : 'Error Getting Location',
              errDetail,
              'error'
            ));
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      }
    });
  };

  // Helpline list helpers
  const addHelpline = () => {
    if (!newHelpline.name.trim() || !newHelpline.number.trim()) {
      showNotification('error', language === 'hi' ? 'नाम और नंबर दोनों अनिवार्य हैं!' : 'Both Name and Number are required!');
      return;
    }
    setFormData(prev => ({
      ...prev,
      helplines: [...(prev.helplines || []), newHelpline]
    }));
    setNewHelpline({ name: '', number: '', description: '' });
    showNotification('success', language === 'hi' ? 'हेल्पलाइन जोड़ दी गई है!' : 'Helpline contact added!');
  };

  const removeHelpline = (index) => {
    setFormData(prev => ({
      ...prev,
      helplines: (prev.helplines || []).filter((_, i) => i !== index)
    }));
    showNotification('success', language === 'hi' ? 'हेल्पलाइन हटा दी गई है!' : 'Helpline contact removed!');
  };

  // Save changes to Backend MongoDB
  const handleSave = async () => {
    setIsLoading(true);
    // Show spinner loader!
    Swal.fire({
      title: language === 'hi' ? 'सुरक्षित हो रहा है...' : 'Saving Data...',
      html: language === 'hi' ? '<b>कृपया प्रतीक्षा करें...</b><br/>डेटाबेस (MongoDB) में परिवर्तन सहेजे जा रहे हैं।' : '<b>Please wait...</b><br/>Saving changes to database (MongoDB).',
      background: isDarkMode ? '#1c1917' : '#ffffff',
      color: isDarkMode ? '#f5f5f4' : '#1c1917',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await api.post('/temple-data', formData);
      const resData = response.data;

      Swal.close();

      const successMsg = language === 'hi'
        ? 'डेटा सफलतापूर्वक डेटाबेस (MongoDB) में सुरक्षित कर दिया गया है!'
        : 'Temple information saved successfully to database (MongoDB)!';
        
      Swal.fire(getSwalOptions(
        language === 'hi' ? 'सफल 🕉️' : 'Success 🕉️',
        successMsg,
        'success'
      ));
      
      onDataUpdate(resData.data);
    } catch (err) {
      Swal.close();
      const errMsg = err.response?.data?.error || err.message;
      Swal.fire(getSwalOptions(
        language === 'hi' ? 'बचाव विफल' : 'Save Failed',
        errMsg,
        'error'
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to default seed template
  const handleResetToDefault = () => {
    const confirmMsg = language === 'hi'
      ? 'क्या आप सचमुच मंदिर के डेटा को बाबा बासुकीनाथ धाम मंदिर डिफ़ॉल्ट डेटा में रीसेट करना चाहते हैं?'
      : 'Are you sure you want to reset the temple details to Baba Basukinath Dham defaults?';
      
    Swal.fire({
      ...getSwalOptions(
        language === 'hi' ? 'डेटा रीसेट' : 'Reset Data',
        confirmMsg,
        'warning'
      ),
      showCancelButton: true,
      confirmButtonText: language === 'hi' ? 'हाँ, रीसेट करें' : 'Yes, reset',
      cancelButtonText: language === 'hi' ? 'रद्द करें' : 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loader while resetting
        Swal.fire({
          title: language === 'hi' ? 'रीसेट हो रहा है...' : 'Resetting...',
          background: isDarkMode ? '#1c1917' : '#ffffff',
          color: isDarkMode ? '#f5f5f4' : '#1c1917',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

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
              content: "बाबा बासुकीनाथ मंदिर में श्रद्धालुओं के लिए विभिन्न ऑनलाइन व offline सेवाएं उपलब्ध हैं:\n- **शीघ्र दर्शन (Shighra Darshan)**: लंबी कतारों से बचने के लिए उपलब्ध विशेष प्रवेश व्यवस्था।\n- **शृंगारी पूजा (Sringari)**: बाबा भोलेनाथ का गंगाजल, फूलों और उत्तम सामग्रियों से किया जाने वाला विशेष पूजन। (प्रतिदिन केवल 22 स्लॉट उपलब्ध हैं)\n- **अन्य पूजा अनुष्ठान**: मनकामना पूजा, वंश पूजा, ध्वजारोहण, रुद्राभिषेक, चौपहरा, उपनयन संस्कार, मुंडन, और विवाह संस्कार आदि मंदिर परिसर के विभिन्न मंडपों में पुरोहितों द्वारा विधि-विधान से संपन्न कराते हैं।"
            },
            {
              title: "श्रावणी मेला व सुविधाएं (Shrawani Mela Camps)",
              content: "श्रावण मास (जुलाई-अगस्त) के दौरान सुल्तानगंज से पवित्र गंगाजल लेकर पैदल यात्रा करने वाले लाखों 'काँवरियों' के लिए दुमका जिला प्रशासन द्वारा विशेष प्रबंध किए जाते हैं:\n- **आवास व्यवस्था (Accommodation)**: श्रद्धालुओं के आराम के लिए मार्ग में सुरक्षित एवं निशुल्क विश्राम शिविर (Camps) स्थापित किए जाते हैं.\n- **चिकित्सा शिविर (Medical Camps)**: संपूर्ण काँवरिया पथ पर प्राथमिक और आपातकालीन चिकित्सा सहायता प्रदान करने के लिए मेडिकल टीमें तैनात रहती हैं.\n- **परिवहन (Transportation)**: भक्तों की सुगम आवाजाही के लिए मंदिर परिसर और दुमका/देवघर रेलवे स्टेशनों व बस स्टैंडों के बीच अतिरिक्त बसों व वाहनों की व्यवस्था की जाती है।"
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
          },
          crowdStatus: {
            status: 'normal',
            waitTime: '30 मिनट',
            description: 'कतार सामान्य है, दर्शन आसानी से हो रहे हैं।',
            descriptionEn: 'Queue is normal, darshan is smooth.'
          }
        };
        
        setFormData(defaultTempleData);
        Swal.close();
        
        const notificationMsg = language === 'hi'
          ? 'डिफ़ॉल्ट डेटा लोड हो गया है। कृपया लागू करने के लिए "डेटा सेव करें" दबाएं।'
          : 'Default data loaded. Please click "Save Data" to commit changes.';
        showNotification('success', notificationMsg);
      }
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-10">
      {/* Header Panel */}
      <div className={`p-6 rounded-[24px] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
        isDarkMode ? 'glass-card-dark text-white' : 'glass-card text-stone-800'
      }`}>
        <div>
          <h2 className="text-xl font-extrabold font-spiritual text-saffron-500 flex items-center gap-2">
            <span>{t('adminWelcome', language)}</span>
            <span className="text-[10px] px-2.5 py-1 bg-green-150 text-green-700 dark:bg-green-950/30 dark:text-green-400 rounded-full border border-green-200 dark:border-green-900/20 font-bold font-sans">
              {language === 'hi' ? 'संपादक मोड एक्टिव' : 'Editor Mode Active'}
            </span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-semibold leading-relaxed">
            {t('adminWelcomeSubtitle', language)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="reset-default-btn"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-4 py-2.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-bold transition-all active:scale-95"
            title="Reset to default context data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('adminResetBtn', language)}</span>
          </button>
          
          <button
            id="save-changes-btn"
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-saffron-500 to-amber-600 hover:from-saffron-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isLoading ? t('adminSaving', language) : t('adminSaveBtn', language)}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification.message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm animate-slideDown ${
          notification.type === 'success'
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 animate-bounce" />
          )}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Forms Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Basic Information */}
        <div className={`p-6 rounded-[28px] shadow-sm border space-y-4 ${
          isDarkMode ? 'glass-card-dark text-white' : 'glass-card text-stone-800'
        }`}>
          <h3 className="text-base font-extrabold font-spiritual border-b border-stone-200 dark:border-stone-850 pb-2 text-saffron-500">
            {t('adminSec1', language)}
          </h3>
          
          <div>
            <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="temple-name-input">
              {t('adminTempleName', language)}
            </label>
            <input
              id="temple-name-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleBaseChange}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors ${
                isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="deity-name-input">
              {t('adminDeity', language)}
            </label>
            <input
              id="deity-name-input"
              type="text"
              name="deity"
              value={formData.deity}
              onChange={handleBaseChange}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors ${
                isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="location-input">
              {t('adminLocation', language)}
            </label>
            <input
              id="location-input"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleBaseChange}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors ${
                isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="history-textarea">
              {t('adminHistory', language)}
            </label>
            <textarea
              id="history-textarea"
              name="history"
              value={formData.history}
              onChange={handleBaseChange}
              rows={4}
              className={`w-full px-3 py-2.5 rounded-xl border focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors text-xs font-semibold leading-relaxed ${
                isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
              }`}
            />
          </div>
        </div>

        {/* Section 2: Timings & Aarti */}
        <div className={`p-6 rounded-[28px] shadow-sm border space-y-4 ${
          isDarkMode ? 'glass-card-dark text-white' : 'glass-card text-stone-800'
        }`}>
          <h3 className="text-base font-extrabold font-spiritual border-b border-stone-200 dark:border-stone-850 pb-2 text-saffron-500 flex items-center justify-between">
            <span>{t('adminSec2', language)}</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-extrabold font-sans">
              {language === 'hi' ? `कुल: ${formData.timings.length}` : `Total: ${formData.timings.length}`}
            </span>
          </h3>

          {/* Current Timings list */}
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-dashed border-stone-200 dark:border-stone-800 p-2 rounded-2xl">
            {formData.timings.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4">{t('adminNoTimings', language)}</p>
            ) : (
              formData.timings.map((tItem, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-orange-50/50 dark:bg-stone-900 border border-orange-100/50 dark:border-stone-800 text-xs">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">{tItem.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-saffron-600 dark:text-saffron-400 font-bold">{tItem.time}</span>
                    <button
                      onClick={() => removeTiming(idx)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors"
                      title="Remove timing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add new timing */}
          <div className="p-3.5 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-100 dark:border-stone-800/80 space-y-2">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {t('adminAddTimingLabel', language)}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newTiming.name}
                onChange={(e) => setNewTiming(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('adminAddTimingNamePlaceholder', language)}
                className={`px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200'
                }`}
              />
              <input
                type="text"
                value={newTiming.time}
                onChange={(e) => setNewTiming(prev => ({ ...prev, time: e.target.value }))}
                placeholder={t('adminAddTimingTimePlaceholder', language)}
                className={`px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200'
                }`}
              />
            </div>
            <button
              onClick={addTiming}
              className="w-full py-2 bg-orange-100 hover:bg-orange-200 dark:bg-saffron-950/30 dark:hover:bg-saffron-900/30 text-saffron-600 dark:text-saffron-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t('adminAddToListBtn', language)}</span>
            </button>
          </div>
        </div>

        {/* Section 3: Rules & Dress Code */}
        <div className={`p-6 rounded-[28px] shadow-sm border space-y-4 ${
          isDarkMode ? 'glass-card-dark text-white' : 'glass-card text-stone-800'
        }`}>
          <h3 className="text-base font-extrabold font-spiritual border-b border-stone-200 dark:border-stone-850 pb-2 text-saffron-500 flex items-center justify-between">
            <span>{t('adminSec3', language)}</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-extrabold font-sans">
              {language === 'hi' ? `कुल: ${formData.rules.length}` : `Total: ${formData.rules.length}`}
            </span>
          </h3>

          {/* Current Rules list */}
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-dashed border-stone-200 dark:border-stone-800 p-2 rounded-2xl">
            {formData.rules.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4">{t('adminNoRules', language)}</p>
            ) : (
              formData.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start justify-between gap-2 p-2 rounded-xl bg-orange-50/50 dark:bg-stone-900 border border-orange-100/50 dark:border-stone-800 text-xs">
                  <span className="text-stone-700 dark:text-stone-300 font-semibold leading-relaxed flex-1">
                    {idx + 1}. {rule}
                  </span>
                  <button
                    onClick={() => removeRule(idx)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors shrink-0"
                    title="Remove rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add new Rule */}
          <div className="p-3.5 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-100 dark:border-stone-800/80 space-y-2">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {t('adminAddRuleLabel', language)}
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder={t('adminAddRulePlaceholder', language)}
                className={`flex-1 px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200'
                }`}
              />
              <button
                onClick={addRule}
                className="px-3.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg flex items-center justify-center transition-colors"
                title="Add rule"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Festivals & Events */}
        <div className={`p-6 rounded-[28px] shadow-sm border space-y-4 ${
          isDarkMode ? 'glass-card-dark text-white' : 'glass-card text-stone-800'
        }`}>
          <h3 className="text-base font-extrabold font-spiritual border-b border-stone-200 dark:border-stone-850 pb-2 text-saffron-500 flex items-center justify-between">
            <span>{t('adminSec4', language)}</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-extrabold font-sans">
              {language === 'hi' ? `कुल: ${formData.festivals.length}` : `Total: ${formData.festivals.length}`}
            </span>
          </h3>

          {/* Current Festivals list */}
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-dashed border-stone-200 dark:border-stone-800 p-2 rounded-2xl">
            {formData.festivals.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4">{t('adminNoFestivals', language)}</p>
            ) : (
              formData.festivals.map((f, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-orange-50/50 dark:bg-stone-900 border border-orange-100/50 dark:border-stone-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-700 dark:text-stone-300">{f.name}</span>
                    <div className="flex items-center gap-1.5 animate-pulse">
                      <span className="text-saffron-600 dark:text-saffron-400 font-bold">{f.date}</span>
                      <button
                        onClick={() => removeFestival(idx)}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors"
                        title="Remove festival"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 text-[10px] leading-relaxed font-semibold">{f.description}</p>
                </div>
              ))
            )}
          </div>

          {/* Add new Festival */}
          <div className="p-3.5 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-100 dark:border-stone-800/80 space-y-2">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {t('adminAddFestivalLabel', language)}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newFestival.name}
                onChange={(e) => setNewFestival(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('adminAddFestivalName', language)}
                className={`px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200'
                }`}
              />
              <input
                type="text"
                value={newFestival.date}
                onChange={(e) => setNewFestival(prev => ({ ...prev, date: e.target.value }))}
                placeholder={t('adminAddFestivalDate', language)}
                className={`px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200'
                }`}
              />
            </div>
            <input
              type="text"
              value={newFestival.description}
              onChange={(e) => setNewFestival(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('adminAddFestivalDesc', language)}
              className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200'
              }`}
            />
            <button
              onClick={addFestival}
              className="w-full py-2 bg-orange-100 hover:bg-orange-200 dark:bg-saffron-950/30 dark:hover:bg-saffron-900/30 text-saffron-600 dark:text-saffron-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t('adminAddFestivalBtn', language)}</span>
            </button>
          </div>
        </div>

        {/* Section 5: Donations & Bank Details */}
        <div className={`p-6 rounded-[28px] shadow-sm border space-y-4 md:col-span-2 ${
          isDarkMode ? 'glass-card-dark text-white' : 'glass-card text-stone-800'
        }`}>
          <h3 className="text-base font-extrabold font-spiritual border-b border-stone-200 dark:border-stone-850 pb-2 text-saffron-500">
            {t('adminSec5', language)}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="donations-textarea">
                {t('adminDonationLabel', language)}
              </label>
              <textarea
                id="donations-textarea"
                name="donations"
                value={formData.donations}
                onChange={handleBaseChange}
                rows={5}
                className={`w-full px-3 py-2.5 rounded-xl border focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors text-xs font-mono font-bold leading-relaxed ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                }`}
                placeholder="उदा: बैंक का नाम, खाता संख्या, IFSC कोड और UPI ID आदि दर्ज करें।"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="contact-textarea">
                {t('adminContactLabel', language)}
              </label>
              <textarea
                id="contact-textarea"
                name="contact"
                value={formData.contact}
                onChange={handleBaseChange}
                rows={5}
                className={`w-full px-3 py-2.5 rounded-xl border focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors text-xs font-semibold leading-relaxed ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                }`}
                placeholder="उदा: फ़ोन नंबर, ईमेल आईडी, और पता दर्ज करें।"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Custom Dynamic Sections */}
        <div className={`p-6 rounded-[28px] shadow-sm border space-y-4 md:col-span-2 ${
          isDarkMode ? 'glass-card-dark text-white' : 'glass-card text-stone-800'
        }`}>
          <h3 className="text-base font-extrabold font-spiritual border-b border-stone-200 dark:border-stone-850 pb-2 text-saffron-500 flex items-center justify-between">
            <span>{t('adminSec6', language)}</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-extrabold font-sans">
              {language === 'hi' ? `कुल: ${(formData.customSections || []).length}` : `Total: ${(formData.customSections || []).length}`}
            </span>
          </h3>

          {/* Current Custom Sections List */}
          <div className="space-y-3">
            {(!formData.customSections || formData.customSections.length === 0) ? (
              <p className="text-xs text-stone-400 text-center py-4">{t('adminNoCustomSections', language)}</p>
            ) : (
              formData.customSections.map((section, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-orange-50/50 dark:bg-stone-900 border border-orange-100/50 dark:border-stone-800 text-xs space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-700 dark:text-stone-300 text-sm">{section.title}</span>
                    <button
                      onClick={() => removeCustomSection(idx)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors"
                      title="Remove custom section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 text-xs leading-relaxed font-medium whitespace-pre-line border-t border-stone-200 dark:border-stone-800 pt-2">
                    {section.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Add New Custom Section Form */}
          <div className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-100 dark:border-stone-800/80 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {t('adminAddCustomSectionLabel', language)}
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 mb-1" htmlFor="custom-section-title">
                  {t('adminCustomSectionTitle', language)}
                </label>
                <input
                  id="custom-section-title"
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder={t('adminCustomSectionTitlePlaceholder', language)}
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                    isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 mb-1" htmlFor="custom-section-content">
                  {t('adminCustomSectionContent', language)}
                </label>
                <textarea
                  id="custom-section-content"
                  value={newSectionContent}
                  onChange={(e) => setNewSectionContent(e.target.value)}
                  placeholder={t('adminCustomSectionContentPlaceholder', language)}
                  rows={4}
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                    isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200'
                  }`}
                />
              </div>
            </div>
            <button
              onClick={addCustomSection}
              className="w-full py-2.5 bg-orange-100 hover:bg-orange-200 dark:bg-saffron-950/30 dark:hover:bg-saffron-900/30 text-saffron-600 dark:text-saffron-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t('adminAddCustomSectionBtn', language)}</span>
            </button>
          </div>
        </div>

        {/* Section 7: Temporary Camps & Shivirs */}
        <div className={`p-6 rounded-[28px] shadow-sm border space-y-4 md:col-span-2 ${
          isDarkMode ? 'glass-card-dark text-white' : 'glass-card text-stone-800'
        }`}>
          <h3 className="text-base font-extrabold font-spiritual border-b border-stone-200 dark:border-stone-850 pb-2 text-saffron-500 flex items-center justify-between">
            <span>{t('adminSec7', language)}</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-extrabold font-sans">
              {language === 'hi' ? `कुल: ${(formData.temporaryCamps || []).length}` : `Total: ${(formData.temporaryCamps || []).length}`}
            </span>
          </h3>

          {/* Current Temporary Camps List */}
          <div className="space-y-3">
            {(!formData.temporaryCamps || formData.temporaryCamps.length === 0) ? (
              <p className="text-xs text-stone-400 text-center py-4">{t('adminNoCamps', language)}</p>
            ) : (
              formData.temporaryCamps.map((camp, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-orange-50/50 dark:bg-stone-900 border border-orange-100/50 dark:border-stone-800 text-xs space-y-2 relative animate-fadeIn">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-extrabold text-stone-700 dark:text-stone-300 text-sm flex items-center gap-2">
                        {camp.name}
                        <span className="text-[10px] px-2 py-0.5 bg-saffron-100 text-saffron-800 dark:bg-saffron-950/40 dark:text-saffron-400 rounded-full font-bold uppercase">
                          {t(camp.category === 'instant_cash' ? 'adminCategoryInstantCash' : `adminCategory${camp.category.charAt(0).toUpperCase() + camp.category.slice(1)}`, language)}
                        </span>
                      </span>
                      <div className="text-[10px] text-stone-400 dark:text-stone-500 font-bold mt-1">
                        GPS: {camp.lat}, {camp.lng}
                      </div>
                    </div>
                    <button
                      onClick={() => removeTemporaryCamp(idx)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors"
                      title="Remove temporary camp"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {camp.description && (
                    <p className="text-stone-500 dark:text-stone-400 text-xs leading-relaxed font-medium whitespace-pre-line border-t border-stone-200 dark:border-stone-800 pt-2">
                      {camp.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add New Temporary Camp Form */}
          <div className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-100 dark:border-stone-800/80 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {t('adminAddCampLabel', language)}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 mb-1" htmlFor="camp-name">
                  {t('adminAddCampName', language)}
                </label>
                <input
                  id="camp-name"
                  type="text"
                  value={newCamp.name}
                  onChange={(e) => setNewCamp(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Bhandara Camp No. 1"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                    isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 mb-1" htmlFor="camp-category">
                  {t('adminAddCampCategory', language)}
                </label>
                <select
                  id="camp-category"
                  value={newCamp.category}
                  onChange={(e) => setNewCamp(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none font-bold ${
                    isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                >
                  <option value="stay">{t('adminCategoryStay', language)}</option>
                  <option value="medical">{t('adminCategoryMedical', language)}</option>
                  <option value="food">{t('adminCategoryFood', language)}</option>
                  <option value="transport">{t('adminCategoryTransport', language)}</option>
                  <option value="atm">{t('adminCategoryAtm', language)}</option>
                  <option value="instant_cash">{t('adminCategoryInstantCash', language)}</option>
                  <option value="parking">{t('adminCategoryParking', language)}</option>
                </select>
              </div>
            </div>

            {/* Plus Code to Lat/Lng Converter */}
            <div className="p-3.5 bg-orange-50/40 dark:bg-stone-900/40 rounded-xl border border-orange-100/50 dark:border-stone-800/80 space-y-2">
              <label className="block text-[10px] font-extrabold text-saffron-600 dark:text-saffron-400" htmlFor="camp-plus-code">
                {language === 'hi' 
                  ? '⚡ प्लस कोड से Lat/Lng निकालें (Plus Code Converter - Optional)' 
                  : '⚡ Get Lat/Lng from Plus Code (Optional)'}
              </label>
              <div className="flex gap-2">
                <input
                  id="camp-plus-code"
                  type="text"
                  value={plusCodeInput}
                  onChange={(e) => setPlusCodeInput(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा: 8G4P3CRM+E3 या 3CRM+E3' : 'e.g., 8G4P3CRM+E3 or 3CRM+E3'}
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none transition-all ${
                    isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleDecodePlusCode}
                  className="px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm active:scale-95 shrink-0"
                >
                  {language === 'hi' ? 'डिकोड करें' : 'Decode'}
                </button>
              </div>
              <p className="text-[9px] text-stone-400 dark:text-stone-500 leading-tight">
                {language === 'hi'
                  ? 'गूगल मैप्स से कॉपी किया गया प्लस कोड डालें और बटन पर क्लिक करें। ऐप इसे तुरंत अक्षांश और देशांतर में बदल देगा।'
                  : 'Enter a Plus Code from Google Maps and click Decode. It will automatically convert and fill in the fields below.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 mb-1" htmlFor="camp-latitude">
                  {t('adminAddCampLat', language)}
                </label>
                <input
                  id="camp-latitude"
                  type="number"
                  step="any"
                  value={newCamp.lat}
                  onChange={(e) => setNewCamp(prev => ({ ...prev, lat: e.target.value }))}
                  placeholder="e.g. 24.3885"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                    isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 mb-1" htmlFor="camp-longitude">
                  {t('adminAddCampLng', language)}
                </label>
                <input
                  id="camp-longitude"
                  type="number"
                  step="any"
                  value={newCamp.lng}
                  onChange={(e) => setNewCamp(prev => ({ ...prev, lng: e.target.value }))}
                  placeholder="e.g. 87.2525"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                    isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                />
              </div>
            </div>

            {/* Current Geolocation Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 dark:bg-stone-900 border border-blue-200 dark:border-stone-800 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold rounded-lg hover:bg-blue-100 dark:hover:bg-stone-800 transition-colors shadow-sm active:scale-95 shrink-0"
              >
                <span>📍</span>
                <span>{language === 'hi' ? 'मेरी वर्तमान लोकेशन का उपयोग करें' : 'Use My Current Location'}</span>
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 mb-1" htmlFor="camp-desc">
                {t('adminAddCampDesc', language)}
              </label>
              <textarea
                id="camp-desc"
                value={newCamp.description}
                onChange={(e) => setNewCamp(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe facilities (e.g., Free water, beds, food schedule)..."
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                }`}
              />
            </div>

            <button
              onClick={addTemporaryCamp}
              className="w-full py-2.5 bg-orange-100 hover:bg-orange-200 dark:bg-saffron-950/30 dark:hover:bg-saffron-900/30 text-saffron-600 dark:text-saffron-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t('adminAddCampBtn', language)}</span>
            </button>
          </div>
        </div>

        {/* Section 8: Emergency Helplines & Assistance */}
        <div className={`p-6 rounded-[28px] shadow-sm border space-y-4 md:col-span-2 ${
          isDarkMode ? 'glass-card-dark text-white' : 'glass-card text-stone-800'
        }`}>
          <h3 className="text-base font-extrabold font-spiritual border-b border-stone-200 dark:border-stone-850 pb-2 text-saffron-500 flex items-center justify-between">
            <span>{t('adminSec8', language)}</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-extrabold font-sans">
              {language === 'hi' ? `कुल: ${(formData.helplines || []).length}` : `Total: ${(formData.helplines || []).length}`}
            </span>
          </h3>

          {/* Current Helplines List */}
          <div className="space-y-3">
            {(!formData.helplines || formData.helplines.length === 0) ? (
              <p className="text-xs text-stone-400 text-center py-4">{t('adminNoHelplines', language)}</p>
            ) : (
              formData.helplines.map((helpline, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-orange-50/50 dark:bg-stone-900 border border-orange-100/50 dark:border-stone-800 text-xs space-y-2 relative animate-fadeIn">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-extrabold text-stone-700 dark:text-stone-300 text-sm flex items-center gap-2">
                        📞 {helpline.name}
                      </span>
                      <div className="text-xs text-saffron-600 dark:text-saffron-400 font-extrabold mt-1">
                        Number: <span className="font-mono">{helpline.number}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeHelpline(idx)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors"
                      title="Remove helpline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {helpline.description && (
                    <p className="text-stone-500 dark:text-stone-400 text-xs leading-relaxed font-medium whitespace-pre-line border-t border-stone-200 dark:border-stone-800 pt-2">
                      {helpline.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add New Helpline Form */}
          <div className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-100 dark:border-stone-800/80 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {t('adminAddHelplineLabel', language)}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 mb-1" htmlFor="helpline-name">
                  {t('adminAddHelplineName', language)}
                </label>
                <input
                  id="helpline-name"
                  type="text"
                  value={newHelpline.name}
                  onChange={(e) => setNewHelpline(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Police Station Jarmundi"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                    isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 mb-1" htmlFor="helpline-number">
                  {t('adminAddHelplineNumber', language)}
                </label>
                <input
                  id="helpline-number"
                  type="text"
                  value={newHelpline.number}
                  onChange={(e) => setNewHelpline(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="e.g. +91 94317 XXXXX"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                    isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 mb-1" htmlFor="helpline-desc">
                {t('adminAddHelplineDesc', language)}
              </label>
              <textarea
                id="helpline-desc"
                value={newHelpline.description}
                onChange={(e) => setNewHelpline(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Details of helpline or availability schedule..."
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-saffron-500 focus:outline-none ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                }`}
              />
            </div>

            <button
              onClick={addHelpline}
              className="w-full py-2.5 bg-orange-100 hover:bg-orange-200 dark:bg-saffron-950/30 dark:hover:bg-saffron-900/30 text-saffron-600 dark:text-saffron-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t('adminAddHelplineBtn', language)}</span>
            </button>
          </div>
        </div>

        {/* Section 9: Disabled & Elderly Assistance */}
        <div className={`p-6 rounded-[28px] shadow-sm border space-y-4 md:col-span-2 ${
          isDarkMode ? 'glass-card-dark text-white' : 'glass-card text-stone-800'
        }`}>
          <h3 className="text-base font-extrabold font-spiritual border-b border-stone-200 dark:border-stone-850 pb-2 text-saffron-500">
            {t('adminSec9', language)}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="wheelchairs-input">
                {t('adminWheelchairs', language)}
              </label>
              <textarea
                id="wheelchairs-input"
                value={formData.disabledAssistance?.wheelchairsAvailable || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  disabledAssistance: {
                    ...(prev.disabledAssistance || {}),
                    wheelchairsAvailable: e.target.value
                  }
                }))}
                rows={2}
                className={`w-full px-3 py-2.5 rounded-xl border focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors text-xs font-semibold leading-relaxed ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                }`}
                placeholder="e.g. Free wheelchairs are available at Gate 1 and Main Bus Stand."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="rickshaw-input">
                {t('adminRickshaw', language)}
              </label>
              <textarea
                id="rickshaw-input"
                value={formData.disabledAssistance?.eRickshawRoutes || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  disabledAssistance: {
                    ...(prev.disabledAssistance || {}),
                    eRickshawRoutes: e.target.value
                  }
                }))}
                rows={2}
                className={`w-full px-3 py-2.5 rounded-xl border focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors text-xs font-semibold leading-relaxed ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                }`}
                placeholder="e.g. Free E-Rickshaw service is active from the bus stand to the temple entrance."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="special-gates-input">
                {t('adminSpecialGates', language)}
              </label>
              <textarea
                id="special-gates-input"
                value={formData.disabledAssistance?.specialEntryGates || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  disabledAssistance: {
                    ...(prev.disabledAssistance || {}),
                    specialEntryGates: e.target.value
                  }
                }))}
                rows={2}
                className={`w-full px-3 py-2.5 rounded-xl border focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors text-xs font-semibold leading-relaxed ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                }`}
                placeholder="e.g. Elderly (>70 yrs) and disabled devotees have direct free entry via Gate 3."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="assist-helpline-input">
                {t('adminVolunteerHelpline', language)}
              </label>
              <input
                id="assist-helpline-input"
                type="text"
                value={formData.disabledAssistance?.helplineNumber || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  disabledAssistance: {
                    ...(prev.disabledAssistance || {}),
                    helplineNumber: e.target.value
                  }
                }))}
                className={`w-full px-3 py-2.5 rounded-xl border focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors text-xs font-semibold leading-relaxed ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                }`}
                placeholder="e.g. +91-9431301037"
              />
            </div>
          </div>
        </div>

        {/* Section 10: Live Crowd & Queue Tracker */}
        <div className={`p-6 rounded-[28px] shadow-sm border space-y-4 md:col-span-2 ${
          isDarkMode ? 'glass-card-dark text-white' : 'glass-card text-stone-800'
        }`}>
          <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-850 pb-2">
            <h3 className="text-base font-extrabold font-spiritual text-saffron-500">
              {language === 'hi' ? '📊 लाइव भीड़ और दर्शन कतार ट्रैकर' : '📊 Live Crowd & Queue Status Tracker'}
            </h3>
            <span className="text-[10px] px-2.5 py-0.5 bg-saffron-100 text-saffron-700 dark:bg-saffron-950/30 dark:text-saffron-400 rounded-full border border-saffron-200 dark:border-saffron-900/20 font-bold font-sans animate-pulse">
              {language === 'hi' ? 'लाइव नियंत्रण' : 'Live Control'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Interactive Controls */}
            <div className="space-y-4">
              {/* Crowd level selection */}
              <div>
                <label className="block text-[11px] font-bold mb-2 text-stone-500 dark:text-stone-400">
                  {language === 'hi' ? 'भीड़ का स्तर (Crowd Level)' : 'Crowd Level'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'low', label: 'कम (Low)', color: 'border-green-500 text-green-600 bg-green-50/30 dark:bg-green-950/10' },
                    { value: 'normal', label: 'सामान्य (Normal)', color: 'border-amber-500 text-amber-600 bg-amber-50/30 dark:bg-amber-950/10' },
                    { value: 'heavy', label: 'भारी (Heavy)', color: 'border-orange-500 text-orange-600 bg-orange-50/30 dark:bg-orange-950/10' },
                    { value: 'peak', label: 'अत्यधिक भीड़ (Peak)', color: 'border-red-500 text-red-600 bg-red-50/30 dark:bg-red-950/10' }
                  ].map((lvl) => {
                    const isSelected = (formData.crowdStatus?.status || 'normal') === lvl.value;
                    return (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => {
                          let autoWait = '30 मिनट';
                          let autoDesc = 'कतार सामान्य है, दर्शन सुचारू रूप से चल रहे हैं।';
                          let autoDescEn = 'Queue is normal, darshan is smooth.';

                          if (lvl.value === 'low') {
                            autoWait = '15 मिनट';
                            autoDesc = 'कतार बहुत छोटी है, दर्शन अत्यंत सुलभ और शीघ्र हो रहे हैं। आप तुरंत मंदिर पधार सकते हैं।';
                            autoDescEn = 'The queue is very short. Darshan is extremely smooth and quick. You can visit immediately.';
                          } else if (lvl.value === 'normal') {
                            autoWait = '30 मिनट';
                            autoDesc = 'कतार सामान्य है, दर्शन सुचारू रूप से चल रहे हैं। दर्शन में लगभग 30-45 मिनट का समय लग सकता है।';
                            autoDescEn = 'The queue is normal and moving smoothly. Darshan might take around 30-45 minutes.';
                          } else if (lvl.value === 'heavy') {
                            autoWait = '1.5 घंटे';
                            autoDesc = 'मेले/त्योहार के कारण मंदिर में भीड़ भारी है। कतार सिंह द्वार तक पहुँच चुकी है, दर्शन में लगभग 1.5 से 2 घंटे लगेंगे।';
                            autoDescEn = 'Heavy crowd at the temple due to Basukinath Mela. The queue is near Singh Dwar, estimated wait time is 1.5 to 2 hours.';
                          } else if (lvl.value === 'peak') {
                            autoWait = '3+ घंटे';
                            autoDesc = 'अत्यधिक भीड़! कतार मुख्य मार्ग तक पहुँच चुकी है। सुरक्षा कारणों से दर्शन में 3+ घंटे का समय लग सकता है। कृपया धैर्य रखें।';
                            autoDescEn = 'Peak Rush! The queue has extended to the main transit road. Due to safety controls, expect 3+ hours wait time. Please remain patient.';
                          }

                          setFormData(prev => ({
                            ...prev,
                            crowdStatus: {
                              status: lvl.value,
                              waitTime: autoWait,
                              description: autoDesc,
                              descriptionEn: autoDescEn,
                              updatedAt: new Date()
                            }
                          }));
                        }}
                        className={`px-3 py-3 rounded-xl border text-center text-xs font-bold transition-all active:scale-95 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isSelected 
                            ? `${lvl.color} border-2 ring-2 ring-offset-2 ring-saffron-400`
                            : 'border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/50'
                        }`}
                      >
                        <span className="text-base">
                          {lvl.value === 'low' ? '🟢' : lvl.value === 'normal' ? '🟡' : lvl.value === 'heavy' ? '🟠' : '🔴'}
                        </span>
                        <span>{lvl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Waiting Time Input */}
              <div>
                <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="wait-time-input">
                  {language === 'hi' ? 'कतार में लगने वाला अनुमानित समय (Estimated Wait Time)' : 'Estimated Wait Time'}
                </label>
                <input
                  id="wait-time-input"
                  type="text"
                  value={formData.crowdStatus?.waitTime || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    crowdStatus: {
                      ...(prev.crowdStatus || {}),
                      waitTime: e.target.value,
                      updatedAt: new Date()
                    }
                  }))}
                  placeholder={language === 'hi' ? 'जैसे: 30 मिनट, 1.5 घंटे, 3+ घंटे' : 'e.g. 30 minutes, 1.5 hours, 3+ hours'}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors ${
                    isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                />
                
                {/* Wait time quick selection chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['15 मिनट', '30 मिनट', '45 मिनट', '1 घंटा', '1.5 घंटे', '2 घंटे', '3+ घंटे'].map((chipVal) => (
                    <button
                      key={chipVal}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        crowdStatus: {
                          ...(prev.crowdStatus || {}),
                          waitTime: chipVal,
                          updatedAt: new Date()
                        }
                      }))}
                      className={`px-2.5 py-1 text-[10px] rounded-lg font-bold border transition-all active:scale-95 ${
                        (formData.crowdStatus?.waitTime || '') === chipVal
                          ? 'border-saffron-500 text-saffron-600 bg-saffron-50 dark:bg-saffron-950/20'
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/50'
                      }`}
                    >
                      {chipVal}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Custom Text Updates */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="crowd-desc-hi">
                  {language === 'hi' ? 'लाइव स्थिति विवरण (हिंदी में)' : 'Live Description (Hindi)'}
                </label>
                <textarea
                  id="crowd-desc-hi"
                  value={formData.crowdStatus?.description || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    crowdStatus: {
                      ...(prev.crowdStatus || {}),
                      description: e.target.value,
                      updatedAt: new Date()
                    }
                  }))}
                  rows={2}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors text-xs font-semibold leading-relaxed ${
                    isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                  placeholder="जैसे: अभी कतार सिंह द्वार तक है, दर्शन में लगभग 1.5 घंटे का समय लगेगा।"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="crowd-desc-en">
                  {language === 'hi' ? 'लाइव स्थिति विवरण (अंग्रेज़ी में)' : 'Live Description (English)'}
                </label>
                <textarea
                  id="crowd-desc-en"
                  value={formData.crowdStatus?.descriptionEn || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    crowdStatus: {
                      ...(prev.crowdStatus || {}),
                      descriptionEn: e.target.value,
                      updatedAt: new Date()
                    }
                  }))}
                  rows={2}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors text-xs font-semibold leading-relaxed ${
                    isDarkMode ? 'bg-stone-950/80 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                  placeholder="e.g. Queue is at Singh Dwar, estimated wait time is 1.5 hours."
                />
              </div>
            </div>

          </div>

          {/* Chatbot Preview Section */}
          <div className="pt-3 border-t border-dashed border-stone-200 dark:border-stone-800">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-600 mb-2">
              {language === 'hi' ? 'श्रद्धालुओं को कैसा दिखेगा (Live Devotee Chatbot Preview):' : 'Live Devotee Chatbot Preview:'}
            </h4>
            <div className={`p-4 rounded-2xl border text-xs font-semibold leading-relaxed ${
              isDarkMode ? 'bg-stone-950/80 border-stone-800 text-stone-200' : 'bg-orange-50/20 border-orange-100/50 text-stone-700'
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-saffron-600 dark:text-saffron-400 mb-1">
                <span>🤖</span>
                <span>पुजारी जी (Pujari Ji):</span>
              </div>
              <p className="whitespace-pre-line leading-relaxed">
                📊 **लाइव भीड़ और कतार स्थिति (Live Crowd & Queue Status)**:
                {"\n"}🟢 **भीड़ का स्तर (Crowd Level)**: {
                  (formData.crowdStatus?.status === 'low') ? (language === 'hi' ? 'कम (Low)' : 'Low') : 
                  (formData.crowdStatus?.status === 'heavy') ? (language === 'hi' ? 'भारी (Heavy)' : 'Heavy') :
                  (formData.crowdStatus?.status === 'peak') ? (language === 'hi' ? 'अत्यधिक भीड़ (Peak Rush) ⚠️' : 'Peak Rush ⚠️') : (language === 'hi' ? 'सामान्य (Normal)' : 'Normal')
                }
                {"\n"}⏳ **कतार में अनुमानित समय (Estimated Wait Time)**: ~ {formData.crowdStatus?.waitTime || '30 मिनट'}
                {"\n\n"}📢 **ताज़ा स्थिति (Live Update)**: {formData.crowdStatus?.description || 'कतार सामान्य है, दर्शन सुचारू रूप से चल रहे हैं।'}
                {"\n"}⏱️ **अंतिम अपडेट (Last Updated)**: अभी-अभी (Live)
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
