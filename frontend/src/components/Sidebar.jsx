import React from 'react';
import { 
  MessageSquareText, 
  Settings, 
  Database, 
  Cpu, 
  Sun, 
  Moon, 
  MapPin, 
  Trash2, 
  LogOut, 
  Plus, 
  Globe,
  Info,
  FileText,
  PhoneCall,
  Accessibility,
  BarChart2,
  Printer
} from 'lucide-react';
import { t } from '../utils/translations';
import shivlingImg from '../assets/shivling.png';

export default function Sidebar({ 
  templeData, 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  setIsDarkMode, 
  dbConnected,
  
  // JWT & Sessions states
  user,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onLogout,
  
  // i18n states
  language,
  onChangeLanguage,

  // Admin sub-tabs states
  activeAdminSubTab = 'general',
  setActiveAdminSubTab
}) {
  return (
    <aside className={`w-full lg:w-80 shrink-0 p-6 flex flex-col justify-between rounded-[32px] border shadow-xl transition-all duration-300 ${
      isDarkMode 
        ? 'glass-card-dark text-white' 
        : 'glass-card text-stone-800'
    }`}>
      <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
        
        {/* Temple Brand Logo Header */}
        <div className="flex items-center gap-3 border-b border-orange-100/50 dark:border-stone-800 pb-5 shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-saffron-500 to-amber-600 rounded-2xl overflow-hidden text-white shadow-md float-animation flex items-center justify-center p-0.5">
            <img src={shivlingImg} alt="Shivling Logo" className="w-full h-full object-cover rounded-[12px]" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-spiritual tracking-wide bg-gradient-to-r from-saffron-600 to-amber-600 bg-clip-text text-transparent dark:from-saffron-400 dark:to-gold-400">
              {t('title', language)}
            </h1>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest font-semibold">
              {t('subtitle', language)}
            </p>
          </div>
        </div>

        {/* Selected Temple Info Card */}
        {templeData && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-stone-900/60 dark:to-stone-900 border border-orange-100/50 dark:border-stone-800/80 space-y-3 shrink-0">
            <h2 className="text-sm font-extrabold text-saffron-600 dark:text-saffron-400 font-spiritual flex items-center gap-1.5">
              <span>🕉️ {templeData.name}</span>
            </h2>
            
            <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300 font-medium">
              <p className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-stone-700 dark:text-stone-300">{t('deityLabel', language)}</span> {templeData.deity}
              </p>
              <p className="flex items-start gap-1.5 text-stone-500 dark:text-stone-400">
                <MapPin className="w-3.5 h-3.5 text-saffron-500 shrink-0 mt-0.5" />
                <span>{templeData.location}</span>
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="space-y-2 shrink-0">
          <button
            id="tab-devotee-chat"
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-saffron-500 to-amber-600 text-white shadow-md'
                : 'text-stone-600 dark:text-stone-300 hover:bg-orange-50/50 dark:hover:bg-stone-900/50 border border-transparent'
            }`}
          >
            <MessageSquareText className="w-5 h-5" />
            <span>{t('devoteeChat', language)}</span>
          </button>

          {/* Only show Admin Panel button to Admin role */}
          {user?.role === 'admin' && (
            <button
              id="tab-temple-admin"
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-saffron-500 to-amber-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-orange-50/50 dark:hover:bg-stone-900/50 border border-transparent'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>{t('adminPanel', language)}</span>
            </button>
          )}
        </nav>

        {/* Devotee Chat History Sessions list */}
        {user && user.role === 'admin' && activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-2 pt-2 border-t border-orange-100/50 dark:border-stone-850">
            <div className="flex items-center justify-between shrink-0 px-1">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                {t('sidebarSessionsTitle', language)}
              </h3>
              <button 
                id="sidebar-new-session-btn"
                onClick={onCreateSession}
                className="p-1 rounded-lg text-saffron-500 hover:bg-saffron-50 dark:hover:bg-stone-900/60 transition-colors"
                title={t('sidebarNewSession', language)}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-850">
              {sessions.length === 0 ? (
                <p className="text-xs text-stone-400 dark:text-stone-500 italic p-2 text-center">
                  {t('sidebarNoSessions', language)}
                </p>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess._id}
                    onClick={() => onSelectSession(sess._id)}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                      activeSessionId === sess._id
                        ? 'bg-gradient-to-r from-saffron-500 to-amber-500 text-white border-transparent shadow-sm'
                        : 'text-stone-600 dark:text-stone-300 bg-transparent border-transparent hover:bg-orange-50/50 dark:hover:bg-stone-900/50'
                    }`}
                  >
                    <span className="truncate pr-2 font-sans">{sess.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(sess._id);
                      }}
                      className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all ${
                        activeSessionId === sess._id
                          ? 'hover:bg-saffron-600 text-white'
                          : 'hover:bg-red-50 dark:hover:bg-red-950/40 text-stone-400 hover:text-red-500'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Admin Panel Sub-navigation Menus */}
        {user && user.role === 'admin' && activeTab === 'admin' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-2 pt-2 border-t border-orange-100/50 dark:border-stone-850">
            <div className="px-1 mb-1 shrink-0">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                {language === 'hi' ? 'डेटा संपादक मेनू' : 'ADMIN CONTROL MENUS'}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-850">
              {[
                {
                  id: 'general',
                  labelHi: ' मंदिर सामान्य विवरण',
                  labelEn: ' Temple Info (General)',
                  icon: <Info className="w-4 h-4 shrink-0" />
                },
                {
                  id: 'custom',
                  labelHi: ' कस्टम अनुभाग',
                  labelEn: ' Custom Sections',
                  icon: <FileText className="w-4 h-4 shrink-0" />
                },
                {
                  id: 'camps',
                  labelHi: ' अस्थायी शिविर प्रबंधन',
                  labelEn: ' Temporary Camps',
                  icon: <MapPin className="w-4 h-4 shrink-0" />
                },
                {
                  id: 'emergency',
                  labelHi: ' आपातकालीन हेल्पलाइन',
                  labelEn: ' Emergency Contacts',
                  icon: <PhoneCall className="w-4 h-4 shrink-0" />
                },
                {
                  id: 'disabled',
                  labelHi: ' वृद्ध एवं दिव्यांग सहायता',
                  labelEn: ' Special Assistance',
                  icon: <Accessibility className="w-4 h-4 shrink-0" />
                },
                {
                  id: 'crowd',
                  labelHi: ' लाइव भीड़ ट्रैकर',
                  labelEn: ' Live Crowd Tracker',
                  icon: <BarChart2 className="w-4 h-4 shrink-0" />
                },
                {
                  id: 'qr',
                  labelHi: ' QR कोड और Standee',
                  labelEn: ' QR & Promo Standee',
                  icon: <Printer className="w-4 h-4 shrink-0" />
                }
              ].map((subTab) => {
                const isSelected = activeAdminSubTab === subTab.id;
                return (
                  <button
                    key={subTab.id}
                    onClick={() => setActiveAdminSubTab(subTab.id)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] border ${
                      isSelected
                        ? 'bg-gradient-to-r from-saffron-500 to-amber-500 text-white border-transparent shadow-sm'
                        : 'text-stone-600 dark:text-stone-300 bg-transparent border-transparent hover:bg-orange-50/50 dark:hover:bg-stone-900/50'
                    }`}
                  >
                    {subTab.icon}
                    <span className="truncate">{language === 'hi' ? subTab.labelHi : subTab.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Footer Settings & Status chips */}
      <div className="space-y-4 pt-4 border-t border-orange-100/50 dark:border-stone-800 shrink-0">
        
        {/* Bilingual Segmented Selector */}
        <div className="flex bg-stone-100 dark:bg-stone-900/60 p-1 rounded-xl">
          <button
            onClick={() => onChangeLanguage('hi')}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-lg transition-all ${
              language === 'hi'
                ? 'bg-white dark:bg-stone-800 text-saffron-600 dark:text-saffron-400 shadow-sm'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-saffron-500 animate-pulse" />
            <span>हिन्दी</span>
          </button>
          <button
            onClick={() => onChangeLanguage('en')}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-lg transition-all ${
              language === 'en'
                ? 'bg-white dark:bg-stone-800 text-saffron-600 dark:text-saffron-400 shadow-sm'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-saffron-500 animate-pulse" />
            <span>English</span>
          </button>
        </div>

        {/* Server & Engine Status Panel */}
        <div className="space-y-2 text-xs">
          {/* MongoDB Connection Status */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-850">
            <span className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1 font-bold">
              <Database className="w-3.5 h-3.5" />
              <span>{t('database', language)}</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
              dbConnected 
                ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'bg-green-500 animate-ping' : 'bg-red-500'}`} />
              {dbConnected ? t('sidebarDbConnected', language).toUpperCase() : t('sidebarDbDisconnected', language).toUpperCase()}
            </span>
          </div>

          {/* Gemini Mode Status */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-850">
            <span className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1 font-bold">
              <Cpu className="w-3.5 h-3.5" />
              <span>{t('aiEngine', language)}</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
              templeData?.hasApiKey
                ? 'bg-saffron-100 text-saffron-700 dark:bg-saffron-950/20 dark:text-saffron-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
            }`}>
              {templeData?.hasApiKey ? t('sidebarEngineGemini', language).toUpperCase() : t('sidebarEngineOffline', language).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Dark Mode and Logout Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[11px] font-bold transition-all active:scale-[0.98] bg-white border-stone-200 text-stone-700 hover:bg-orange-50/20 dark:bg-stone-900 dark:border-stone-800 dark:text-white"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>{t('lightMode', language)}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t('darkMode', language)}</span>
              </>
            )}
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 text-[11px] font-bold transition-all active:scale-[0.98]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('sidebarLogout', language)}</span>
            </button>
          )}
        </div>

        {/* Technical Footer */}
        <p className="text-[9px] text-center text-stone-400 dark:text-stone-600 font-sans">
          Mandir AI © 2026. Made with ❤️ for Devotees
        </p>
      </div>

    </aside>
  );
}
