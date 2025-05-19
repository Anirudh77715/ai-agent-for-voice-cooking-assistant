import React from 'react';
import { motion } from 'framer-motion';
import { FaCog } from 'react-icons/fa';
import ApiKeyInput from './ApiKeyInput';
import { useAppContext } from '../context/AppContext';
import IconWrapper from './IconWrapper';

const SettingsPage: React.FC = () => {
  const { speak } = useAppContext();

  const testSpeechSynthesis = () => {
    speak('Hello! This is a test of the speech synthesis. If you can hear this message, speech synthesis is working correctly on your device.');
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-8">
        <IconWrapper icon={FaCog} className="text-indigo-600 text-3xl mr-2" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">API Configuration</h2>
          <ApiKeyInput />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Voice Settings</h2>
          <div className="bg-white rounded-xl shadow-lg p-4 dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Speech Synthesis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Test if speech synthesis is working properly on your device.
            </p>
            <button
              onClick={testSpeechSynthesis}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
            >
              Test Speech Synthesis
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 mt-6 dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Speech Recognition</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              This app uses your browser's speech recognition capabilities. For the best experience:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mb-4 space-y-2">
              <li>Use a modern browser like Chrome, Edge, or Safari</li>
              <li>Allow microphone access when prompted</li>
              <li>Speak clearly and at a moderate pace</li>
              <li>Use the app in a quiet environment</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 mt-6 dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Browser Compatibility</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Speech recognition is best supported in:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mb-4">
              <li>Google Chrome</li>
              <li>Microsoft Edge</li>
              <li>Safari (iOS 14.5+ and macOS)</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Firefox and other browsers may have limited or no support for the Web Speech API.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage; 