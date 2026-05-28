import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { Mail, Lock, User as UserIcon, Globe } from 'lucide-react';
import api from '../utils/api';
import shivlingImg from '../assets/shivling.png';

export default function AuthPage() {
  const { 
    token, 
    user, 
    setToken, 
    setUser, 
    language, 
    setLanguage, 
    isDarkMode,
    fetchSessions
  } = useApp();
  
  // --- LOCAL FORM STATES ---
  const [authTab, setAuthTab] = useState('admin'); // Only 'admin' now!
  const [regName, setRegName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const navigate = useNavigate();

  // Route Guard: If already authenticated as admin, redirect to admin dashboard immediately
  if (token && user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // --- FORM HANDLER ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    let path = '/auth/login';
    let payload = { email: authEmail, password: authPassword };

    if (authTab === 'register') {
      path = '/auth/register';
      payload = { name: regName, email: authEmail, password: authPassword };
    } else if (authTab === 'admin') {
      path = '/auth/admin-login';
    }

    try {
      const response = await api.post(path, payload);
      const resData = response.data;

      if (authTab === 'register') {
        setAuthSuccess(resData.message || 'पंजीकरण सफल!');
        setAuthTab('login'); // Switch devotee to login tab
        setRegName('');
        setAuthPassword('');
      } else {
        // Save auth state globally and inside localStorage
        localStorage.setItem('token', resData.token);
        localStorage.setItem('user', JSON.stringify(resData.user));
        
        setToken(resData.token);
        setUser(resData.user);
        
        // Auto routing using React Router DOM depending on role!
        if (resData.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      setAuthError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-stone-950 text-stone-100 saffron-gradient-dark' 
        : 'bg-orange-50/30 text-stone-800 saffron-gradient'
    }`}>
      
      {/* Top absolute language switcher */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
          className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95 ${
            isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-orange-100 text-stone-700'
          }`}
        >
          <Globe className="w-4 h-4 text-saffron-500" />
          <span>{language === 'hi' ? 'English' : 'हिन्दी'}</span>
        </button>
      </div>

      <div className={`w-full max-w-md p-8 rounded-[35px] shadow-2xl border backdrop-blur-xl transition-all ${
        isDarkMode ? 'glass-card-dark text-white' : 'glass-card text-stone-800'
      }`}>
        
        {/* Brand Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-saffron-500 to-amber-600 rounded-3xl overflow-hidden text-white shadow-lg float-animation flex items-center justify-center p-0.5">
            <img src={shivlingImg} alt="Shivling Logo" className="w-full h-full object-cover rounded-[22px]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center font-spiritual text-saffron-500 mb-1">
          {language === 'hi' ? 'प्रशासनिक लॉगिन' : 'Admin Login'}
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-center text-xs mb-6 px-4 font-semibold">
          {language === 'hi' ? 'केवल मंदिर एडमिनिस्ट्रेशन के उपयोग के लिए' : 'For temple administration use only'}
        </p>

        {/* Action Error Alerts */}
        {authError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-1.5 leading-relaxed">
            <span>⚠️ {authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 text-xs rounded-xl border border-green-100 dark:border-green-900/30 flex items-center gap-1.5 leading-relaxed">
            <span>✅ {authSuccess}</span>
          </div>
        )}

        {/* Main form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authTab === 'register' && (
            <div>
              <label className="block text-xs font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="name-register">
                {t('userNameLabel', language)}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
                <input
                  id="name-register"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="उदा: मोहन शर्मा"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors ${
                    isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="email-login">
              {authTab === 'admin' ? t('adminEmailLabel', language) : t('userEmailLabel', language)}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
              <input
                id="email-login"
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder={authTab === 'admin' ? "admin@gmail.com" : "email@domain.com"}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-stone-500 dark:text-stone-400" htmlFor="password-login">
              {authTab === 'admin' ? t('adminPasswordLabel', language) : t('userPasswordLabel', language)}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
              <input
                id="password-login"
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors ${
                  isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                }`}
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={authLoading}
            className="w-full py-3 bg-gradient-to-r from-saffron-500 to-amber-600 hover:from-saffron-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 text-xs"
          >
            {authLoading ? '...' : authTab === 'register' ? t('userRegisterBtn', language) : t('userLoginBtn', language)}
          </button>
        </form>

        {/* Quick toggles */}
        <div className="mt-6 pt-4 border-t border-orange-100/50 dark:border-stone-800 text-center flex flex-col gap-3 items-center">
          <button 
            type="button"
            onClick={() => navigate('/')} 
            className="text-xs font-bold text-saffron-500 hover:text-saffron-600 border border-saffron-200 hover:border-saffron-300 dark:border-stone-800 dark:hover:border-stone-700 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 bg-transparent"
          >
            {language === 'hi' ? '🕉️ भक्त चैट बोर्ड पर जाएं (Go to Chatboard)' : '🕉️ Go to Devotee Chatboard'}
          </button>
          
          <p className="text-[10px] text-stone-400 font-semibold leading-relaxed">
            Hint: admin@gmail.com / admin@123
          </p>
        </div>

        {/* Powered by DIRD Footer */}
        <footer className="text-center py-4 text-[11px] font-extrabold uppercase tracking-widest text-stone-500 dark:text-stone-400 transition-colors animate-fadeIn mt-4 select-none">
          Powered by <span className="text-saffron-600 dark:text-saffron-400 font-black">DIRD India Pvt Ltd</span>
        </footer>

      </div>
    </div>
  );
}
