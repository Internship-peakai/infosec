import React, { useEffect, useState } from 'react';
import { useAuthenticationStatus, useSignOut, useUserData } from '@nhost/react';
import { Link, Table, FolderOpen, Search, Filter, MessageCircle, Send, FileText, Shield, Calendar, User, Moon, Sun, Bell, BellOff, X, Fingerprint } from 'lucide-react';
import { Auth } from './pages/Auth';
import { Documents } from './pages/Documents';
import { useAuthToken } from './services/auth';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

interface SheetData {
  url: string;
  lastUpdated: string;
}

interface Assessment {
  id: string;
  name: string;
  completionDate: string;
  status: 'Completed' | 'In Progress' | 'Overdue';
  sheetUrl: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

function App() {
  // Authentication hook
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const { signOut } = useSignOut();
  const user = useUserData();

  // Move all useState declarations to the top, before any conditional logic
  const [view, setView] = useState<'dashboard' | 'documents'>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  const userProfile: UserProfile = {
    name: user?.displayName || 'Anonymous User',
    email: user?.email || '',
    avatar: user?.avatarUrl || ''
  };

  const mockAssessments: Assessment[] = [
    {
      id: '1',
      name: 'Annual Security Review 2024',
      completionDate: '2024-03-15',
      status: 'Completed',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/123'
    },
    {
      id: '2',
      name: 'Q1 Compliance Check',
      completionDate: '2024-03-01',
      status: 'Completed',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/456'
    },
    {
      id: '3',
      name: 'Network Security Assessment',
      completionDate: '2024-02-28',
      status: 'In Progress',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/789'
    }
  ];

  useEffect(() => {
    let filtered = [...mockAssessments];
    
    if (dateFilter !== 'all') {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
      
      filtered = filtered.filter(assessment => {
        const assessmentDate = new Date(assessment.completionDate);
        return dateFilter === 'last30' ? 
          assessmentDate >= thirtyDaysAgo : 
          assessmentDate < thirtyDaysAgo;
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.status === statusFilter);
    }

    filtered.sort((a, b) => 
      new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()
    );

    setFilteredAssessments(filtered);
  }, [dateFilter, statusFilter]);

  const { getStoredToken } = useAuthToken();

  const formatMessageWithLinks = (text: string): JSX.Element => {
      const parts = text.split('\n\nRelevant documents:\n');
      
      if (parts.length === 2) {
        const [messageText, urlsText] = parts;
        const references = urlsText.split('\n').map(url => {
          const fullUrl = url.trim();
          const fileName = fullUrl.replace('https://nextbharatventures-s25.s3.ap-south-1.amazonaws.com/ai_training_docs/', '');
          return { url: fullUrl, name: fileName };
        });
    
        return (
          <>
            <div className="mb-6">{messageText}</div>
            {references.length > 0 && (
              <div className="space-y-4">
                <div className="font-medium text-gray-700 mb-4 text-lg">Reference Documents:</div>
                {references.map((ref, index) => (
                  <a
                    key={index}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full p-5 bg-white rounded-xl shadow-md border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <FileText size={24} className="text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-800 text-lg">{decodeURIComponent(ref.name)}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        );
      }
  
      // If no document references, just return the text
      return <span>{text}</span>;
    };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      setIsMessageLoading(true);

      try {
        const token = getStoredToken();
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch('https://n8n-dev.subspace.money/webhook/chat_answere', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            question: message
          })
        });

        if (!response.ok) {
          throw new Error('Failed to get response from chat service');
        }

        const data = await response.json();
        let botResponseText = 'I apologize, but I could not process your request at this time.';
        
        if (data && data[0]?.output) {
          botResponseText = data[0].output;
          if (data[0].doc_urls && Array.isArray(data[0].doc_urls) && data[0].doc_urls.length > 0) {
            const formattedUrls = data[0].doc_urls.map((url: string) => {
              return url.replace('https://nextbharatventures-s25.s3.ap-south-1.amazonaws.com/ai_training_docs/', '');
            });
            botResponseText += '\n\nRelevant documents:\n' + formattedUrls.join('\n');
          }
        }

        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'I apologize, but there was an error processing your request. Please try again later.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        console.error('Chat error:', error);
      } finally {
        setIsMessageLoading(false);
      }
    }
  };

  // Add new state for loading
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sheetUrl.includes('docs.google.com/spreadsheets')) {
      setIsAnalyzing(true);
      try {
        const token = getStoredToken();
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch('https://n8n-dev.subspace.money/webhook/infosec/excel_starter1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            sheet_url: sheetUrl,
            start: 1 
          })
        });

        if (!response.ok) {
          throw new Error('Failed to analyze sheet');
        }

        const data = await response.json();
        setSheetData({
          url: sheetUrl,
          lastUpdated: new Date().toLocaleString()
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error('Sheet analysis error:', error);
        alert('Failed to analyze sheet. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      alert('Please enter a valid Google Sheets URL');
    }
  };

  const clearSheet = () => {
    setSheetData(null);
    setSheetUrl('');
    setShowSuccess(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  if (view === 'documents') {
    return <Documents onBack={() => setView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient flex flex-col items-center relative overflow-hidden">
      {/* Geometric Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Square */}
        <div className="animate-float-slow absolute top-[10%] left-[5%] w-20 h-20 border-2 border-purple-400/20 rotate-45"></div>
        {/* Triangle */}
        <div className="animate-float-medium absolute top-[25%] right-[8%]">
          <div className="w-0 h-0 border-l-[30px] border-l-transparent border-b-[45px] border-b-pink-400/20 border-r-[30px] border-r-transparent"></div>
        </div>
        {/* Circle */}
        <div className="animate-float-fast absolute bottom-[30%] left-[15%] w-24 h-24 border-2 border-purple-500/20 rounded-full"></div>
        {/* Rectangle */}
        <div className="animate-float-medium absolute top-[45%] right-[15%] w-32 h-16 border-2 border-pink-400/20 rotate-12"></div>
        {/* Diamond */}
        <div className="animate-float-slow absolute bottom-[15%] right-[10%] w-20 h-20 border-2 border-purple-400/20 rotate-45"></div>
        {/* Small Circles */}
        <div className="animate-float-fast absolute top-[20%] left-[25%] w-10 h-10 border-2 border-pink-500/20 rounded-full"></div>
        <div className="animate-float-medium absolute bottom-[25%] right-[25%] w-12 h-12 border-2 border-purple-400/20 rounded-full"></div>
      </div>

      {/* Existing Profile Modal */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setIsProfileOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100 opacity-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Profile Section */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex flex-col items-center text-center mb-4">
                  {userProfile.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-4 border-white shadow-lg mb-3 flex items-center justify-center">
                      <User size={40} className="text-white" />
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-800 text-lg">{userProfile.name}</h3>
                  <p className="text-gray-500">{userProfile.email}</p>
                </div>
              </div>
              
              {/* Settings */}
              <h3 className="font-medium text-gray-600 px-4">Preferences</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  {isDarkMode ? 
                    <Moon size={20} className="text-purple-600" /> : 
                    <Sun size={20} className="text-purple-600" />
                  }
                  <span className="font-medium text-gray-700">Dark Mode</span>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    isDarkMode ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  {notifications ? 
                    <Bell size={20} className="text-purple-600" /> : 
                    <BellOff size={20} className="text-purple-600" />
                  }
                  <span className="font-medium text-gray-700">Notifications</span>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    notifications ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={() => signOut()}
                className="w-full mt-4 p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Profile FAB */}
      <button
        onClick={() => setIsProfileOpen(true)}
        className="fixed bottom-8 left-8 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 z-50"
      >
        <User size={28} />
      </button>

      {/* Chat Interface */}
      <div className={`fixed right-8 bottom-28 w-[45vw] max-w-3xl bg-white rounded-2xl shadow-2xl transform transition-transform duration-300 z-40 ${isChatOpen ? 'translate-x-0' : 'translate-x-[120%]'}`}>
        <>
          <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl">
            <h3 className="text-white font-semibold">InfoSec Assistant</h3>
          </div>
          <div className="h-[60vh] overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="whitespace-pre-wrap">{formatMessageWithLinks(msg.text)}</div>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isMessageLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-2xl bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-6 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border-2 border-purple-100 rounded-full focus:outline-none focus:border-purple-300"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </>
      </div>
      {/* Chatbot FAB */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 z-50"
      >
        <MessageCircle size={28} className={`transform transition-transform duration-300 ${isChatOpen ? 'rotate-360' : ''}`} />
      </button>
      <div className="animated-bg" />
      <div className="w-full px-16 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            InfoSec
          </h1>
          <p className="mt-2 text-gray-600">Secure. Reliable. Professional.</p>
        </div>
      </div>
      <div className="w-full px-16 flex gap-8">
      {/* Left Section - InfoSec Sheet Upload */}
      <div className="flex-1 bg-white/90 backdrop-blur-md rounded-3xl p-5  shadow-2xl border border-white/20 ">
        <div className="flex items-center gap-4 max-h-full">
        <Table size={48} className="text-purple-500 ml-100" /><h2 className="text-2xl font-bold text-gray-800">Fill Your InfoSec</h2>
        </div>
        <div className="bg-gradient-to-br from-white/80 to-purple-50/30 rounded-2xl p-8 border border-white/50">
          {/* <div className="mb-4 flex justify-center">
            <div className="p-6 bg-purple-100 rounded-full">
              <Table size={48} className="text-purple-600" />
            </div>
          </div> */}
          <p className="text-gray-600 mb-6 text-center">
            Enter your Google Sheets URL to connect your InfoSec data
          </p>
          <form onSubmit={handleSheetSubmit} className="space-y-4">
            <div className="relative">
              <Link size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" />
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="Paste Google Sheets URL here"
                className="w-full pl-12 pr-4 py-4 border border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm"
                required
                disabled={isAnalyzing}
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing Sheet...
                </>
              ) : (
                <>
                  <Link size={20} />
                  Fill InfoSec Answer
                </>
              )}
            </button>
          </form>

          {isAnalyzing && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
              <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyzing Your Sheet</h3>
                <p className="text-gray-600">Please wait while we process your InfoSec data...</p>
                <p className="text-gray-600">You can view your progress on google Sheet</p>
              </div>
            </div>
          )}
        </div>

        {showSuccess && (
          <div className="mt-6 bg-green-50 text-green-700 p-4 rounded-full border-2 border-green-100 flex items-center justify-between animate-fade-in">
            <span>Google Sheet connected successfully!</span>
          </div>
        )}

        {sheetData && (
          <div className="mt-6 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Connected Sheet</h3>
              <button
                onClick={clearSheet}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="truncate">URL: {sheetData.url}</p>
              <p>Last Updated: {sheetData.lastUpdated}</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Section - Reference Documents */}
      <div className="flex-1 bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/20">
        <div className="flex items-center gap-4 ">
        <FolderOpen size={48} className="text-purple-600" /><h2 className="text-2xl font-bold text-gray-800">Reference Documents Library</h2>
        </div>
        <div className="bg-gradient-to-br from-white/80 to-purple-50/30 rounded-2xl p-8 border border-white/50">
          {/* <div className="mb-4 flex justify-center">
            <div className="p-6 bg-purple-100 rounded-full">
              <FolderOpen size={48} className="text-purple-600" />
            </div>
          </div> */}
          <p className="text-gray-600 mb-6 text-center">
            Access our comprehensive library of InfoSec documents and guidelines
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setView('documents')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FolderOpen size={20} />
              View All Documents
            </button>
          </div>
        </div>
      </div>
      </div>
      
      {/* Assessment History Section */}
      <div className="w-full px-16 mt-12 mb-24">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-2xl">
                <Shield size={32} className="text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">InfoSec History</h2>
            </div>
            <div className="flex gap-4">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-purple-100 rounded-xl bg-white/90 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="all">All Time</option>
                <option value="last30">Last 30 Days</option>
                <option value="older">Older</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-purple-100 rounded-xl bg-white/90 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="all">All Status</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredAssessments.map(assessment => (
              <div
                key={assessment.id}
                className="bg-white rounded-2xl p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="text-purple-500" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">{assessment.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <Calendar size={16} />
                        {new Date(assessment.completionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1 rounded-full text-sm font-medium
                      ${assessment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        assessment.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'}`}>
                      {assessment.status}
                    </span>
                    <a
                      href={assessment.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors duration-300 text-sm font-medium"
                    >
                      View Sheet
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;