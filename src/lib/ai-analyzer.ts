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
  finalVerdict: 'SAFE' | 'MID' | 'DANGER';
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
    - Top 5 Concentration: ${data.holderConcentration}%
    - Wallet Cluster Detected: ${data.clusterDetected}

    Role: You are Sentinel AI, a high-precision crypto auditor.
    
    Audit Integrity Rules:
    1. Grade the token's OVERALL RISK (0-100%). High score = high risk.
    2. Provide a FINAL VERDICT from this exact list: [SAFE, MID, DANGER].
    3. Low risk/Safe = SAFE. Medium risk = MID. High risk/Danger = DANGER.

    Response Format (JSON ONLY):
    {
      "summary": "...",
      "durabilityScore": 85,
      "scores": {
        "risk": 15,
        "narrative": 20,
        "momentum": 15,
        "liquidity": 20,
        "holders": 15,
        "safety": 15,
        "launchQuality": 0
      },
      "finalVerdict": "SAFE",
      ...
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean JSON
    let cleanedText = text.trim().replace(/^```json/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleanedText);

    // Score Normalization (Fix for missing gauge score)
    if (!parsed.scores) parsed.scores = { risk: 50 };
    if (parsed.scores.risk === undefined) {
      // Sum the breakdown if total risk is missing
      const b = parsed.breakdown || {};
      parsed.scores.risk = Math.max(0, Math.min(100, (b.safety || 0) + (b.liquidity || 0)));
    }

    // Verdict Normalization (Fix for label sync)
    const v = (parsed.finalVerdict || '').toUpperCase();
    if (v.includes('SAFE')) parsed.finalVerdict = 'SAFE';
    else if (v.includes('DANGER') || v.includes('HIGH')) parsed.finalVerdict = 'DANGER';
    else parsed.finalVerdict = 'MID';

    // Normalize agents
    if (!parsed.agents) parsed.agents = {};
    if (!parsed.agents.watch) parsed.agents.watch = { status: 'Normal', report: 'Stability maintained.', stability: 80 };
    if (!parsed.agents.narrative) parsed.agents.narrative = { trend: 'Stagnant', report: 'Analyzing trend velocity...' };
    if (!parsed.agents.alert) parsed.agents.alert = { severity: 'Normal', signal: 'No critical anomalies.' };

    return parsed;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw new Error("Failed to generate AI scorecard.");
  }
}
