import React from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import IconWrapper from './IconWrapper';

const IngredientsList: React.FC = () => {
  const { ingredients, removeIngredient, clearIngredients, searchRecipesByIngredients, speak } = useAppContext();

  const handleSearch = () => {
    if (ingredients.length === 0) {
      toast.error('Please add some ingredients first.');
      speak('Please add some ingredients first.');
      return;
    }
    
    speak(`Searching for recipes with ${ingredients.join(', ')}`);
    searchRecipesByIngredients();
    toast.success('Searching for delicious recipes!');
  };

  const handleRemoveIngredient = (index: number, name: string) => {
    removeIngredient(index);
    toast.success(`Removed ${name} from your ingredients.`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (ingredients.length === 0) {
    return (
      <motion.div 
        className="bg-white rounded-xl shadow-lg p-8 my-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center py-10">
          <motion.div 
            className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 10 }}
            transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
          >
            <IconWrapper icon={FaPlus} className="h-8 w-8 text-blue-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No ingredients yet</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Add ingredients you have and I'll find recipes you can make with them!
          </p>
          <div className="text-center bg-blue-50 p-4 rounded-lg inline-block">
            <p className="font-medium text-blue-700 mb-2">Try saying:</p>
            <p className="text-blue-800 font-bold">"Add ingredient chicken"</p>
            <p className="text-blue-800 font-bold mt-1">"Add ingredient tomatoes"</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6 my-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Ingredients</h2>
        <motion.button
          onClick={() => {
            clearIngredients();
            toast.success('All ingredients cleared');
          }}
          className="flex items-center text-red-500 hover:text-red-600 font-medium text-sm bg-red-50 py-2 px-3 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <IconWrapper icon={FaTrash} className="mr-1 h-3 w-3" />
          Clear All
        </motion.button>
      </div>
      
      <motion.div 
        className="flex flex-wrap gap-2 mb-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence>
          {ingredients.map((ingredient, index) => (
            <motion.div
              key={`${ingredient}-${index}`}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full flex items-center shadow-sm"
              variants={item}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: -50 }}
              whileHover={{ scale: 1.05 }}
              layout
            >
              <span className="mr-1">{ingredient}</span>
              <button
                onClick={() => handleRemoveIngredient(index, ingredient)}
                className="ml-2 text-white hover:text-red-200 focus:outline-none transition-colors"
                aria-label={`Remove ${ingredient}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      <motion.button
        onClick={handleSearch}
        className="w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white py-4 px-4 rounded-lg transition-colors font-medium text-lg flex items-center justify-center shadow-md"
        whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
        whileTap={{ scale: 0.98 }}
      >
        <IconWrapper icon={FaSearch} className="mr-2" />
        Find Recipes with These Ingredients
      </motion.button>
      <p className="text-center mt-3 text-sm text-gray-500">
        Or say "Find recipes with these ingredients"
      </p>
    </motion.div>
  );
};

export default IngredientsList; 