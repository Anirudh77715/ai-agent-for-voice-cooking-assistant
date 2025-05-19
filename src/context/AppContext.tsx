import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import webSpeechService from '../services/WebSpeech';
import recipeService, { Recipe, RecipeDetail, Step } from '../services/RecipeService';

interface AppContextType {
  // Speech state
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  
  // Recipe state
  ingredients: string[];
  addIngredient: (ingredient: string) => void;
  removeIngredient: (index: number) => void;
  clearIngredients: () => void;
  
  // API key state
  apiKey: string;
  setApiKey: (key: string) => void;
  
  // Recipe search results
  searchResults: Recipe[];
  setSearchResults: (recipes: Recipe[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Current recipe being cooked
  currentRecipe: RecipeDetail | null;
  setCurrentRecipe: (recipe: RecipeDetail | null) => void;
  
  // Step-by-step guidance
  currentStep: number;
  setCurrentStep: (step: number) => void;
  timer: number | null;
  setTimer: (seconds: number | null) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  
  // Functions for voice commands
  searchRecipesByIngredients: () => void;
  startCooking: (recipeId: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  repeatStep: () => void;
  
  // Language
  language: string;
  setLanguage: (lang: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Speech state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Recipe state
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState(() => {
    // Load API key from localStorage if it exists
    const savedApiKey = localStorage.getItem('spoonacular-api-key');
    return savedApiKey || '';
  });
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<RecipeDetail | null>(null);
  
  // Cooking guidance state
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Language
  const [language, setLanguage] = useState('en-US');
  
  // Set API key to recipe service when it changes
  useEffect(() => {
    recipeService.setApiKey(apiKey);
  }, [apiKey]);
  
  // Initialize and configure web speech service
  useEffect(() => {
    webSpeechService.changeLanguage(language);
  }, [language]);

  const startListening = useCallback(() => {
    console.log('[AppContext] startListening called');
    setIsListening(true);
    webSpeechService.startListening(
      (text, isFinal) => {
        if (isFinal) {
          setTranscript(text);
          handleVoiceCommand(text);
          setInterimTranscript('');
        } else {
          setInterimTranscript(text);
        }
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      }
    );
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    webSpeechService.stopListening();
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    webSpeechService.speak(text, onEnd);
  }, []);

  const addIngredient = useCallback((ingredient: string) => {
    if (ingredient && !ingredients.includes(ingredient.toLowerCase())) {
      setIngredients(prev => [...prev, ingredient.toLowerCase()]);
    }
  }, [ingredients]);

  const removeIngredient = useCallback((index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearIngredients = useCallback(() => {
    setIngredients([]);
  }, []);

  const searchRecipesByIngredients = useCallback(async () => {
    if (ingredients.length === 0) {
      speak('Please add some ingredients first.');
      return;
    }

    setIsLoading(true);
    try {
      const results = await recipeService.searchRecipesByIngredients(ingredients);
      setSearchResults(results);
      
      if (results.length > 0) {
        speak(`I found ${results.length} recipes using your ingredients. The top result is ${results[0].title}.`);
      } else {
        speak('I couldn\'t find any recipes with these ingredients. Try adding more ingredients or try different ones.');
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      speak('Sorry, I encountered an error while searching for recipes. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [ingredients, speak]);

  const startCooking = useCallback(async (recipeId: number) => {
    setIsLoading(true);
    try {
      const recipe = await recipeService.getRecipeDetails(recipeId);
      setCurrentRecipe(recipe);
      setCurrentStep(0);
      
      // Announce the recipe
      speak(`Let's cook ${recipe.title}. This recipe serves ${recipe.servings} and takes about ${recipe.readyInMinutes} minutes to prepare.`);
      
      // After a short delay, read the first step
      setTimeout(() => {
        if (recipe.analyzedInstructions.length > 0 && recipe.analyzedInstructions[0].steps.length > 0) {
          const firstStep = recipe.analyzedInstructions[0].steps[0];
          speak(`Step 1: ${firstStep.step}`);
        }
      }, 3000);
    } catch (error) {
      console.error('Error getting recipe details:', error);
      speak('Sorry, I encountered an error while loading the recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [speak]);

  const nextStep = useCallback(() => {
    if (!currentRecipe || !currentRecipe.analyzedInstructions.length) return;
    
    const steps = currentRecipe.analyzedInstructions[0].steps;
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      const nextStepInfo = steps[currentStep + 1];
      speak(`Step ${nextStepInfo.number}: ${nextStepInfo.step}`);
      
      // If the step has a timer, start it
      if (nextStepInfo.length) {
        const seconds = nextStepInfo.length.number * (nextStepInfo.length.unit === 'minutes' ? 60 : 1);
        setTimer(seconds);
        speak(`I'll set a timer for ${nextStepInfo.length.number} ${nextStepInfo.length.unit}.`);
      } else {
        setTimer(null);
      }
    } else {
      speak('That was the final step! Your dish is ready. Enjoy your meal!');
    }
  }, [currentRecipe, currentStep, speak]);

  const previousStep = useCallback(() => {
    if (!currentRecipe || !currentRecipe.analyzedInstructions.length) return;
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevStepInfo = currentRecipe.analyzedInstructions[0].steps[currentStep - 1];
      speak(`Going back to step ${prevStepInfo.number}: ${prevStepInfo.step}`);
    } else {
      speak('This is the first step.');
    }
  }, [currentRecipe, currentStep, speak]);

  const repeatStep = useCallback(() => {
    if (!currentRecipe || !currentRecipe.analyzedInstructions.length) return;
    
    const steps = currentRecipe.analyzedInstructions[0].steps;
    if (steps.length > 0 && currentStep < steps.length) {
      const currentStepInfo = steps[currentStep];
      speak(`Step ${currentStepInfo.number}: ${currentStepInfo.step}`);
    }
  }, [currentRecipe, currentStep, speak]);

  // Voice command processing
  const handleVoiceCommand = useCallback((command: string) => {
    // Create a local command string to prevent scoping issues
    const lowerCommand = command.toLowerCase().trim();
    console.log('Processing voice command:', lowerCommand);
    
    // Search commands
    if (lowerCommand.includes('find recipes') || 
        lowerCommand.includes('search recipes') || 
        lowerCommand.includes('look for recipes') || 
        lowerCommand === 'find recipe' || 
        lowerCommand === 'search' ||
        lowerCommand === 'search recipe') {
      searchRecipesByIngredients();
      return;
    }
    
    // Ingredient commands
    const addIngredientMatch = lowerCommand.match(/add (?:ingredient |ingredients )?(.*)/i) || 
                              lowerCommand.match(/at ingredient (.*)/i); // Common misrecognition
    
    if (addIngredientMatch && addIngredientMatch[1]) {
      const ingredient = addIngredientMatch[1].trim();
      if (ingredient && ingredient.length > 1) {
        addIngredient(ingredient);
        speak(`Added ${ingredient} to your ingredients.`);
        return;
      }
    }
    
    if (lowerCommand.includes('clear ingredients') || 
        lowerCommand.includes('remove ingredients') ||
        lowerCommand === 'clear all' ||
        lowerCommand === 'start over') {
      clearIngredients();
      speak('Ingredients cleared.');
      return;
    }
    
    // Cooking navigation commands
    if (lowerCommand.includes('next step') || 
        lowerCommand === 'next' ||
        lowerCommand === 'continue' ||
        lowerCommand === 'go on' ||
        lowerCommand === "whats next") {
      nextStep();
      return;
    }
    
    if (lowerCommand.includes('previous step') || 
        lowerCommand === 'back' || 
        lowerCommand === 'go back' ||
        lowerCommand === 'previous') {
      previousStep();
      return;
    }
    
    if (lowerCommand.includes('repeat') || 
        lowerCommand === 'again' || 
        lowerCommand === 'say again' ||
        lowerCommand === 'what was that' ||
        lowerCommand.includes('repeat step')) {
      repeatStep();
      return;
    }

    // Timer commands
    if (lowerCommand.includes('pause timer') || lowerCommand === 'pause') {
      setIsPaused(true);
      speak('Timer paused');
      return;
    }

    if (lowerCommand.includes('resume timer') || lowerCommand === 'resume' || lowerCommand === 'continue timer') {
      setIsPaused(false);
      speak('Timer resumed');
      return;
    }

    // Help command
    if (lowerCommand === 'help' || lowerCommand === 'what can i say' || lowerCommand.includes('commands')) {
      speak('You can say: Add ingredient, find recipes, next step, previous step, repeat, pause timer, or resume timer.');
      return;
    }
    
    // If no command matched, provide feedback
    speak("I didn't understand. Try saying 'Add ingredient chicken' or 'Find recipes'.");
  }, [addIngredient, clearIngredients, nextStep, previousStep, repeatStep, searchRecipesByIngredients, setIsPaused, speak]);

  return (
    <AppContext.Provider
      value={{
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        speak,
        ingredients,
        addIngredient,
        removeIngredient,
        clearIngredients,
        apiKey,
        setApiKey,
        searchResults,
        setSearchResults,
        isLoading,
        setIsLoading,
        currentRecipe,
        setCurrentRecipe,
        currentStep,
        setCurrentStep,
        timer,
        setTimer,
        isPaused,
        setIsPaused,
        searchRecipesByIngredients,
        startCooking,
        nextStep,
        previousStep,
        repeatStep,
        language,
        setLanguage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 