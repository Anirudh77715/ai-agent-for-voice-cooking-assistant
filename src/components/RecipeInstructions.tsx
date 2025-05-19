import React from 'react';
import { useAppContext } from '../context/AppContext';
import Timer from './Timer';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaUndo, FaCheck, FaUtensils } from 'react-icons/fa';
import IconWrapper from './IconWrapper';

const RecipeInstructions: React.FC = () => {
  const { currentRecipe, currentStep, nextStep, previousStep, repeatStep, speak, setCurrentRecipe } = useAppContext();

  if (!currentRecipe) {
    return null;
  }

  const steps = currentRecipe.analyzedInstructions.length > 0
    ? currentRecipe.analyzedInstructions[0].steps
    : [];

  const currentStepInfo = steps[currentStep] || null;
  
  // Calculate progress percentage
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      nextStep();
    } else {
      speak('You have completed all steps! Enjoy your meal!');
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleRepeat = () => {
    repeatStep();
  };
  
  const handleFinish = () => {
    speak('Great job! You\'ve completed the recipe. I hope it\'s delicious!');
    setCurrentRecipe(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-xl p-6 my-6"
    >
      <div className="relative mb-6">
        {currentRecipe.image && (
          <div className="relative h-40 sm:h-48 md:h-56 w-full overflow-hidden rounded-lg mb-4">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
            <img 
              src={currentRecipe.image} 
              alt={currentRecipe.title} 
              className="w-full h-full object-cover"
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-full p-4 z-20"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">{currentRecipe.title}</h1>
              <div className="flex items-center mt-2 text-white text-sm space-x-4">
                <span className="flex items-center">
                  <IconWrapper icon={FaUtensils} className="mr-1" />
                  <span>{currentRecipe.servings} servings</span>
                </span>
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{currentRecipe.readyInMinutes} minutes</span>
                </span>
              </div>
            </motion.div>
          </div>
        )}
        
        <button 
          onClick={handleFinish}
          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-colors z-30"
          aria-label="Close recipe"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
          <span>Progress</span>
          <span>Step {currentStep + 1} of {steps.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
      </div>
      
      {/* Current step */}
      {currentStepInfo && (
        <motion.div 
          className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6 mb-6"
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-3">
            <div className="bg-blue-500 text-white text-lg w-8 h-8 rounded-full flex items-center justify-center mr-3">
              {currentStepInfo.number}
            </div>
            <h2 className="text-xl font-bold text-gray-800">Step {currentStepInfo.number}</h2>
          </div>
          
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            {currentStepInfo.step}
          </p>
          
          {/* Equipment and ingredients used in this step */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-4">
            {currentStepInfo.equipment?.length > 0 && (
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  Equipment:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentStepInfo.equipment.map((item) => (
                    <span
                      key={item.id}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {currentStepInfo.ingredients?.length > 0 && (
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Ingredients:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentStepInfo.ingredients.map((item) => (
                    <span
                      key={item.id}
                      className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Navigation controls */}
      <div className="flex justify-between items-center">
        <motion.button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`flex items-center px-4 py-2 rounded-lg ${
            currentStep === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          whileHover={currentStep !== 0 ? { scale: 1.05 } : {}}
          whileTap={currentStep !== 0 ? { scale: 0.95 } : {}}
        >
          <IconWrapper icon={FaArrowLeft} className="mr-2" />
          Previous
        </motion.button>
        
        <motion.button
          onClick={handleRepeat}
          className="flex items-center px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <IconWrapper icon={FaUndo} className="mr-2" />
          Repeat
        </motion.button>
        
        {currentStep < steps.length - 1 ? (
          <motion.button
            onClick={handleNext}
            className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 text-white hover:from-blue-600 hover:to-teal-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Next
            <IconWrapper icon={FaArrowRight} className="ml-2" />
          </motion.button>
        ) : (
          <motion.button
            onClick={handleFinish}
            className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-400 text-white hover:from-green-600 hover:to-teal-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Finish
            <IconWrapper icon={FaCheck} className="ml-2" />
          </motion.button>
        )}
      </div>
      
      {/* Voice commands help */}
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h3 className="font-medium text-gray-700 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Voice Commands
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="bg-white p-2 rounded border border-blue-50 text-sm text-blue-700 flex items-center">
            <span className="font-semibold mr-2">"Next step"</span> 
            <span className="text-gray-500">→ next instruction</span>
          </div>
          <div className="bg-white p-2 rounded border border-blue-50 text-sm text-blue-700 flex items-center">
            <span className="font-semibold mr-2">"Previous step"</span>
            <span className="text-gray-500">→ go back</span>
          </div>
          <div className="bg-white p-2 rounded border border-blue-50 text-sm text-blue-700 flex items-center">
            <span className="font-semibold mr-2">"Repeat"</span>
            <span className="text-gray-500">→ repeat instruction</span>
          </div>
          <div className="bg-white p-2 rounded border border-blue-50 text-sm text-blue-700 flex items-center">
            <span className="font-semibold mr-2">"Pause timer"</span>
            <span className="text-gray-500">→ pause timer</span>
          </div>
          <div className="bg-white p-2 rounded border border-blue-50 text-sm text-blue-700 flex items-center">
            <span className="font-semibold mr-2">"Resume timer"</span>
            <span className="text-gray-500">→ continue timer</span>
          </div>
        </div>
      </div>
      
      {/* Timer component will render conditionally */}
      <Timer />
    </motion.div>
  );
};

export default RecipeInstructions; 