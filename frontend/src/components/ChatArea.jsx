import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, AlertCircle, Play } from 'lucide-react';
import MessageItem from './MessageItem';
import { t } from '../utils/translations';

export default function ChatArea({ 
  messages, 
  onSendMessage, 
  isLoading, 
  templeData, 
  isDarkMode,
  language
}) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [micSupported, setMicSupported] = useState(true);
  const [chatFlow, setChatFlow] = useState('default'); // 'default' or 'camps'
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Configure Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Dynamic microphone locale based on selected UI language!
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US'; 

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev + ' ' + transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [language]); // Reconfigure recognition if user switches language

  // Programmatic Temple Bell Synthesizer using Web Audio API!
  // No files needed, 100% offline, zero latency, amazing sound!
  const chimeBell = () => {
    if (!isSoundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      const now = audioCtx.currentTime;

      // 1. Chime Strike Tone (High harmonics)
      const strikeOsc = audioCtx.createOscillator();
      strikeOsc.type = 'sine';
      strikeOsc.frequency.setValueAtTime(880, now); // A5 note (crystal clear)

      const strikeGain = audioCtx.createGain();
      strikeGain.gain.setValueAtTime(0.2, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2); // decaying chime

      strikeOsc.connect(strikeGain);
      strikeGain.connect(audioCtx.destination);
      strikeOsc.start(now);
      strikeOsc.stop(now + 1.2);

      // 2. Hum Tone (Warm body hum)
      const humOsc = audioCtx.createOscillator();
      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(440, now); // A4 note (warmth)

      const humGain = audioCtx.createGain();
      humGain.gain.setValueAtTime(0.12, now);
      humGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8); // longer decay for warm hum

      humOsc.connect(humGain);
      humGain.connect(audioCtx.destination);
      humOsc.start(now);
      humOsc.stop(now + 1.8);
      
    } catch (e) {
      console.warn("Speech/Sound Audio Context blocked by user settings.");
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    
    chimeBell();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Quick Prompt buttons handler
  const handleQuickQuestion = (question, isBack = false) => {
    chimeBell();
    if (isBack) {
      setChatFlow('default');
      return;
    }
    
    if (question === t('quickCampsQuery', language)) {
      setChatFlow('camps');
    } else {
      setChatFlow('default');
    }
    
    onSendMessage(question);
  };

  // Start / Stop voice listening
  const toggleListening = () => {
    if (!micSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const quickQuestions = [
    { text: t('quickAarti', language), query: t('quickAartiQuery', language) },
    { text: t('quickHistory', language), query: t('quickHistoryQuery', language) },
    { text: t('quickRules', language), query: t('quickRulesQuery', language) },
    { text: t('quickDonation', language), query: t('quickDonationQuery', language) },
    { text: t('quickHotels', language), query: t('quickHotelsQuery', language) },
    { text: t('quickHospitals', language), query: t('quickHospitalsQuery', language) },
    { text: t('quickAshrams', language), query: t('quickAshramsQuery', language) },
    { text: t('quickTransport', language), query: t('quickTransportQuery', language) },
    { text: t('quickATMs', language), query: t('quickATMsQuery', language) },
    { text: t('quickDisabled', language), query: t('quickDisabledQuery', language) },
    { text: t('quickCamps', language), query: t('quickCampsQuery', language) },
    { text: t('quickEmergency', language), query: t('quickEmergencyQuery', language) }
  ];

  const campCategories = [
    { text: language === 'hi' ? "🏨 आवास शिविर" : "🏨 Stay Camps", query: language === 'hi' ? "सक्रिय अस्थायी आवास शिविर दिखाओ" : "Show active stay accommodation camps" },
    { text: language === 'hi' ? "🏥 चिकित्सा शिविर" : "🏥 Medical Camps", query: language === 'hi' ? "सक्रिय अस्थायी चिकित्सा शिविर दिखाओ" : "Show active medical camps" },
    { text: language === 'hi' ? "🍱 भोजन/लंगर" : "🍱 Food & Langar", query: language === 'hi' ? "सक्रिय अस्थायी भोजन और लंगर शिविर दिखाओ" : "Show active food camps" },
    { text: language === 'hi' ? "🚌 परिवहन शिविर" : "🚌 Transport Camps", query: language === 'hi' ? "सक्रिय अस्थायी परिवहन शिविर दिखाओ" : "Show active transport camps" },
    { text: language === 'hi' ? "🏧 एटीएम शिविर" : "🏧 ATM Camps", query: language === 'hi' ? "सक्रिय अस्थायी एटीएम शिविर दिखाओ" : "Show active ATM camps" },
    { text: language === 'hi' ? "💵 त्वरित कैश सेवा" : "💵 Instant Cash", query: language === 'hi' ? "सक्रिय अस्थायी त्वरित कैश सेवा शिविर दिखाओ" : "Show active instant cash camps" },
    { text: language === 'hi' ? "⬅️ वापस" : "⬅️ Go Back", query: null, isBack: true }
  ];

  const activeQuestions = chatFlow === 'camps' ? campCategories : quickQuestions;

  return (
    <div className="flex flex-col h-[75vh] md:h-[80vh] rounded-[28px] overflow-hidden shadow-lg border border-orange-100/50 dark:border-stone-850">
      
      {/* Top Header of Chat */}
      <div className={`px-6 py-4 flex items-center justify-between border-b ${
        isDarkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-orange-100 text-stone-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" title="Ready to assist" />
          <div>
            <h2 className="text-sm font-extrabold font-sans">
              {t('devoteeChat', language)}
            </h2>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">
              {templeData?.deity 
                ? (language === 'hi' ? `प्रभु ${templeData.deity} डिजिटल सहायक` : `Digital assistant for Lord ${templeData.deity}`) 
                : 'Assistant'
              }
            </p>
          </div>
        </div>
        
        {/* Sound toggle and bells */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsSoundEnabled(!isSoundEnabled);
              if(!isSoundEnabled) {
                // Instantly chime to verify
                setTimeout(chimeBell, 100);
              }
            }}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              isSoundEnabled 
                ? 'bg-orange-50 text-saffron-500 dark:bg-stone-800' 
                : 'bg-stone-100 text-stone-400 dark:bg-stone-800'
            }`}
            title={isSoundEnabled ? "ध्वनि म्यूट करें (Mute Temple Bells)" : "ध्वनि चालू करें (Unmute Temple Bells)"}
          >
            {isSoundEnabled ? (
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide">
                <Volume2 className="w-3.5 h-3.5 bell-pulse" />
                <span>{t('bellSound', language)}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide">
                <VolumeX className="w-3.5 h-3.5" />
                <span>{t('silent', language)}</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className={`flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4 ${
        isDarkMode ? 'bg-stone-950/40' : 'bg-orange-50/10'
      }`}>
        {messages.length === 0 ? (
          // Welcome card if no messages
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-5 max-w-lg mx-auto my-auto animate-fadeIn">
            <div className="text-5xl float-animation">🕉️</div>
            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-extrabold font-spiritual text-saffron-500">
                {language === 'hi' ? `जय ${templeData?.deity || 'राम लला'}!` : `Jai ${templeData?.deity || 'Shree Ram'}!`}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                {t('welcomeText', language)}
              </p>
            </div>
            
            <div className="w-full space-y-2.5 pt-2">
              <p className="text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                {t('quickPromptsHeader', language)}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-left">
                {activeQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q.query, q.isBack)}
                    className={`p-3.5 rounded-2xl border text-[11px] text-stone-700 dark:text-stone-300 font-bold hover:border-saffron-400 hover:shadow-saffron-glow transition-all flex items-center justify-between group active:scale-[0.98] ${
                      isDarkMode ? 'bg-stone-900 border-stone-850' : 'bg-white border-orange-100'
                    }`}
                  >
                    <span>{q.text}</span>
                    <Play className="w-3 h-3 text-stone-400 group-hover:text-saffron-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Render messages list
          messages.map((m, index) => (
            <MessageItem key={index} message={m} isDarkMode={isDarkMode} />
          ))
        )}

        {/* Loading typing indicator */}
        {isLoading && (
          <div className="flex w-full mb-6 justify-start animate-pulse">
            <div className="flex items-start max-w-[75%] gap-3">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-saffron-400 to-amber-600 text-white shrink-0 shadow-md">
                <span className="text-xs">🕉️</span>
              </div>
              <div className={`px-5 py-3.5 rounded-3xl shadow-sm border rounded-tl-none flex items-center gap-2.5 ${
                isDarkMode ? 'bg-stone-900 border-stone-800 text-stone-400' : 'bg-white border-orange-100 text-stone-500'
              }`}>
                <span className="text-xs font-bold font-sans">{t('assistantThinking', language)}...</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-saffron-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-saffron-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-saffron-500 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive prompt buttons (visible when there are messages too, for easy typing) */}
      {messages.length > 0 && (
        <div className={`px-4 py-2.5 flex gap-1.5 overflow-x-auto border-t scrollbar-thin shrink-0 ${
          isDarkMode ? 'bg-stone-950 border-stone-850' : 'bg-orange-50/5 border-orange-100/50'
        }`}>
          {activeQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickQuestion(q.query, q.isBack)}
              className={`px-3 py-1.5 rounded-full border text-[10px] font-bold whitespace-nowrap hover:border-saffron-400 active:scale-[0.98] transition-all ${
                isDarkMode 
                  ? 'bg-stone-900 border-stone-850 text-stone-300' 
                  : 'bg-white border-orange-100 text-stone-600'
              }`}
            >
              {q.text}
            </button>
          ))}
        </div>
      )}

      {/* Message input bar */}
      <div className={`p-4 border-t shrink-0 ${
        isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-orange-100'
      }`}>
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          
          {/* Speech-to-text Microphone button */}
          <button
            id="mic-recognition-btn"
            type="button"
            onClick={toggleListening}
            className={`p-3.5 rounded-2xl transition-all active:scale-95 shrink-0 ${
              !micSupported
                ? 'bg-stone-100 text-stone-300 cursor-not-allowed dark:bg-stone-800'
                : isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg'
                  : 'bg-orange-50 text-saffron-500 dark:bg-stone-800 dark:text-saffron-400 hover:bg-orange-100 dark:hover:bg-stone-750'
            }`}
            disabled={!micSupported}
            title={
              !micSupported 
                ? t('micSupportedError', language) 
                : isListening 
                  ? t('micListening', language) 
                  : t('micTooltip', language)
            }
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 animate-pulse" />}
          </button>

          {/* Text Input */}
          <input
            id="chat-user-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening 
                ? (language === 'hi' ? "सुन रहा हूँ... बोलें" : "Listening... Speak now") 
                : t('inputPlaceholder', language)
            }
            className={`flex-1 px-4 py-3.5 rounded-2xl border text-xs font-semibold focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-all ${
              isDarkMode 
                ? 'bg-stone-950 border-stone-850 text-white placeholder-stone-600' 
                : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'
            }`}
            disabled={isLoading}
          />

          {/* Send button */}
          <button
            id="send-message-btn"
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className={`p-3.5 rounded-2xl font-bold transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0 ${
              inputText.trim() && !isLoading
                ? 'bg-gradient-to-r from-saffron-500 to-amber-600 text-white hover:shadow-lg'
                : 'bg-stone-100 text-stone-300 dark:bg-stone-800 dark:text-stone-600 cursor-not-allowed'
            }`}
            title={t('sendButton', language)}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        
        {/* Support hints */}
        {isListening && (
          <p className="text-[10px] text-red-500 font-bold animate-pulse mt-2 flex items-center gap-1 justify-center">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t('micActiveAlert', language)}</span>
          </p>
        )}
      </div>

    </div>
  );
}
