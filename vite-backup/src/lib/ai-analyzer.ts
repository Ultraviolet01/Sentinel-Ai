import { GoogleGenerativeAI } from "@google/generative-ai";
import { TokenMetadata } from "./data-fetcher";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface ScorecardResult {
  scores: {
    narrative: number;
    community: number;
    safety: number;
    holders: number;
    launch: number;
    risk: number;
  };
  verdict: string;
  analysis: {
    narrative: string;
    community: string;
    safety: string;
    holders: string;
    launch: string;
  };
  bullCase: string;
  bearCase: string;
  redFlags: string[];
  reasoning: string;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

export async function analyzeToken(data: TokenMetadata): Promise<ScorecardResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
    Analyze the following meme token data from Four.Meme/BSC and provide a "Scorecard" in JSON format.
    
    TOKEN DATA:
    - Name: ${data.name} (${data.symbol})
    - Address: ${data.address}
    - Price USD: ${data.priceUsd || 'Unknown'}
    - 24h Volume: ${data.volume24h || 'Unknown'}
    - Liquidity: ${data.liquidityUsd || 'Unknown'}
    - FDV: ${data.fdv || 'Unknown'}
    - Socials: ${JSON.stringify(data.socials || [])}
    - Description: ${data.description || 'No description provided'}
    - Is on Four.Meme: ${data.isFourMeme ? 'Yes' : 'No'}

    SCORING CRITERIA (0-100):
    1. Narrative Strength: Is the concept unique/viral or a derivative low-effort clone?
    2. Community Traction: Based on volume, liquidity, and presence of socials.
    3. Contract Safety: Standard Four.Meme contracts are safe, but check for weird signs. 
    4. Holder/Wallet Behavior: Risk level based on liquidity/FDV ratio and volume.
    5. Launch Quality: Is it gaining organic momentum?
    6. Overall Risk: Weighted risk score.

    OUTPUT FORMAT (Strict JSON):
    {
      "scores": { "narrative": 0-100, "community": 0-100, "safety": 0-100, "holders": 0-100, "launch": 0-100, "risk": 0-100 },
      "verdict": "One sentence summary verdict.",
      "bullCase": "Why this token might moon...",
      "bearCase": "The primary risks/downside...",
      "redFlags": ["Flag 1", "Flag 2"],
      "reasoning": "Simple explanation of why this score was given.",
      "analysis": {
        "narrative": "Detailed breakdown...",
        "community": "Detailed breakdown...",
        "safety": "Detailed breakdown...",
        "holders": "Detailed breakdown...",
        "launch": "Detailed breakdown..."
      },
      "overallRisk": "LOW" | "MEDIUM" | "HIGH" | "EXTREME"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean JSON from markdown if necessary
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("AI Analysis failed:", err);
    throw new Error("Failed to generate AI scorecard. Please check your API key or try again later.");
  }
}
