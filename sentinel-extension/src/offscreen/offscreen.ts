/**
 * Sentinel AI: Operative Offscreen Voice Layer
 * Continuous background listening for wake words and tokens.
 */

// Define SpeechRecognition for TypeScript
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

class SentinelVoiceListener {
  private recognition: any;
  private isAwake: boolean = false;
  private awakeTimeout: number | null = null;
  private readonly AWAKE_DURATION = 5000; // 5 seconds to give a command

  constructor() {
    if (!SpeechRecognition) {
      console.error("[Sentinel_Offscreen] Speech Recognition not supported.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript.toLowerCase())
        .join('');

      this.processTranscript(transcript);
    };

    this.recognition.onend = () => {
      // Keep active
      this.recognition.start();
    };

    this.recognition.onerror = (event: any) => {
      console.error("[Sentinel_Offscreen] Recognition error:", event.error);
    };

    this.recognition.start();
    console.log("[Sentinel_Offscreen] Voice-First Operative Listening Active.");
  }

  private processTranscript(transcript: string) {
    // Stage 1: Wake Word Detection
    if (!this.isAwake && transcript.includes("hey sentinel")) {
      this.wakeUp();
      return;
    }

    // Stage 2: Command Detection
    if (this.isAwake) {
      if (transcript.includes("scan") || transcript.includes("token")) {
        console.log("[Sentinel_Offscreen] Command Detected: SCAN_TOKEN");
        chrome.runtime.sendMessage({ action: "WAKE_WORD_DETECTED" });
        this.resetState();
      }
    }
  }

  private wakeUp() {
    this.isAwake = true;
    console.log("[Sentinel_Offscreen] Sentinel is AWAKE. Awaiting command...");
    
    // Play a subtle "wake" ping
    this.playPing();

    // Reset if no command within duration
    if (this.awakeTimeout) clearTimeout(this.awakeTimeout);
    this.awakeTimeout = window.setTimeout(() => {
      this.resetState();
    }, this.AWAKE_DURATION);
  }

  private resetState() {
    this.isAwake = false;
    if (this.awakeTimeout) clearTimeout(this.awakeTimeout);
    console.log("[Sentinel_Offscreen] Sentinel entering IDLE state.");
  }

  private playPing() {
     // Optional: Small audible cue
     const ping = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFRm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YV9vT18A'); 
     ping.volume = 0.2;
     ping.play().catch(() => {});
  }
}

// Start listener
new SentinelVoiceListener();

// Handle cross-document audio playback (from Background)
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "PLAY_VOICE_RESULT" && request.audioBase64) {
    const src = request.audioBase64.startsWith('data:audio') ? request.audioBase64 : `data:audio/mpeg;base64,${request.audioBase64}`;
    const audio = new Audio(src);
    audio.play();
  }
});
