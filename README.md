# Smart Voice Cooking Assistant

A voice-controlled cooking assistant that helps you find recipes based on ingredients you have and guides you through the cooking process step-by-step.

## Features

- **Voice Recognition**: Control the app hands-free using voice commands
- **Ingredient-Based Recipe Search**: Find recipes based on ingredients you have
- **Step-by-Step Guidance**: Get guided through each cooking step
- **Built-in Timers**: Automatic timers for cooking steps
- **Multi-Language Support**: Use the app in different languages
- **Text Input**: Type commands and ingredients if you prefer

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Voice Input**: Web Speech API (SpeechRecognition)
- **Voice Output**: Web Speech API (SpeechSynthesis)
- **Recipe Data**: Spoonacular API
- **Hosting**: Vercel (recommended)

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Get a free Spoonacular API key from [https://spoonacular.com/food-api](https://spoonacular.com/food-api)
4. Start the development server:
   ```
   npm start
   ```
5. Enter your API key when prompted

## Voice Commands

- "Add ingredient [ingredient name]" - Add an ingredient to your list
- "Find recipes" - Search for recipes using your ingredients
- "Next step" - Move to the next cooking step
- "Previous step" - Go back to the previous step
- "Repeat" - Repeat the current step
- "Pause timer" - Pause the active timer
- "Resume timer" - Resume the paused timer

## Browser Compatibility

This app works best in Chrome and Edge browsers which have the best support for the Web Speech API.

## License

MIT
# ai-agent-for-voice-cooking-assistant
