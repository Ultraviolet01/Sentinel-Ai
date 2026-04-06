'use server';

import { fetchTokenData, TokenMetadata } from '@/lib/data-fetcher';
import { analyzeToken, ScorecardResult } from '@/lib/ai-analyzer';
import { unibase } from '@/lib/unibase';
import { redirect } from 'next/navigation';

export interface ScanResponse {
  success: boolean;
  data?: {
    metadata: TokenMetadata;
    result: ScorecardResult;
  };
  error?: string;
}

import { sanitizeAddress } from '@/lib/utils';

export async function analyzeTokenAction(addressQuery: string): Promise<ScanResponse> {
  const address = sanitizeAddress(addressQuery);
  
  if (!address || address.length < 40) {
    return { success: false, error: "Invalid address or Four.Meme URL." };
  }

  try {
    // 1. Fetch live data
    const metadata = await fetchTokenData(address);
    if (!metadata) return { success: false, error: "Token metadata not found. Is it on BSC?" };

    // 2. Fetch decentralized memory context (Unibase)
    const history = await unibase.getContext(address);

    // 3. Coordinate AI Agent Trio (Watch, Narrative, Alert)
    const result = await analyzeToken(metadata, history);

    // 4. Save to Unibase Membase Agent Memory (Persistent context)
    // This runs asynchronously to avoid blocking the user response.
    unibase.saveScan(metadata.address, metadata, result).catch(e => {
        console.error("[Unibase] Async memory sync failed:", e);
    });

    return {
      success: true,
      data: { metadata, result }
    };
  } catch (error: any) {
    console.error("Action Error:", error.message);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during analysis."
    };
  }
}

/**
 * Search and redirect helper.
 */
export async function searchAndRedirectAction(query: string) {
  // Simple validation or preprocessing
  const cleanQuery = query.toLowerCase().trim();
  redirect(`/scan/${cleanQuery}`);
}
