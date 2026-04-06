import { NextResponse } from 'next/server';
import { fetchTokenData } from '@/lib/data-fetcher';
import { analyzeToken } from '@/lib/ai-analyzer';
import { unibase } from '@/lib/unibase';
import { sanitizeAddress } from '@/lib/utils';
import { generateSpokenVerdict } from '@/lib/elevenlabs';

export async function POST(request: Request) {
  try {
    const { addressQuery } = await request.json();
    const address = sanitizeAddress(addressQuery);

    if (!address || address.length < 40) {
      return NextResponse.json({ success: false, error: "Invalid address or Four.Meme URL." }, { status: 400 });
    }

    // 1. Fetch live data
    const metadata = await fetchTokenData(address);
    if (!metadata) {
      return NextResponse.json({ success: false, error: "Token metadata not found on BSC." }, { status: 404 });
    }

    // 2. Fetch decentralized memory context (Unibase)
    const history = await unibase.getContext(address);

    // 3. Coordinate AI Agent Trio (Watch, Narrative, Alert)
    const result = await analyzeToken(metadata, history);

    // 4. Generate High-Fidelity Spoken Verdict (ElevenLabs)
    // We only generate if the API key is present
    let audioBase64: string | undefined;
    if (process.env.ELEVENLABS_API_KEY) {
      audioBase64 = await generateSpokenVerdict(result.summary).catch(e => {
        console.error("[ElevenLabs] Audio sync failed:", e);
        return undefined;
      });
    }

    // 5. Save to Unibase Membase Agent Memory (Persistent context)
    // We await this for the extension to ensure deterministic JSON response
    await unibase.saveScan(metadata.address, metadata, result).catch(e => {
      console.error("[Unibase] Sync failed:", e);
    });

    return NextResponse.json({
      success: true,
      data: { metadata, result, audioBase64 }
    });
  } catch (error: any) {
    console.error("API Audit Error:", error.message);
    return NextResponse.json({
      success: false,
      error: error.message || "An unexpected error occurred during analysis."
    }, { status: 500 });
  }
}
