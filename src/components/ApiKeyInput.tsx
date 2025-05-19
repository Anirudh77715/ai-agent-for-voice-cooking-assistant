import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import recipeService from '../services/RecipeService';
import { FaKey, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import IconWrapper from './IconWrapper';

const ApiKeyInput: React.FC = () => {
  const { apiKey, setApiKey } = useAppContext();
  const [showApiKey, setShowApiKey] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputKey(e.target.value);
    setValidationResult(null);
  };

  const handleSave = () => {
    setApiKey(inputKey);
    localStorage.setItem('spoonacular-api-key', inputKey);
    if (!validationResult?.isValid) {
      testApiKey();
    }
  };

  const testApiKey = async () => {
    if (!inputKey.trim()) {
      setValidationResult({
        isValid: false,
        message: 'Please enter an API key',
      });
      return;
    }

    setIsValidating(true);
    try {
      const result = await recipeService.testApiKey();
      setValidationResult({
        isValid: result.success,
        message: result.message,
      });
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: 'Error testing API key',
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-xl shadow-lg dark:bg-gray-800">
      <div className="flex items-center space-x-2 mb-4">
        <IconWrapper icon={FaKey} className="text-indigo-500 text-xl" />
        <h2 className="text-lg font-medium text-gray-800 dark:text-white">API Key</h2>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          To use this app, you need a Spoonacular API key. You can get a free API key from{' '}
          <a 
            href="https://spoonacular.com/food-api/console#Dashboard" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Spoonacular's website
          </a>.
        </p>
      </div>
      
      <div className="relative">
        <input
          type={showApiKey ? 'text' : 'password'}
          value={inputKey}
          onChange={handleChange}
          placeholder="Enter your Spoonacular API Key"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
        />
        <button
          type="button"
          onClick={() => setShowApiKey(!showApiKey)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          {showApiKey ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      
      <div className="flex mt-4 gap-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
        >
          Save API Key
        </button>
        <button
          onClick={testApiKey}
          disabled={isValidating}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
        >
          {isValidating ? 'Testing...' : 'Test Key'}
        </button>
      </div>
      
      {validationResult && (
        <div className={`mt-4 p-3 rounded-lg flex items-start space-x-2 ${
          validationResult.isValid 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        }`}>
          {validationResult.isValid 
            ? <IconWrapper icon={FaCheck} className="mt-0.5 flex-shrink-0" />
            : <IconWrapper icon={FaTimes} className="mt-0.5 flex-shrink-0" />}
          <span>{validationResult.message}</span>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Note: Your API key is stored locally on your device and is never sent to our servers.</p>
      </div>
    </div>
  );
};

export default ApiKeyInput; 