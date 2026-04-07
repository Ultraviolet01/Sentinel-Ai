/**
 * Sentinel AI: Operative Offscreen Voice Layer
 * Manual "One-Shot" listening for user-triggered commands.
 */

// Define SpeechRecognition for TypeScript
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

class SentinelVoiceListener {
  private recognition: any;
  private isPermitted: boolean = true;
  private timeoutId: any;

  constructor() {
    this.initializeRecognition();
    console.log("[Sentinel_Offscreen] Manual Trigger Listening Engine Initialized.");
  }

  private initializeRecognition() {
    if (!SpeechRecognition) {
      console.error("[Sentinel_Offscreen] Speech Recognition not supported.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false; // "One-Shot" mode
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript.toLowerCase())
        .join('');

      if (event.results[0].isFinal) {
        this.handleCapturedCommand(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("[Sentinel_Offscreen] Recognition error:", event.error);
      if (event.error === 'not-allowed') {
        this.isPermitted = false;
        chrome.runtime.sendMessage({ action: "MIC_PERMISSION_DENIED" });
      }
      this.stopListening();
    };

    this.recognition.onend = () => {
      console.log("[Sentinel_Offscreen] Recognition session ended.");
    };
  }

  public startListening() {
    if (!this.isPermitted) {
       chrome.runtime.sendMessage({ action: "MIC_PERMISSION_DENIED" });
       return;
    }

    try {
      this.recognition.start();
      console.log("[Sentinel_Offscreen] Now listening for manual command...");
      
      // Auto-stop after 8 seconds of silence to save resources
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        console.warn("[Sentinel_Offscreen] Listening timeout reached.");
        this.stopListening();
      }, 8000);

    } catch (e) {
      console.warn("[Sentinel_Offscreen] Could not start, likely already active.");
    }
  }

  private stopListening() {
    try {
      this.recognition.stop();
    } catch (e) {}
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  private handleCapturedCommand(transcript: string) {
    this.stopListening();
    console.log("[Sentinel_Offscreen] Captured Command:", transcript);
    
    // Broadcast back to background
    chrome.runtime.sendMessage({ 
      action: "WAKE_WORD_DETECTED", 
      transcript: transcript 
    });
    
    this.playPing();
  }

  private playPing() {
     const ping = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFRm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YV9vT18A'); 
     ping.volume = 0.2;
     ping.play().catch(() => {});
  }
}

// Start listener instance
const listener = new SentinelVoiceListener();

// Handle cross-document messaging (from Background)
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "START_TRIGGERED_LISTENING") {
    listener.startListening();
  }

  if (request.action === "PLAY_VOICE_RESULT" && request.audioBase64) {
    console.log("[Sentinel_Offscreen] Delivering oral audit results...");
    const src = request.audioBase64.startsWith('data:audio') ? request.audioBase64 : `data:audio/mpeg;base64,${request.audioBase64}`;
    const audio = new Audio(src);
    
    audio.onplay = () => {
       chrome.runtime.sendMessage({ action: "UPDATE_HUD_PHASE", phase: "SPEAKING" });
    };
    
    audio.onended = () => {
       chrome.runtime.sendMessage({ action: "UPDATE_HUD_PHASE", phase: "IDLE" });
    };

    audio.play()
      .then(() => console.log("[Sentinel_Offscreen] Playback active."))
      .catch((err) => console.error("[Sentinel_Offscreen] Playback blocked:", err));
  }
});


