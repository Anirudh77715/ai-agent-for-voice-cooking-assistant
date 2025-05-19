import React from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { FaClock } from 'react-icons/fa';
import IconWrapper from './IconWrapper';
import RecipeCard from './RecipeCard';

const LoadingRecipeCard: React.FC = () => (
  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md h-full">
    <div className="h-48 bg-gray-200 animate-pulse" />
    <div className="p-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
      <div className="flex justify-between">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="mt-4 h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="mt-2 h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="mt-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

const RecipeList: React.FC = () => {
  const { searchResults, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="my-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Finding Recipes...</h2>
          <div className="flex items-center">
            <IconWrapper icon={FaClock} className="text-blue-500 mr-1" />
            <span className="text-sm text-gray-600">Just a moment</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <LoadingRecipeCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 my-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          {searchResults.length} Recipes Found
        </h2>
        <div className="text-sm text-gray-500">
          Click on a recipe to start cooking!
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {searchResults.map((recipe, index) => (
          <RecipeCard key={recipe.id} recipe={recipe} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default RecipeList; 