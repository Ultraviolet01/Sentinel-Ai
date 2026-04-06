/**
 * Sentinel AI: ElevenLabs Voice Engine
 * High-fidelity, low-latency TTS for professional audit verdicts.
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'pNInz6ovf9Pey74Scl6m'; // "Bella" - Professional Female Operative

export async function generateSpokenVerdict(text: string): Promise<string> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY missing in environment.");
  }

  // Add operative prefix and legal disclaimer
  const fullText = `Verdict produced by Sentinel AI. ${text}. This is not financial advice.`;

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: fullText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("[ElevenLabs] TTS Generation Failed:", errorMsg);
      throw new Error(`ElevenLabs_Sync_Error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Return as Base64 for the extension to decode and play instantly
    return buffer.toString('base64');
  } catch (err: any) {
    console.error("[ElevenLabs] Voice Orchestration Error:", err.message);
    throw err;
  }
}
