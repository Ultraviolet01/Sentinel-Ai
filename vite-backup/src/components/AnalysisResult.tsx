import React from 'react';
import { motion } from 'framer-motion';
import { ScorecardResult } from '../lib/ai-analyzer';
import { TokenMetadata } from '../lib/data-fetcher';
// No lucide-react imports needed here anymore

interface AnalysisResultProps {
  result: ScorecardResult;
  metadata: TokenMetadata;
}

export const AnalysisResult: React.FC<AnalysisResultProps & { onOpenDetails: () => void }> = ({ result, metadata, onOpenDetails }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-cyber-green';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-orange-500';
      case 'EXTREME': return 'text-red-500';
      default: return 'text-gray-100';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mt-12 space-y-6"
    >
      <div className="glass-card p-8 relative overflow-hidden group">
        {/* Risk Badge */}
        <div className="absolute top-0 right-0 p-4">
           <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getRiskColor(result.overallRisk).replace('text-', 'border-').replace('text-', 'bg-').replace('400', '400/10')}`}>
            {result.overallRisk} RISK
          </span>
        </div>

        {/* Brand Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-black text-gradient-purple mb-1">
            {metadata.name}
          </h2>
          <div className="flex items-center gap-3 text-gray-500 text-sm font-mono tracking-tighter">
            <span>${metadata.symbol}</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>{metadata.address.slice(0, 6)}...{metadata.address.slice(-4)}</span>
          </div>
        </div>

        {/* Score & Verdict Row */}
        <div className="flex flex-col md:flex-row items-center gap-10 py-6 border-y border-glass-border">
          <div className="relative shrink-0">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-white/5"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="364.4"
                initial={{ strokeDashoffset: 364.4 }}
                animate={{ strokeDashoffset: 364.4 - (364.4 * result.scores.risk) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-neon-purple"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-orbitron font-black">{result.scores.risk}</span>
              <span className="text-[8px] uppercase tracking-widest opacity-50">Score</span>
            </div>
          </div>

          <div className="text-left space-y-4">
            <p className="text-lg font-medium italic leading-relaxed text-gray-200">
              "{result.verdict}"
            </p>
            <div className="flex gap-4">
               <button 
                onClick={onOpenDetails}
                className="px-6 py-2 bg-white/5 border border-white/10 hover:border-neon-purple/50 rounded-full text-xs font-bold uppercase transition-all hover:shadow-[0_0_15px_rgba(191,64,191,0.2)] active:scale-95"
              >
                View Detailed Alpha
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-8 pt-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Price</p>
            <p className="text-sm font-mono">${parseFloat(metadata.priceUsd || '0').toFixed(8)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Liquidity</p>
            <p className="text-sm font-mono">${Math.round(parseFloat(metadata.liquidityUsd || '0')).toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Volume (24h)</p>
            <p className="text-sm font-mono">${Math.round(parseFloat(metadata.volume24h || '0')).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
