import { Metadata } from "next";
import { cache } from "react";
import { fetchTokenData } from "@/lib/data-fetcher";
import { analyzeToken } from "@/lib/ai-analyzer";
import { ScanView } from "@/components/ScanView";
import { unibase } from "@/lib/unibase";
import { AlertTriangle, Home } from "lucide-react";
import Link from 'next/link';
import { sanitizeAddress } from "@/lib/utils";

interface Props {
  params: Promise<{ address: string }>;
}

export const dynamic = 'force-dynamic';

/**
 * Shared Scanner Orchestrator (Deduplicated with React Cache)
 * Prevents redundant calls between generateMetadata and the Page component.
 */
const getScanData = cache(async (rawAddress: string) => {
  const address = sanitizeAddress(rawAddress);
  // Guard against static pre-rendering of the segment placeholder
  if (!address || address === '[address]' || !address.startsWith('0x')) {
    return { 
      metadata: { name: 'Unknown', symbol: '???', address: '0x0', decimals: 18, totalSupply: '0', pairCreatedAt: 0 } as any, 
      result: { 
        scores: { risk: 0 }, 
        breakdown: { narrative: 0, momentum: 0, liquidity: 0, holders: 0, safety: 0, launchQuality: 0 },
        finalVerdict: 'Watch', 
        summary: 'Initializing Sentinel Hub...',
        topRedFlags: [],
        topPositiveSignals: [],
        verdict: '',
        bullCase: '',
        bearCase: '',
        timestamp: new Date().toISOString(),
        confidenceLevel: 100,
        durabilityScore: 0,
        agents: []
      } as any 
    };
  }

  const metadata = await fetchTokenData(address);
  const history = await unibase.getContext(address);
  const result = await analyzeToken(metadata, history);
  
  // Persist to Memory (Async)
  await unibase.saveScan(address, metadata, result).catch(console.error);
  
  return { metadata, result };
});

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { address } = await props.params;

  try {
    const { metadata, result } = await getScanData(address);
    return {
      title: `Sentinel AI Scorecard: ${result.scores.risk}/100`,
      description: `🎯 VERDICT: ${result.finalVerdict} | Sentinel AI Trace Intelligence`,
    };
  } catch (error) {
    return { title: "Sentinel AI | Audit Trace" };
  }
}

export default async function ScanPage(props: Props) {
  const { address } = await props.params;

  try {
    const { metadata, result } = await getScanData(address);

    return (
      <div className="pt-20 min-h-screen">
        <ScanView initialData={{ metadata, result }} />
      </div>
    );
  } catch (error: any) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="glass-card p-12 max-w-xl w-full border-red-500/30 bg-red-500/[0.02] text-center space-y-6 relative">
          <div className="scanline" />
          <div className="flex justify-center">
             <div className="p-4 bg-red-500/10 rounded-full border border-red-500/30 animate-pulse-neon">
                <AlertTriangle size={48} className="text-red-500" />
             </div>
          </div>
          <h1 className="text-4xl font-black font-orbitron tracking-tighter text-red-500 uppercase">
            Sentinel AI Malfunction
          </h1>
          <div className="p-4 bg-black/40 rounded border border-white/5 font-mono text-[11px] text-gray-500 text-left leading-relaxed">
             <span className="text-red-500/50">[ERROR_TRACE]:</span> {error.message}
          </div>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <Home size={18} />
            REBOOT SYSTEM
          </Link>
        </div>
      </div>
    );
  }
}
