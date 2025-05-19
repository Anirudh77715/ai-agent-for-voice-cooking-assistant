import React, { useState } from 'react';
import './App.css';
import { AppProvider, useAppContext } from './context/AppContext';
import IngredientsList from './components/IngredientsList';
import VoiceInputBar from './components/VoiceInputBar';
import RecipeList from './components/RecipeList';
import RecipeInstructions from './components/RecipeInstructions';
import ApiKeyModal from './components/ApiKeyModal';
import LanguageSelector from './components/LanguageSelector';
import SettingsPage from './components/SettingsPage';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { FaHome, FaBook, FaUtensils, FaHistory, FaCog, FaMicrophone } from 'react-icons/fa';
import IconWrapper from './components/IconWrapper';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <MainContent activeTab={activeTab} />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(79, 70, 229, 0.9)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              borderRadius: '12px',
              padding: '12px 20px',
            },
          }}
        />
      </div>
    </AppProvider>
  );
};

// Navigation Sidebar
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: FaHome },
    { id: 'recipes', label: 'Recipes', icon: FaBook },
    { id: 'ingredients', label: 'Ingredients', icon: FaUtensils },
    { id: 'history', label: 'History', icon: FaHistory },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];
  
  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="hidden lg:flex flex-col w-64 bg-black/20 backdrop-blur-xl shadow-xl h-screen sticky top-0 p-5 border-r border-white/10"
    >
      <div className="flex items-center mb-10 pl-2">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0l-2.828 2.828m0-16.97a9 9 0 0112.728 0M6.343 6.343a9 9 0 1112.728 12.728L12 12l-5.657 5.657a9 9 0 010-12.728" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white">Voice Chef</h1>
      </div>

      <div className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <IconWrapper icon={item.icon} className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-pill"
                className="ml-auto h-2 w-2 rounded-full bg-white"
              />
            )}
          </button>
        ))}
      </div>

      <div className="mt-auto">
        <LanguageSelector />
      </div>
    </motion.div>
  );
};

// Main Content Container
interface MainContentProps {
  activeTab: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <Header activeTab={activeTab} />
      <div className="p-4 md:p-8">
        {activeTab === 'settings' ? <SettingsPage /> : <AppContent />}
      </div>
      <VoiceInputBar />
    </div>
  );
};

// Header Component
const Header: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { apiKey } = useAppContext();

  // Only show standard header content for home tab
  if (activeTab === 'settings') {
    return (
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative bg-gradient-to-r from-indigo-500/30 to-purple-500/30 backdrop-blur-md border-b border-white/10 p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 z-0"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            Settings
          </h1>
          <p className="text-white/80 max-w-2xl">
            Configure your API key and voice recognition settings
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="relative bg-gradient-to-r from-indigo-500/30 to-purple-500/30 backdrop-blur-md border-b border-white/10 p-6 md:p-10"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 z-0"></div>
      <div className="max-w-5xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
          Smart Voice <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400">Cooking Assistant</span>
        </h1>
        <p className="text-white/80 text-lg max-w-2xl">
          Your AI-powered kitchen companion that listens, suggests recipes, and guides you through cooking.
        </p>

        <div className="mt-6 md:mt-8 flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/40 font-medium flex items-center space-x-2"
          >
            <IconWrapper icon={FaMicrophone} className="h-5 w-5" />
            <span>Start Cooking</span>
          </motion.button>

          {!apiKey && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white py-3 px-8 rounded-xl border border-white/20 shadow-lg font-medium"
            >
              Configure API Key
            </motion.button>
          )}
        </div>
    </div>
    </motion.div>
  );
};

// Separate component to use the context
const AppContent: React.FC = () => {
  const { currentRecipe, isLoading, apiKey } = useAppContext();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 min-h-[40vh]">
        <div className="relative w-20 h-20">
          <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl opacity-70"></div>
          </div>
        </div>
        <p className="mt-8 text-xl text-white font-medium">Preparing your cooking experience...</p>
      </div>
    );
  }

  // Show a welcome screen if no API key is provided yet
  if (!apiKey) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-8 my-6 transition-all duration-300 hover:shadow-2xl"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome, Chef!</h2>
          <p className="text-white/80 mb-6">
            To access thousands of recipes and advanced voice features, please add your 
            Spoonacular API key using the settings button.
          </p>
          
          <div className="p-6 bg-indigo-900/40 border border-indigo-500/30 rounded-xl shadow-inner">
            <h3 className="font-medium text-indigo-300 mb-3 text-lg">Voice Commands You Can Try:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white/10 p-3 rounded-lg text-white/80 flex items-center border border-white/10">
                <span className="text-indigo-300 mr-2">🗣️</span> "Add ingredient chicken"
              </div>
              <div className="bg-white/10 p-3 rounded-lg text-white/80 flex items-center border border-white/10">
                <span className="text-indigo-300 mr-2">🗣️</span> "Find recipes"
              </div>
              <div className="bg-white/10 p-3 rounded-lg text-white/80 flex items-center border border-white/10">
                <span className="text-indigo-300 mr-2">🗣️</span> "Next step"
              </div>
              <div className="bg-white/10 p-3 rounded-lg text-white/80 flex items-center border border-white/10">
                <span className="text-indigo-300 mr-2">🗣️</span> "Repeat that"
              </div>
            </div>
          </div>
        </div>
        
        <ApiKeyModal />
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <div className="max-w-5xl mx-auto">
        {currentRecipe ? (
          <motion.div
            key="recipe-instructions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6 my-6"
          >
            <RecipeInstructions />
          </motion.div>
        ) : (
          <motion.div
            key="ingredients-search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6">
                  <IngredientsList />
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6">
                  <RecipeList />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default App;
