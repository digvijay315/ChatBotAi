import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AppContext = createContext();

export function AppContextProvider({ children }) {
  // --- AUTH STATES ---
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- CONFIG / THEME STATES ---
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'hi');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('isDarkMode') === 'true');

  // --- SERVER & DATA STATES ---
  const [templeData, setTempleData] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);

  // --- SESSION & MESSAGES STATES ---
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode);
  }, [isDarkMode]);

  // Fetch Temple details on mount
  const fetchTempleData = async () => {
    try {
      const response = await api.get('/temple-data');
      setTempleData(response.data);
      setDbConnected(true);
    } catch (err) {
      console.warn('⚠️ Server offline, using fallback data');
      setDbConnected(false);
    }
  };

  useEffect(() => {
    fetchTempleData();
  }, []);

  // Fetch User Chat Sessions
  const fetchSessions = async (authToken, authUser) => {
    const currentToken = authToken || token;
    if (!currentToken) return;

    try {
      const response = await api.get('/sessions', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const sessionList = response.data;
      setSessions(sessionList);

      if (sessionList.length > 0) {
        setActiveSessionId(sessionList[0]._id);
      } else {
        // Automatically create a session if they have none!
        await handleCreateSession(currentToken);
      }
    } catch (err) {
      console.error('❌ Failed to fetch sessions:', err);
    }
  };

  // Sync sessions when token/user changes
  useEffect(() => {
    if (token && user) {
      fetchSessions(token, user);
    }
  }, [token, user]);

  // Load messages whenever active session changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeSessionId || !token) return;
      try {
        const response = await api.get(`/sessions/${activeSessionId}/messages`);
        const msgList = response.data;
        setMessages(msgList);
      } catch (err) {
        console.error('❌ Failed to load messages:', err);
      }
    };
    fetchMessages();
  }, [activeSessionId, token]);

  // Create new Chat Session
  const handleCreateSession = async (customToken) => {
    const activeTok = customToken || token;
    if (!activeTok) return;

    try {
      const response = await api.post('/sessions/new', 
        { 
          title: language === 'hi' ? `चैट सत्र #${sessions.length + 1}` : `Chat Session #${sessions.length + 1}` 
        },
        {
          headers: { 'Authorization': `Bearer ${activeTok}` }
        }
      );
      const newSession = response.data;
      
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession._id);
      setMessages([]);
    } catch (err) {
      console.error('❌ Failed to create session:', err);
    }
  };

  // Delete Chat Session
  const handleDeleteSession = async (id) => {
    if (!token) return;
    const confirmMsg = language === 'hi' 
      ? 'क्या आप सचमुच इस चैट सत्र को हटाना चाहते हैं?' 
      : 'Are you sure you want to delete this chat thread?';
      
    if (window.confirm(confirmMsg)) {
      try {
        await api.delete(`/sessions/${id}`);
        
        setSessions(prev => prev.filter(s => s._id !== id));
        if (activeSessionId === id) {
          const remaining = sessions.filter(s => s._id !== id);
          if (remaining.length > 0) {
            setActiveSessionId(remaining[0]._id);
          } else {
            setActiveSessionId('');
            setMessages([]);
          }
        }
      } catch (err) {
        console.error('❌ Failed to delete session:', err);
      }
    }
  };

  // Send Chat message
  const handleSendMessage = async (text) => {
    if (!token || !activeSessionId) return;

    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        message: text,
        sessionId: activeSessionId
      });
      const resData = response.data;

      const botMsg = {
        sender: 'bot',
        text: resData.reply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('❌ Chat transmission failed:', err);
      
      const botMsg = {
        sender: 'bot',
        text: language === 'hi' 
          ? `क्षमा करें! संदेश भेजने में समस्या आई। कृपया सुनिश्चित करें कि बैकएंड सर्वर और डेटाबेस सक्रिय हैं।` 
          : `Apologies! Error sending message. Please make sure the backend server and MongoDB database are active.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setToken('');
    setUser(null);
    setSessions([]);
    setActiveSessionId('');
    setMessages([]);
  };

  return (
    <AppContext.Provider value={{
      token, setToken,
      user, setUser,
      language, setLanguage,
      isDarkMode, setIsDarkMode,
      templeData, setTempleData,
      dbConnected, setDbConnected,
      fetchTempleData,
      sessions, setSessions,
      activeSessionId, setActiveSessionId,
      messages, setMessages,
      isLoading, setIsLoading,
      fetchSessions,
      handleCreateSession,
      handleDeleteSession,
      handleSendMessage,
      handleLogout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
