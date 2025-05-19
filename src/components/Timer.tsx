import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPause, FaPlay, FaPlus, FaStop } from 'react-icons/fa';
import IconWrapper from './IconWrapper';

const CircularProgress: React.FC<{ percentage: number; size?: number }> = ({ 
  percentage, 
  size = 100 
}) => {
  const radius = size / 2 * 0.8;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percentage / 100);
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="w-full h-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={8}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="white"
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

const Timer: React.FC = () => {
  const { timer, isPaused, setTimer, setIsPaused, speak } = useAppContext();
  const [seconds, setSeconds] = useState<number>(0);
  const [initialSeconds, setInitialSeconds] = useState<number>(0);

  // Initialize seconds from context timer
  useEffect(() => {
    if (timer !== null) {
      setSeconds(timer);
      setInitialSeconds(timer);
    }
  }, [timer]);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (seconds > 0 && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds - 1;
          
          // Announce when reaching certain time points
          if (newSeconds === 60) {
            speak('One minute remaining.');
          } else if (newSeconds === 30) {
            speak('Thirty seconds remaining.');
          } else if (newSeconds === 10) {
            speak('Ten seconds remaining.');
          } else if (newSeconds === 0) {
            speak('Time is up!');
            if (setTimer) setTimer(null);
          }
          
          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [seconds, isPaused, speak, setTimer]);

  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const calculateProgress = (): number => {
    if (initialSeconds === 0) return 0;
    return (seconds / initialSeconds) * 100;
  };

  // Don't render if no timer is set
  if (timer === null || seconds <= 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed top-4 right-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg shadow-lg flex flex-col items-center z-30 overflow-hidden"
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="w-full bg-white/10 backdrop-blur-sm p-2 text-center">
          <span className="text-xs font-medium tracking-wider uppercase">Cooking Timer</span>
        </div>
        
        <div className="p-4 flex flex-col items-center">
          <div className="relative mb-2">
            <CircularProgress percentage={calculateProgress()} size={120} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-3xl font-bold">{formatTime(seconds)}</div>
              {initialSeconds > 0 && (
                <div className="text-xs opacity-80">{formatTime(initialSeconds)}</div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-2 w-full">
            <motion.button
              onClick={() => setSeconds(Math.min(seconds + 60, 3600))}
              className="flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconWrapper icon={FaPlus} className="mr-1 w-3 h-3" />
              +1m
            </motion.button>
            <motion.button
              onClick={() => {
                setIsPaused(!isPaused);
                speak(isPaused ? 'Timer resumed' : 'Timer paused');
              }}
              className="flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPaused ? (
                <>
                  <IconWrapper icon={FaPlay} className="mr-1 w-3 h-3" />
                  Resume
                </>
              ) : (
                <>
                  <IconWrapper icon={FaPause} className="mr-1 w-3 h-3" />
                  Pause
                </>
              )}
            </motion.button>
            <motion.button
              onClick={() => {
                setTimer(null);
                setSeconds(0);
                speak('Timer cancelled');
              }}
              className="flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconWrapper icon={FaStop} className="mr-1 w-3 h-3" />
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Timer; 