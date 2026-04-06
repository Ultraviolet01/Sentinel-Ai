import { GoogleGenerativeAI } from "@google/generative-ai";
import { TokenMetadata } from "./data-fetcher";

// Use server-side environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ScorecardResult {
  summary: string;
  durabilityScore: number; // 0-100 Narrative Durability
  isFreshLaunch: boolean; // Detected < 24h
  confidenceLevel: number; // 0-100 AI Confidence
  timestamp: string; // Audit ISO Timestamp
  scores: {
    risk: number;
    narrative: number;
    momentum: number;
    liquidity: number;
    holders: number;
    safety: number;
    launchQuality: number;
  };
  breakdown: {
    narrative: number;
    momentum: number;
    liquidity: number;
    holders: number;
    safety: number;
    launchQuality: number;
  };
  penalties: Array<{ label: string; points: number; description: string }>;
  topPositiveSignals: string[];
  topRedFlags: string[];
  finalVerdict: 'Watch' | 'Promising' | 'High Risk' | 'Avoid';
  verdict: string;
  bullCase: string;
  bearCase: string;
  redFlags: string[];
  reasoning: string;
  agents: {
    watch: { status: string; report: string; stability: number };
    narrative: { trend: 'Rising' | 'Stagnant' | 'Dying'; report: string; first24hIntel?: string };
    alert: { severity: 'Normal' | 'Warning' | 'Critical'; signal: string };
  };
  analysis: {
    narrative: string;
    community: string;
    safety: string;
    holders: string;
    launch: string;
  };
}

export async function analyzeToken(data: any, history: any[] = []) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const isFresh = data.pairCreatedAt ? (Date.now() - data.pairCreatedAt) < 86400000 : false;

  const historyContext = history.length > 0 
    ? `HISTORICAL CONTEXT (Past Scans): ${history.map(h => `[Score: ${h.analysis_result.scores.risk} at ${new Date(h.timestamp).toISOString()}]`).join(", ")}`
    : "No historical context available. This is the first scan recorded by the Sentinel.";

  const prompt = `
    ${historyContext}
    
    TOKEN DATA:
    - Name: ${data.name}
    - Symbol: ${data.symbol}
    - Price: ${data.priceUsd}
    - Liquidity: ${data.liquidityUsd}
    - FDV: ${data.fdv}
    - Created: ${data.pairCreatedAt ? new Date(data.pairCreatedAt).toISOString() : 'Unknown'}
    - FRESH LAUNCH DETECTED: ${isFresh}
    - ECOSYSTEM: Four.Meme Official Launch: ${data.isFourMemeLaunch}
    - Buy/Sell Ratio: ${data.txStats?.buys}/${data.txStats?.sells}
    - Top 5 Concentration: ${data.holderConcentration}%
    - Wallet Cluster Detected: ${data.clusterDetected}
    - Social Links: ${data.socialLinks?.join(", ")}

    Role: You are Sentinel AI, the professional 100-point crypto auditor specialized in the Four.Meme ecosystem. Grade the token and provide specialized agent reports.
    
    Audit Integrity Rules:
    1. Judge your ANALYSIS CONFIDENCE (0-100%). Lower it if: social links are missing, liquidity is <1% of FDV, or volume is near zero.
    2. Reference RAW SIGNALS (Price, Liq, Hold%) in your reasoning.
    3. TIMESTAMP this audit as: ${new Date().toISOString()}

    100-Point Rubric & Ecosystem Rules:
    [Standard Rubric: Narrative 20, Momentum 20, Liquidity 20, Holders 15, Safety 15, Meme Launch Quality 10]
    [Deductions: Whale Concentration -15, Cluster -10, Social Ghosting -10, Copied Branding -10]

    Response Format (JSON ONLY):
    {
      "summary": "2-line summary...",
      "durabilityScore": 85,
      "isFreshLaunch": ${isFresh},
      "confidenceLevel": 95, 
      "timestamp": "${new Date().toISOString()}",
      "scores": { ... },
      "breakdown": { ... },
      "penalties": [ ... ],
      "topPositiveSignals": [ ... ],
      "topRedFlags": [ ... ],
      "finalVerdict": "...",
      "verdict": "...",
      "bullCase": "...",
      "bearCase": "...",
      "reasoning": "...",
      "agents": { ... },
      "analysis": { ... }
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Robust JSON cleaning
    let cleanedText = text
      .trim()
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();

    // Sometimes the AI might add text after the JSON
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(cleanedText);

    // Normalize response to prevent UI TypeErrors (Defensive Layer)
    if (!parsed.agents) parsed.agents = {};
    if (!parsed.agents.watch) parsed.agents.watch = { status: 'Normal', report: 'Stability maintained.', stability: 80 };
    if (!parsed.agents.narrative) parsed.agents.narrative = { trend: 'Stagnant', report: 'Analyzing trend velocity...', first24hIntel: '' };
    if (!parsed.agents.alert) parsed.agents.alert = { severity: 'Normal', signal: 'No critical anomalies.' };

    return parsed;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    // Fallback or re-throw
    throw new Error("Failed to generate AI scorecard. Please check your API key or try again later.");
  }
}
