import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import AdminPanel from '../components/AdminPanel';
import { t } from '../utils/translations';

export default function AdminDashboardPage() {
  const {
    token,
    user,
    language,
    setLanguage,
    isDarkMode,
    setIsDarkMode,
    templeData,
    setTempleData,
    dbConnected,
    handleLogout
  } = useApp();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState('general');

  const navigate = useNavigate();

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
            activeTab="admin" // Static tab for this dashboard page
            setActiveTab={handleTabSwitch} 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode}
            dbConnected={dbConnected}
            
            // JWT & Sessions states from context
            user={user}
            sessions={[]} // Admin has no chat sessions
            activeSessionId=""
            onSelectSession={() => {}}
            onCreateSession={() => {}}
            onDeleteSession={() => {}}
            onLogout={handleLogout}
            
            // i18n states
            language={language}
            onChangeLanguage={setLanguage}

            // Sub Tab states
            activeAdminSubTab={activeAdminSubTab}
            setActiveAdminSubTab={setActiveAdminSubTab}
          />

          {/* Dynamic Content Panel */}
          <main className="flex-1 flex flex-col justify-between">
            {/* Header bar */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-4 py-2 border-b border-orange-100/50 dark:border-stone-850 pb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold font-spiritual text-saffron-600 dark:text-saffron-400">
                  {templeData?.name || 'मंदिर मार्गदर्शक'} 🕉️
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-0.5 font-medium">
                  {t('adminWelcomeSubtitle', language)}
                </p>
              </div>

              {/* Show login status info */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-3 py-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full font-bold text-stone-600 dark:text-stone-400">
                  👤 {user?.name} ({t('adminTitle', language)})
                </span>
              </div>
            </header>

            {/* Admin Data Panel */}
            <AdminPanel 
              templeData={templeData} 
              onDataUpdate={setTempleData}
              isDarkMode={isDarkMode}
              language={language}
              adminToken={token}
              activeAdminSubTab={activeAdminSubTab}
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
