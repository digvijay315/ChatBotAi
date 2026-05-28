import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { t } from '../utils/translations';
import shivlingImg from '../assets/shivling.png';
import { Trash2 } from 'lucide-react';

export default function ChatDashboardPage() {
  const {
    token,
    user,
    language,
    setLanguage,
    isDarkMode,
    setIsDarkMode,
    templeData,
    dbConnected,
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    isLoading,
    handleCreateSession,
    handleDeleteSession,
    handleClearChat,
    handleSendMessage,
    handleLogout
  } = useApp();

  const navigate = useNavigate();

  if (!token || !user) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
        isDarkMode ? 'bg-stone-950 text-stone-100 saffron-gradient-dark' : 'bg-orange-50/30 text-stone-800 saffron-gradient'
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-saffron-500 to-amber-600 rounded-3xl overflow-hidden shadow-lg flex items-center justify-center p-0.5 animate-pulse">
            <img src={shivlingImg} alt="Shivling Loading" className="w-full h-full object-cover rounded-[22px]" />
          </div>
          <p className="text-sm font-semibold text-saffron-600 dark:text-saffron-400 font-spiritual animate-pulse">
            ॐ नमः शिवाय... (आरंभ हो रहा है)
          </p>
        </div>
      </div>
    );
  }

  // Backward compatible adapter to convert tab clicks into route navigation!
  const handleTabSwitch = (tab) => {
    if (tab === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className={`min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 transition-colors duration-300 ${
        isDarkMode 
          ? 'saffron-gradient-dark text-stone-100 bg-stone-950' 
          : 'saffron-gradient text-stone-800'
      }`}>
        
        {/* Main Application Container */}
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 p-2 sm:p-4 rounded-[40px] shadow-2xl glass-card border border-white/20 relative overflow-hidden backdrop-blur-xl">
          
          {/* Saffron/Gold Sidebar */}
          <Sidebar 
            templeData={templeData} 
            activeTab="chat" // Static tab for this dashboard page
            setActiveTab={handleTabSwitch} 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode}
            dbConnected={dbConnected}
            
            // JWT & Sessions states from context
            user={user}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            onLogout={handleLogout}
            
            // i18n states
            language={language}
            onChangeLanguage={setLanguage}
          />

          {/* Dynamic Content Panel */}
          <main className="flex-1 flex flex-col justify-between min-w-0">
            {/* Header bar */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-4 py-2 border-b border-orange-100/50 dark:border-stone-850 pb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold font-spiritual text-saffron-600 dark:text-saffron-400">
                  {templeData?.name || 'मंदिर मार्गदर्शक'} 🕉️
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-0.5 font-medium">
                  {t('welcomeText', language).substring(0, 52) + '...'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Clear Chat Button for Devotees (non-admins) */}
                {user?.role !== 'admin' && (
                  <button
                    onClick={handleClearChat}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-250/60 text-red-600 dark:bg-red-950/20 dark:border-red-950/40 dark:text-red-400 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                    title={t('clearChat', language)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('clearChat', language)}</span>
                  </button>
                )}

                {/* Show login status info for Admin */}
                {user?.role === 'admin' && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-3 py-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full font-bold text-stone-600 dark:text-stone-400">
                      ⚙️ Admin Panel Active
                    </span>
                  </div>
                )}
              </div>
            </header>

            {/* Devotee Chat Area */}
            <ChatArea 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
              templeData={templeData}
              isDarkMode={isDarkMode}
              language={language}
            />
          </main>

        </div>

        {/* Powered by DIRD Footer */}
        <footer className="text-center py-4 text-[11px] font-extrabold uppercase tracking-widest text-stone-500 dark:text-stone-400 transition-colors animate-fadeIn mt-4 select-none">
          Powered by <span className="text-saffron-600 dark:text-saffron-400 font-black">DIRD India Pvt Ltd</span>
        </footer>

      </div>
    </div>
  );
}
