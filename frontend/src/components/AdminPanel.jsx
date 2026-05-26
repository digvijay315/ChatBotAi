import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { t } from '../utils/translations';
import api from '../utils/api';

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
    customSections: []
  });
  
  const [newTiming, setNewTiming] = useState({ name: '', time: '' });
  const [newRule, setNewRule] = useState('');
  const [newFestival, setNewFestival] = useState({ name: '', date: '', description: '' });
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Sync formData whenever templeData is successfully loaded from the server
  useEffect(() => {
    if (templeData) {
      setFormData({
        ...templeData,
        customSections: templeData.customSections || []
      });
    }
  }, [templeData]);

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

  // Save changes to Backend MongoDB
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/temple-data', formData);
      const resData = response.data;

      const successMsg = language === 'hi'
        ? 'डेटा सफलतापूर्वक डेटाबेस (MongoDB) में सुरक्षित कर दिया गया है!'
        : 'Temple information saved successfully to database (MongoDB)!';
        
      showNotification('success', successMsg);
      onDataUpdate(resData.data);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      showNotification('error', `${language === 'hi' ? 'बचाव विफल:' : 'Save failed:'} ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to default seed template
  const handleResetToDefault = () => {
    const confirmMsg = language === 'hi'
      ? 'क्या आप सचमुच मंदिर के डेटा को बाबा बासुकीनाथ धाम मंदिर डिफ़ॉल्ट डेटा में रीसेट करना चाहते हैं?'
      : 'Are you sure you want to reset the temple details to Baba Basukinath Dham defaults?';
      
    if (window.confirm(confirmMsg)) {
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
        ]
      };
      
      setFormData(defaultTempleData);
      
      const notificationMsg = language === 'hi'
        ? 'डिफ़ॉल्ट डेटा लोड हो गया है। कृपया लागू करने के लिए "डेटा सेव करें" दबाएं।'
        : 'Default data loaded. Please click "Save Data" to commit changes.';
      showNotification('success', notificationMsg);
    }
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

      </div>
    </div>
  );
}
