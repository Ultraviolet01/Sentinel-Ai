import { NextResponse } from 'next/server';
import { fetchTokenData } from '@/lib/data-fetcher';
import { analyzeToken } from '@/lib/ai-analyzer';
import { unibase } from '@/lib/unibase';
import { sanitizeAddress } from '@/lib/utils';
import { generateSpokenVerdict } from '@/lib/elevenlabs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const addressQuery = body.addressQuery || body.contractAddress;
    
    console.log(`[Sentinel_Audit] Incoming Trace: ${addressQuery} (Mode: ${body.scanMode || 'manual'})`);
    
    const address = sanitizeAddress(addressQuery);

    if (!address || address.length < 40) {
      console.warn(`[Sentinel_Audit] Validation Failed: ${addressQuery}`);
      return NextResponse.json({ success: false, error: "Invalid address or Four.Meme URL." }, { status: 400 });
    }

    // 1. Fetch live data
    console.log(`[Sentinel_Audit] Step 1: Fetching metadata for ${address}...`);
    const metadata = await fetchTokenData(address);
    if (!metadata) {
      console.warn(`[Sentinel_Audit] Step 1 Failed: Token not found.`);
      return NextResponse.json({ success: false, error: "Token metadata not found on BSC." }, { status: 404 });
    }

    // 2. Fetch decentralized memory context (Unibase)
    console.log(`[Sentinel_Audit] Step 2: Accessing Unibase memory...`);
    const history = await unibase.getContext(address);

    // 3. Coordinate AI Agent Trio (Watch, Narrative, Alert)
    console.log(`[Sentinel_Audit] Step 3: Triggering AI Scorecard Generation...`);
    const result = await analyzeToken(metadata, history);

    // 4. Generate High-Fidelity Spoken Verdict (ElevenLabs)
    let audioBase64: string | undefined;
    if (process.env.ELEVENLABS_API_KEY) {
      console.log(`[Sentinel_Audit] Step 4: Syncing ElevenLabs Audio...`);
      audioBase64 = await generateSpokenVerdict(result.summary).catch(e => {
        console.warn("[Sentinel_Audit] Audio sync throttled or failed.");
        return undefined;
      });
    }

    // 5. Save to Unibase Membase Agent Memory (Persistent context)
    console.log(`[Sentinel_Audit] Step 5: Persisting to Persistent Memory...`);
    await unibase.saveScan(metadata.address, metadata, result).catch(e => {
      console.error("[Sentinel_Audit] Unibase write failed.");
    });

    console.log(`[Sentinel_Audit] SUCCESS: Audit Complete for ${metadata.symbol}`);
    return NextResponse.json({
      success: true,
      data: { metadata, result, audioBase64 }
    });
  } catch (error: any) {
    console.error(`[Sentinel_Audit] FATAL ERROR: ${error.message}`);
    return NextResponse.json({
      success: false,
      error: error.message || "An unexpected error occurred during analysis."
    }, { status: 500 });
  }
}
