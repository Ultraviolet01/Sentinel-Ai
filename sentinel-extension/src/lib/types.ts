/**
 * Sentinel AI: Shared Integration Types
 * Synchronizes the browser terminal with the backend intelligence layer.
 */

export interface AuditRequest {
  sourcePlatform: string;
  pageUrl: string;
  pageTitle: string;
  contractAddress?: string;
  fourMemeUrl?: string;
  dexscreenerUrl?: string;
  tokenName?: string;
  tokenTicker?: string;
  extractedText?: string[];
  scanMode: "manual" | "voice";
}

export interface AuditResponse {
  success: boolean;
  score: number;
  riskLevel: "Low" | "Medium" | "High";
  confidence: number;
  shortSummary: string;
  spokenSummary?: string;
  redFlags: string[];
  positives: string[];
  fullReportUrl?: string;
  audioUrl?: string;
  audioBase64?: string;
}
