// Define Speech Recognition types
interface SpeechRecognitionType {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  onstart?: () => void;
}

declare global {
  interface Window { 
    SpeechRecognition?: new () => SpeechRecognitionType;
    webkitSpeechRecognition?: new () => SpeechRecognitionType;
    mozSpeechRecognition?: new () => SpeechRecognitionType;
    msSpeechRecognition?: new () => SpeechRecognitionType;
  }
}

// Check if speech recognition is supported in the browser
const isSpeechRecognitionSupported = (): boolean => {
  return !!(window.SpeechRecognition || 
            window.webkitSpeechRecognition || 
            window.mozSpeechRecognition || 
            window.msSpeechRecognition);
};

// Tracking the global state of speech recognition
type RecognitionState = 'inactive' | 'starting' | 'active' | 'stopping';

class WebSpeechService {
  recognition: SpeechRecognitionType | null;
  recognitionState: RecognitionState;
  transcript: string;
  onResult: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  retryCount: number;
  maxRetries: number;
  startPending: boolean;
  operationTimeoutId: number | null;
  isRecognitionSupported: boolean;

  constructor() {
    this.recognition = null;
    this.recognitionState = 'inactive';
    this.transcript = '';
    this.onResult = () => {};
    this.onError = () => {};
    this.retryCount = 0;
    this.maxRetries = 3;
    this.startPending = false;
    this.operationTimeoutId = null;
    this.isRecognitionSupported = isSpeechRecognitionSupported();
    
    if (this.isRecognitionSupported) {
      this.initializeSpeechRecognition();
    } else {
      console.error('Speech recognition is not supported in this browser');
    }
  }

  initializeSpeechRecognition() {
    try {
      // Try to get the SpeechRecognition object
      const SpeechRecognition = window.SpeechRecognition || 
                                window.webkitSpeechRecognition || 
                                window.mozSpeechRecognition || 
                                window.msSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.configureRecognition();
        console.log('Speech recognition initialized successfully');
      } else {
        console.error('Speech recognition not supported in this browser.');
        this.isRecognitionSupported = false;
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      this.isRecognitionSupported = false;
    }
  }

  configureRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = 'en-US';

    // Add event listeners
    this.recognition.onresult = this.handleRecognitionResult.bind(this);
    this.recognition.onerror = this.handleRecognitionError.bind(this);
    this.recognition.onend = this.handleRecognitionEnd.bind(this);
    
    // Add onstart handler for debugging
    this.recognition.onstart = () => {
      console.log('Speech recognition started event fired');
      this.recognitionState = 'active';
    };
  }

  clearOperationTimeout() {
    if (this.operationTimeoutId !== null) {
      window.clearTimeout(this.operationTimeoutId);
      this.operationTimeoutId = null;
    }
  }

  setOperationTimeout(callback: () => void, delay: number) {
    this.clearOperationTimeout();
    this.operationTimeoutId = window.setTimeout(() => {
      this.operationTimeoutId = null;
      callback();
    }, delay);
  }

  handleRecognitionEnd() {
    console.log('Speech recognition ended, current state:', this.recognitionState);
    
    // Mark as inactive
    if (this.recognitionState === 'stopping') {
      this.recognitionState = 'inactive';
      this.retryCount = 0;
      return;
    }
    
    // Auto-restart logic only if we're supposed to be active
    if (this.recognitionState === 'active') {
      this.retryCount++;
      
      if (this.retryCount <= this.maxRetries) {
        console.log(`Recognition ended unexpectedly. Restarting (retry ${this.retryCount} of ${this.maxRetries})...`);
        this.recognitionState = 'inactive';
        
        // Wait a moment before trying to restart
        this.setOperationTimeout(() => {
          this.startRecognitionProcess();
        }, 500);
      } else {
        console.error('Max retries exceeded, stopping speech recognition');
        this.recognitionState = 'inactive';
        this.retryCount = 0;
        this.onError('Speech recognition stopped unexpectedly after multiple retries. Please try again.');
      }
    } else {
      // For any other state, reset to inactive
      this.recognitionState = 'inactive';
    }
  }

  handleRecognitionResult(event: any) {
    // Confirm we're active when receiving results
    this.recognitionState = 'active';
    
    // Reset retry count on successful results
    this.retryCount = 0;
    
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript !== '') {
      this.transcript = finalTranscript;
      this.onResult(finalTranscript, true);
    } else if (interimTranscript !== '') {
      this.onResult(interimTranscript, false);
    }
  }

  handleRecognitionError(event: any) {
    console.error('Speech recognition error:', event.error);
    
    if (event.error === 'no-speech') {
      console.log('No speech detected, continuing to listen...');
      return;
    }

    if (event.error === 'not-allowed') {
      this.recognitionState = 'inactive';
      this.onError('Microphone access denied. Please allow microphone access in your browser settings.');
      return;
    }
    
    // For other errors, notify but don't necessarily stop
    this.onError(`Speech recognition error: ${event.error}. Please try again.`);
    
    // For network errors, we'll let the onend handler restart
    if (['network', 'aborted', 'audio-capture'].includes(event.error)) {
      // Let onend handler deal with restarting if needed
    } else {
      // For other errors, stop and reset
      this.recognitionState = 'inactive';
      this.retryCount = 0;
    }
  }

  startRecognitionProcess() {
    console.log('[WebSpeechService] startRecognitionProcess called');
    if (!this.isRecognitionSupported) {
      this.onError('Speech recognition is not supported in your browser.');
      return false;
    }

    if (!this.recognition) {
      this.initializeSpeechRecognition();
      if (!this.recognition) {
        this.onError('Speech recognition not supported in this browser.');
        return false;
      }
    }

    try {
      // Double-check we're in a state where we can start
      if (this.recognitionState !== 'inactive') {
        console.error(`[WebSpeechService] Cannot start recognition in state: ${this.recognitionState}`);
        return false;
      }
      
      this.recognitionState = 'starting';
      console.log('[WebSpeechService] Starting speech recognition...');
      
      // Set a timeout to detect if starting hangs
      this.setOperationTimeout(() => {
        if (this.recognitionState === 'starting') {
          console.warn('[WebSpeechService] Recognition start timeout - resetting state');
          this.recognitionState = 'inactive'; 
          this.onError('Starting speech recognition timed out. Please try again.');
        }
      }, 3000);
      
      // Start recognition
      this.recognition.start();
      // The state will be set to 'active' in the onstart handler
      this.clearOperationTimeout();
      console.log('[WebSpeechService] Speech recognition start command issued');
      return true;
    } catch (error) {
      console.error('[WebSpeechService] Error starting speech recognition:', error);
      this.recognitionState = 'inactive';
      this.clearOperationTimeout();
      this.onError(`Error starting speech recognition: ${(error as Error).message}. Please try again.`);
      return false;
    }
  }

  startListening(onResult: (text: string, isFinal: boolean) => void, onError: (error: string) => void) {
    console.log('[WebSpeechService] startListening called');
    if (!this.isRecognitionSupported) {
      onError('Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.');
      return false;
    }
    
    // Save callbacks
    this.onResult = onResult;
    this.onError = onError;
    
    // Reset retry count
    this.retryCount = 0;
    
    // Check current state
    console.log(`[WebSpeechService] Request to start listening. Current state: ${this.recognitionState}`);
    
    switch (this.recognitionState) {
      case 'inactive':
        // Good state for starting
        return this.startRecognitionProcess();
        
      case 'starting':
        // Already starting, ignore
        console.log('[WebSpeechService] Already starting recognition, ignoring duplicate request');
        return true;
        
      case 'active':
        // Already listening, ignore
        console.log('[WebSpeechService] Speech recognition is already active');
        return true;
        
      case 'stopping':
        // Try again after a delay
        console.log('[WebSpeechService] Recognition is stopping, will try to restart after a delay');
        this.setOperationTimeout(() => {
          this.startRecognitionProcess();
        }, 500);
        return true;
    }
  }

  stopListening() {
    // Check if we're not already stopping or inactive
    if (this.recognitionState === 'inactive' || this.recognitionState === 'stopping') {
      console.log(`Already ${this.recognitionState}, ignoring stop request`);
      return;
    }
    
    // Set state to stopping
    this.recognitionState = 'stopping';
    this.retryCount = 0;
    
    if (this.recognition) {
      try {
        console.log('Stopping speech recognition...');
        this.recognition.stop();
        
        // Set a timeout to reset state if stopping hangs
        this.setOperationTimeout(() => {
          if (this.recognitionState === 'stopping') {
            console.warn('Recognition stop timeout - force resetting state');
            this.recognitionState = 'inactive';
          }
        }, 3000);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        this.recognitionState = 'inactive';
      }
    } else {
      this.recognitionState = 'inactive';
    }
  }

  speak(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  getVoices() {
    return window.speechSynthesis.getVoices();
  }

  changeLanguage(lang: string) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
  
  getState(): RecognitionState {
    return this.recognitionState;
  }
  
  reset() {
    // Complete restart of speech recognition
    this.stopListening();
    
    // Give it a moment to stop completely
    setTimeout(() => {
      if (this.recognition) {
        // Re-create the recognition object
        this.recognition = null;
        this.recognitionState = 'inactive';
        this.retryCount = 0;
        this.initializeSpeechRecognition();
        console.log('Speech recognition service has been reset');
      }
    }, 500);
  }
  
  checkBrowserCompatibility(): boolean {
    return this.isRecognitionSupported;
  }
}

// Create a singleton instance
const webSpeechService = new WebSpeechService();
export default webSpeechService; 