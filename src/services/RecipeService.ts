import axios from 'axios';

// Types for Recipe API
export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: Ingredient[];
  usedIngredients: Ingredient[];
  unusedIngredients: Ingredient[];
  likes: number;
}

export interface Ingredient {
  id: number;
  amount: number;
  unit: string;
  unitLong: string;
  unitShort: string;
  aisle: string;
  name: string;
  original: string;
  originalName: string;
  meta: string[];
  image: string;
}

export interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  sourceUrl: string;
  summary: string;
  instructions: string;
  analyzedInstructions: AnalyzedInstruction[];
  extendedIngredients: ExtendedIngredient[];
}

export interface AnalyzedInstruction {
  name: string;
  steps: Step[];
}

export interface Step {
  number: number;
  step: string;
  ingredients: StepItem[];
  equipment: StepItem[];
  length?: {
    number: number;
    unit: string;
  };
}

export interface StepItem {
  id: number;
  name: string;
  localizedName: string;
  image: string;
}

export interface ExtendedIngredient {
  id: number;
  aisle: string;
  image: string;
  consistency: string;
  name: string;
  nameClean: string;
  original: string;
  originalName: string;
  amount: number;
  unit: string;
  meta: string[];
  measures: {
    us: {
      amount: number;
      unitShort: string;
      unitLong: string;
    };
    metric: {
      amount: number;
      unitShort: string;
      unitLong: string;
    };
  };
}

export interface ApiStatus {
  success: boolean;
  message: string;
}

class RecipeService {
  private apiKey: string;
  private baseUrl: string;
  private isApiKeyValid: boolean;

  constructor() {
    // This will be replaced with actual API key from user
    this.apiKey = '';
    this.baseUrl = 'https://api.spoonacular.com';
    this.isApiKeyValid = false;
  }

  setApiKey(key: string) {
    this.apiKey = key.trim();
    // Reset validation status when key changes
    this.isApiKeyValid = false;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  isKeyValid(): boolean {
    return this.isApiKeyValid;
  }

  private validateApiKey() {
    if (!this.apiKey) {
      throw new Error('API key is required. Please set your Spoonacular API key in the settings.');
    }
  }

  async testApiKey(): Promise<ApiStatus> {
    try {
      if (!this.apiKey) {
        return { 
          success: false, 
          message: 'No API key provided. Please enter your Spoonacular API key.' 
        };
      }

      // Use a simple endpoint to test the API key
      const response = await axios.get(`${this.baseUrl}/recipes/random`, {
        params: {
          apiKey: this.apiKey,
          number: 1
        }
      });
      
      this.isApiKeyValid = true;
      return { 
        success: true, 
        message: 'API key is valid!' 
      };
    } catch (error: any) {
      this.isApiKeyValid = false;
      
      // Handle specific error responses
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401 || error.response.status === 403) {
          return { 
            success: false, 
            message: 'Invalid API key. Please check your Spoonacular API key and try again.' 
          };
        }
        return { 
          success: false, 
          message: `API Error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}` 
        };
      } else if (error.request) {
        // The request was made but no response was received
        return { 
          success: false, 
          message: 'No response from API server. Please check your internet connection and try again.' 
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return { 
          success: false, 
          message: `Request Error: ${error.message}` 
        };
      }
    }
  }

  async searchRecipesByIngredients(ingredients: string[], number: number = 5) {
    try {
      this.validateApiKey();
      
      const response = await axios.get(`${this.baseUrl}/recipes/findByIngredients`, {
        params: {
          ingredients: ingredients.join(','),
          number,
          apiKey: this.apiKey,
          ranking: 1, // Maximize used ingredients
          ignorePantry: true // Ignore common ingredients like salt, oil
        }
      });
      
      this.isApiKeyValid = true;
      return response.data as Recipe[];
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.isApiKeyValid = false;
        throw new Error('Invalid API key. Please check your Spoonacular API key in the settings.');
      }
      console.error('Error searching recipes by ingredients:', error);
      throw error;
    }
  }

  async getRecipeDetails(recipeId: number) {
    try {
      this.validateApiKey();
      
      const response = await axios.get(`${this.baseUrl}/recipes/${recipeId}/information`, {
        params: {
          apiKey: this.apiKey,
          includeNutrition: false
        }
      });
      
      this.isApiKeyValid = true;
      return response.data as RecipeDetail;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.isApiKeyValid = false;
        throw new Error('Invalid API key. Please check your Spoonacular API key in the settings.');
      }
      console.error('Error getting recipe details:', error);
      throw error;
    }
  }

  async searchRecipesByQuery(query: string, number: number = 5) {
    try {
      this.validateApiKey();
      
      const response = await axios.get(`${this.baseUrl}/recipes/complexSearch`, {
        params: {
          query,
          number,
          apiKey: this.apiKey,
          addRecipeInformation: true,
          fillIngredients: true
        }
      });
      
      this.isApiKeyValid = true;
      return response.data.results;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.isApiKeyValid = false;
        throw new Error('Invalid API key. Please check your Spoonacular API key in the settings.');
      }
      console.error('Error searching recipes by query:', error);
      throw error;
    }
  }
}

const recipeService = new RecipeService();
export default recipeService; 