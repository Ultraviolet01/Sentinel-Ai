/**
 * Sentinel AI: Operative Offscreen Voice Layer
 * Continuous background listening for wake words and tokens.
 */

// Define SpeechRecognition for TypeScript
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

class SentinelVoiceListener {
  private recognition: any;
  private isPermitted: boolean = true;
  private isRestarting: boolean = false;

  constructor() {
    this.initializeRecognition();
    console.log("[Sentinel_Offscreen] Voice-First Operative Listening Active.");
  }

  private initializeRecognition() {
    if (!SpeechRecognition) {
      console.error("[Sentinel_Offscreen] Speech Recognition not supported.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      // In continuous mode, the transcript grows. 
      // We process only the most recent results to avoid "transcript bloating".
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript.toLowerCase();
      }

      this.processTranscript(transcript);
    };

    this.recognition.onend = () => {
      console.log("[Sentinel_Offscreen] Recognition session ended.");
      // Keep active ONLY if permitted and not already in a restart cycle
      if (this.isPermitted && !this.isRestarting) {
        this.restartRecognition();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("[Sentinel_Offscreen] Recognition error:", event.error);
      if (event.error === 'not-allowed') {
        this.isPermitted = false;
        chrome.runtime.sendMessage({ action: "MIC_PERMISSION_DENIED" });
      }
      
      if (event.error === 'no-speech' || event.error === 'aborted') {
         // Silently restart for common transient errors
         this.restartRecognition();
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.error("[Sentinel_Offscreen] Failed to start recognition:", e);
    }
  }

  private restartRecognition() {
    if (this.isRestarting) return;
    this.isRestarting = true;
    
    // Safety delay to prevent browser throttling and allow cleanup
    setTimeout(() => {
      this.isRestarting = false;
      try {
        this.recognition.start();
      } catch (e) {
        // Recognition might already be running
      }
    }, 200);
  }

  private processTranscript(transcript: string) {
    const triggerWords = ["hey sentinel", "sentinel", "scan this", "audit this", "start scan"];
    const foundTrigger = triggerWords.find(word => transcript.includes(word));

    if (foundTrigger) {
      console.log("[Sentinel_Offscreen] One-Shot Trigger Detected:", transcript);
      
      // Send message to background
      chrome.runtime.sendMessage({ 
        action: "WAKE_WORD_DETECTED",
        transcript: transcript // Pass full context for future command extraction
      });

      // Crucial: Stop and restart to clear the internal transcript buffer
      this.recognition.stop();
      this.playPing();
    }
  }

  private playPing() {
     // A subtle audible cue that Sentinel is processing
     const ping = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFRm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YV9vT18A'); 
     ping.volume = 0.2;
     ping.play().catch(() => {});
  }
}

// Start listener
const listener = new SentinelVoiceListener();

// Handle cross-document audio playback (from Background)
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "PLAY_VOICE_RESULT" && request.audioBase64) {
    console.log("[Sentinel_Offscreen] Playing requested voice audit result...");
    const src = request.audioBase64.startsWith('data:audio') ? request.audioBase64 : `data:audio/mpeg;base64,${request.audioBase64}`;
    const audio = new Audio(src);
    audio.volume = 1.0;
    
    audio.play()
      .then(() => console.log("[Sentinel_Offscreen] Playback successful."))
      .catch((err) => console.error("[Sentinel_Offscreen] Playback blocked or failed:", err));
  }
});

