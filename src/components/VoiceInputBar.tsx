import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaPlus, FaKeyboard, FaExclamationTriangle, FaRedoAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import IconWrapper from './IconWrapper';

// Voice visualization component
const VoiceWaveform: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-1 h-5">
      {[1, 2, 3, 4, 5].map((bar) => (
        <motion.div
          key={bar}
          className="w-1.5 bg-white rounded-full"
          initial={{ height: 5 }}
          animate={{ 
            height: [5, 15, 5, 20, 5],
            transition: { 
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1,
              delay: bar * 0.1
            }
          }}
        />
      ))}
    </div>
  );
};

const VoiceInputBar: React.FC = () => {
  const { isListening, startListening, stopListening, interimTranscript, addIngredient, speak } = useAppContext();
  const [textInput, setTextInput] = useState('');
  const [showHint, setShowHint] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const lastPermissionCheck = useRef<number>(0);
  const clickDisabled = useRef<boolean>(false);
  
  // Fix: Wrap checkMicrophonePermission in useCallback
  const checkMicrophonePermission = React.useCallback(async (): Promise<boolean> => {
    // Only check once every 500ms at most
    const now = Date.now();
    if (now - lastPermissionCheck.current < 500) {
      return !permissionError;
    }
    lastPermissionCheck.current = now;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = "Your browser doesn't support microphone access";
        setPermissionError(errorMsg);
        setPermissionChecked(true);
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      stream.getTracks().forEach(track => track.stop());
      setPermissionError(null);
      setPermissionChecked(true);
      return true;
    } catch (error) {
      let errorMessage: string;
      if ((error as Error).name === 'NotAllowedError' || (error as Error).name === 'PermissionDeniedError') {
        errorMessage = 'Microphone access was denied. Please enable it in your browser settings.';
      } else if ((error as Error).name === 'NotFoundError') {
        errorMessage = 'No microphone detected. Please connect a microphone and try again.';
      } else {
        errorMessage = 'Error accessing your microphone. Please try again.';
      }
      setPermissionError(errorMessage);
      setPermissionChecked(true);
      return false;
    }
  }, [permissionError]);
  
  // Check for permission on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, [checkMicrophonePermission]);
  
  // Log when isListening changes for debugging
  useEffect(() => {
    console.log("Voice listening state changed:", isListening);
  }, [isListening]);

  // Handle errors that might occur during the session
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If the user returns to the page and we were previously listening, check permission again
      if (document.visibilityState === 'visible' && isListening) {
        console.log("Page became visible again, checking microphone permission");
        checkMicrophonePermission();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isListening, checkMicrophonePermission]);

  // Hide hint after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      addIngredient(textInput.trim());
      toast.success(`Added ${textInput.trim()} to your ingredients!`);
      setTextInput('');
    }
  };

  const resetVoiceRecognition = async () => {
    // First stop if already listening
    if (isListening) {
      stopListening();
    }
    
    // Clear any errors
    setSessionError(null);
    
    // Force a slight delay before checking permissions again
    setTimeout(async () => {
      const hasPermission = await checkMicrophonePermission();
      
      if (hasPermission) {
        toast.success("Voice recognition reset");
        setTimeout(() => {
          startListening();
          speak('Listening for your command...');
        }, 500);
      }
    }, 300);
  };

  const toggleListening = async () => {
    // Prevent rapid clicks
    if (clickDisabled.current) {
      console.log("Click ignored - debounce active");
      return;
    }
    
    // Set click debounce flag
    clickDisabled.current = true;
    setTimeout(() => {
      clickDisabled.current = false;
    }, 300); // Reduced from 1000ms to 300ms
    
    // Clear any previous error
    if (sessionError) {
      setSessionError(null);
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      // Check permissions before starting
      const hasPermission = await checkMicrophonePermission();
      
      if (hasPermission) {
        try {
          startListening();
          speak('Listening for your command...');
          console.log("Voice listening started");
        } catch (error) {
          console.error("Error starting voice recognition:", error);
          setSessionError("Failed to start voice recognition. Please try again.");
          stopListening();
          toast.error('Failed to start voice recognition. Please try again.', {
            duration: 3000,
            icon: <IconWrapper icon={FaExclamationTriangle} className="text-yellow-500 h-5 w-5" />
          });
        }
      } else {
        toast.error('Microphone access is required for voice commands', {
          duration: 5000,
          icon: <IconWrapper icon={FaExclamationTriangle} className="text-yellow-500 h-5 w-5" />
        });
      }
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div 
      className="fixed bottom-4 lg:bottom-8 left-0 right-0 mx-auto w-full max-w-3xl px-4 z-20"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
    >
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* Blur background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl"></div>
          
          {/* Content */}
          <div className="relative flex items-center p-1.5 overflow-hidden">
            <motion.button
              type="button"
              onClick={toggleListening}
              disabled={clickDisabled.current}
              className={`p-4 md:p-5 text-white focus:outline-none flex items-center justify-center rounded-xl shadow-lg transition-all z-10 ${
                permissionError || sessionError
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-orange-500/30' 
                  : isListening 
                      ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-500/30' 
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'
              }`}
              whileHover={{ scale: clickDisabled.current ? 1.0 : 1.05 }}
              whileTap={{ scale: clickDisabled.current ? 1.0 : 0.95 }}
              animate={isListening ? { 
                boxShadow: ['0 10px 15px -3px rgba(239, 68, 68, 0.3)', '0 10px 15px -3px rgba(236, 72, 153, 0.3)', '0 10px 15px -3px rgba(239, 68, 68, 0.3)'],
                transition: { duration: 2, repeat: Infinity } 
              } : {}}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
              title={permissionError || sessionError || (isListening ? 'Stop listening' : 'Start listening')}
            >
              {permissionError || sessionError ? (
                <IconWrapper icon={FaExclamationTriangle} className="h-5 w-5" />
              ) : isListening ? (
                <div className="flex items-center space-x-2">
                  <IconWrapper icon={FaMicrophoneSlash} className="h-5 w-5" />
                  <VoiceWaveform />
                </div>
              ) : (
                <IconWrapper icon={FaMicrophone} className="h-5 w-5" />
              )}
            </motion.button>
            
            {(permissionError || sessionError) && (
              <motion.button
                type="button"
                onClick={resetVoiceRecognition}
                className="ml-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-3 text-white focus:outline-none shadow-lg shadow-orange-500/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Reset voice recognition"
              >
                <IconWrapper icon={FaRedoAlt} className="h-4 w-4" />
              </motion.button>
            )}
            
            <div className="flex-1 flex items-center">
              <motion.div 
                className={`flex-1 relative overflow-hidden transition-all duration-300 ${
                  isExpanded || isListening ? 'w-full opacity-100' : 'w-0 opacity-0'
                }`}
                animate={{
                  width: isExpanded || isListening ? 'auto' : 0,
                  opacity: isExpanded || isListening ? 1 : 0,
                }}
              >
                <input
                  type="text"
                  placeholder={isListening ? interimTranscript || 'Listening...' : 'Type an ingredient or command...'}
                  value={isListening ? interimTranscript : textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full p-4 bg-transparent outline-none text-white text-lg placeholder-white/50 z-10"
                  disabled={isListening}
                />
                {isListening && (
                  <motion.span
                    className="absolute bottom-2.5 left-4 right-4 h-0.5 bg-white/30 rounded-full"
                    animate={{ 
                      scaleX: [0, 1, 0], 
                      opacity: [0.3, 0.6, 0.3] 
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              {!isExpanded && !isListening && (
                <motion.button
                  type="button"
                  onClick={toggleExpand}
                  className="ml-3 mr-2 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconWrapper icon={FaKeyboard} className="h-5 w-5" />
                </motion.button>
              )}
            </div>
            
            {(isExpanded || textInput) && !isListening && (
              <motion.button
                type="submit"
                className="mr-1.5 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-xl p-3 md:p-4 text-white focus:outline-none disabled:opacity-50 shadow-lg shadow-fuchsia-500/20"
                disabled={!textInput.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <IconWrapper icon={FaPlus} className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>
      </form>
      
      <AnimatePresence>
        {(permissionError || sessionError) && (
          <motion.div 
            className="mt-3 relative rounded-xl overflow-hidden backdrop-blur-xl"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
          >
            <div className="absolute inset-0 bg-yellow-900/30"></div>
            <div className="relative p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <IconWrapper icon={FaExclamationTriangle} className="text-yellow-500 h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-white/90 text-sm">{permissionError || sessionError}</p>
                </div>
                <button 
                  onClick={checkMicrophonePermission} 
                  className="ml-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 flex-shrink-0"
                  title="Check permission again"
                >
                  <IconWrapper icon={FaRedoAlt} className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      
        {isListening && !(permissionError || sessionError) && (
          <motion.div 
            className="mt-3 relative rounded-xl overflow-hidden backdrop-blur-xl"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative p-4 z-10">
              <h3 className="font-medium text-white mb-3 text-sm uppercase tracking-wider">Voice Commands:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm bg-white/10 p-3 rounded-lg text-white/80 border border-white/5 backdrop-blur-sm">
                  "Add ingredient chicken"
                </div>
                <div className="text-sm bg-white/10 p-3 rounded-lg text-white/80 border border-white/5 backdrop-blur-sm">
                  "Find recipes"
                </div>
                <div className="text-sm bg-white/10 p-3 rounded-lg text-white/80 border border-white/5 backdrop-blur-sm">
                  "Next step"
                </div>
                <div className="text-sm bg-white/10 p-3 rounded-lg text-white/80 border border-white/5 backdrop-blur-sm">
                  "Repeat"
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {showHint && !isListening && !isExpanded && !permissionError && !sessionError && (
          <motion.div 
            className="mt-3 relative rounded-xl overflow-hidden backdrop-blur-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
            <div className="relative py-3 px-4 z-10">
              <p className="text-sm text-white/80">
                <span className="text-fuchsia-300">Tip:</span> Click the microphone to start voice control! 🎤
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VoiceInputBar; 