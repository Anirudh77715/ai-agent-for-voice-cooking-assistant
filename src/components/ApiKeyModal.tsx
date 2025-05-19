import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { FaKey, FaTimes, FaSave } from 'react-icons/fa';
import IconWrapper from './IconWrapper';

const ApiKeyModal: React.FC = () => {
  const { apiKey, setApiKey } = useAppContext();
  const [inputValue, setInputValue] = useState(apiKey || '');
  const [isOpen, setIsOpen] = useState(!apiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputValue.trim());
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={openModal}
        className="fixed bottom-24 right-4 md:top-4 md:right-4 md:bottom-auto bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-full hover:from-indigo-600 hover:to-purple-700 focus:outline-none shadow-lg shadow-indigo-500/30 z-30"
        title="Configure API Key"
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
      >
        <IconWrapper icon={FaKey} className="h-5 w-5" />
      </motion.button>
    );
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="relative w-full max-w-lg mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {/* Glass card */}
        <div className="relative overflow-hidden rounded-2xl">
          {/* Background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-pink-600/30 backdrop-blur-xl border border-white/20 shadow-xl"></div>
          
          {/* Glowing orb */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
          
          {/* Content */}
          <div className="relative p-6 md:p-8 z-10">
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-4 right-4 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <IconWrapper icon={FaTimes} className="h-5 w-5" />
            </button>
            
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mr-4">
                <IconWrapper icon={FaKey} className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">API Key Required</h2>
                <p className="text-white/70">
                  Connect to Spoonacular API to access recipes
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-white/80 mb-2">
                  Spoonacular API Key
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="apiKey"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-white placeholder-white/40 transition-all outline-none"
                    placeholder="Enter your API key"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 -z-10 blur-md"></div>
                </div>
                <p className="mt-2 text-sm text-white/60">
                  Don't have a key? <a href="https://spoonacular.com/food-api/console#Dashboard" target="_blank" rel="noopener noreferrer" className="text-fuchsia-300 hover:underline">Get one for free here</a>.
                </p>
              </div>
              
              <div className="flex justify-end pt-2">
                <motion.button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white py-3 px-8 rounded-xl shadow-lg shadow-fuchsia-500/30 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <IconWrapper icon={FaSave} className="h-5 w-5" />
                  <span>Save API Key</span>
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ApiKeyModal; 