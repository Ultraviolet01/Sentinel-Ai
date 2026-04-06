/**
 * Sentinel AI: Voice Orchestration Layer
 * Handles playback of audit verdicts and legal disclaimers.
 */

export class AudioHandler {
  private static audio: HTMLAudioElement | null = null;

  /**
   * Plays a base64-encoded audio payload.
   */
  public static async playBase64(base64: string): Promise<void> {
    const src = base64.startsWith('data:audio') ? base64 : `data:audio/mpeg;base64,${base64}`;
    
    if (this.audio) this.audio.pause();
    this.audio = new Audio(src);
    return this.audio.play();
  }

  /**
   * Plays an audio stream from a URL.
   */
  public static async playUrl(url: string): Promise<void> {
    if (this.audio) this.audio.pause();
    this.audio = new Audio(url);
    return this.audio.play();
  }

  /**
   * Browser-native Fallback: Web Speech API (TTS)
   */
  public static speak(text: string): void {
    if (!('speechSynthesis' in window)) {
      console.warn("[Sentinel_AI] TTS not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.9; // Slightly lower for operative feel
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Strategic Verdict & Disclaimer Sequence
   */
  public static announceVerdict(summary: string, audioBase64?: string): void {
    if (audioBase64) {
      this.playBase64(audioBase64).catch(() => {
        // Fallback if ElevenLabs payload fails
        this.speak(`${summary}. This is not financial advice.`);
      });
    } else {
      this.speak(`${summary}. This is not financial advice.`);
    }
  }
}
