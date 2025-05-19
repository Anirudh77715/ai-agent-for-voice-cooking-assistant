import React from 'react';
import { Recipe } from '../services/RecipeService';
import { motion } from 'framer-motion';
import { FaHeart, FaUtensils } from 'react-icons/fa';
import IconWrapper from './IconWrapper';
import { useAppContext } from '../context/AppContext';

const RecipeCard: React.FC<{ recipe: Recipe; index: number }> = ({ recipe, index }) => {
  const { startCooking, speak } = useAppContext();
  
  const handleRecipeClick = () => {
    speak(`Loading ${recipe.title}. Let me get the details and prepare your cooking instructions.`);
    startCooking(recipe.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
      whileHover={{ y: -5 }}
      onClick={handleRecipeClick}
    >
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm">
          <IconWrapper 
            icon={FaHeart} 
            className={`h-4 w-4 ${recipe.likes > 50 ? 'text-red-500' : 'text-gray-400'}`} 
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="text-white font-medium text-lg line-clamp-2">{recipe.title}</h3>
        </div>
      </div>
      
      <div className="p-4 flex-grow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-blue-600 font-medium">
            <IconWrapper icon={FaUtensils} className="mr-1 w-4 h-4" />
            <span>{recipe.usedIngredientCount} matched</span>
          </div>
          {recipe.missedIngredientCount > 0 ? (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              {recipe.missedIngredientCount} missing
            </span>
          ) : (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Perfect match!
            </span>
          )}
        </div>
        
        <div className="mt-2">
          {recipe.usedIngredients.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-gray-500 block mb-1">Ingredients you have:</span>
              <div className="flex flex-wrap gap-1">
                {recipe.usedIngredients.slice(0, 3).map(ingredient => (
                  <span key={ingredient.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    {ingredient.name}
                  </span>
                ))}
                {recipe.usedIngredients.length > 3 && (
                  <span className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded-full">
                    +{recipe.usedIngredients.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 pt-0 mt-auto">
        <button
          className="w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white py-3 rounded-lg transition-colors flex items-center justify-center font-medium"
          onClick={(e) => {
            e.stopPropagation();
            handleRecipeClick();
          }}
        >
          <IconWrapper icon={FaUtensils} className="mr-2" />
          Cook This Recipe
        </button>
      </div>
    </motion.div>
  );
};

export default RecipeCard; 