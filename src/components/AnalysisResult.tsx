'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap,
  Globe,
  MessageSquare,
  Copy,
  ChevronDown,
  Cpu
} from 'lucide-react';
import { ScorecardResult } from '@/lib/ai-analyzer';
import { TokenMetadata } from '@/lib/data-fetcher';
import { SentinelAgents } from './SentinelAgents';

interface AnalysisResultProps {
  result: ScorecardResult;
  metadata: TokenMetadata;
  onOpenDetails: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, metadata, onOpenDetails }) => {
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);

  const getVerdictTheme = (verdict: string) => {
    switch (verdict) {
      case 'Promising': return {
        border: 'border-cyber-green',
        bg: 'bg-cyber-green/10',
        text: 'text-cyber-green',
        glow: 'shadow-[0_0_20px_rgba(0,255,189,0.3)]'
      };
      case 'Watch': return {
        border: 'border-blue-400',
        bg: 'bg-blue-400/10',
        text: 'text-blue-400',
        glow: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]'
      };
      case 'High Risk': return {
        border: 'border-orange-500',
        bg: 'bg-orange-500/10',
        text: 'text-orange-500',
        glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]'
      };
      case 'Avoid': return {
        border: 'border-red-500',
        bg: 'bg-red-500/10',
        text: 'text-red-500',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
      };
      default: return {
        border: 'border-gray-500',
        bg: 'bg-gray-500/10',
        text: 'text-gray-500',
        glow: ''
      };
    }
  };

  const theme = getVerdictTheme(result.finalVerdict);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto mt-12 space-y-6 pt-10"
    >
      {/* SECTION 1: SNAPSHOT HEADER */}
      <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="scanline" />
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h2 className="text-3xl font-black font-orbitron tracking-tighter text-white">
              {metadata.name}
            </h2>
            <span className="text-neon-purple font-mono font-bold text-sm bg-neon-purple/10 px-2 py-0.5 rounded border border-neon-purple/20">
              ${metadata.symbol}
            </span>
            {result.isFreshLaunch && (
              <motion.span 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded"
              >
                Fresh Launch
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-mono">
            <span className="truncate">{metadata.address}</span>
            <button className="hover:text-white transition-colors cursor-pointer">
              <Copy size={12} />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-2xl font-mono font-black text-white">
            ${parseFloat(metadata.priceUsd || '0').toLocaleString(undefined, { maximumFractionDigits: 8 })}
          </span>
          <div className="flex gap-4">
             {metadata.socialLinks?.map((link, i) => (
                <a 
                  key={i} 
                  href={link} 
                  target="_blank" 
                  className="p-1.5 bg-white/5 border border-white/10 rounded hover:bg-neon-purple/20 hover:border-neon-purple/50 transition-all text-gray-400 hover:text-white"
                >
                  {link.includes('x.com') || link.includes('twitter') ? <Zap size={14} /> : 
                   link.includes('t.me') ? <MessageSquare size={14} /> : <Globe size={14} />}
                </a>
             ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: AUDIT ENGINE (THE SENTINEL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Overall Score Gauge - Vertical Stack on Mobile */}
        <div className="lg:col-span-4 glass-card p-6 md:p-8 flex flex-col md:flex-row lg:flex-col items-center justify-center gap-8 lg:space-y-6">
           <div className="scanline" />
           <div className="relative">
              {/* Multilayer SVG Gauge */}
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-white/5" strokeDasharray="4 4" />
                <motion.circle
                  cx="96" cy="96" r="88"
                  stroke="currentColor" strokeWidth="6" strokeLinecap="square"
                  fill="transparent" strokeDasharray="552.9"
                  initial={{ strokeDashoffset: 552.9 }}
                  animate={{ strokeDashoffset: 552.9 - (552.9 * (result.scores.risk || 0)) / 100 }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className={`${theme.text} opacity-80`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <motion.span 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="text-6xl font-black font-orbitron tracking-tighter"
                 >
                   {result.scores.risk}
                 </motion.span>
                 <span className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mt-[-5px]">Sentinel Grade</span>
                 
                 {/* Confidence Meter Badge */}
                 <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <div className={`w-1.5 h-1.5 rounded-full ${result.confidenceLevel > 80 ? 'bg-cyber-green' : 'bg-yellow-500'} animate-pulse`} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                      Confidence: {result.confidenceLevel}%
                    </span>
                 </div>
              </div>
           </div>

           {/* Narrative Durability Circular Meter */}
           <div className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <div className="scanline rounded-full" />
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                  <motion.circle
                    cx="48" cy="48" r="42"
                    stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                    fill="transparent" strokeDasharray="263.9"
                    initial={{ strokeDashoffset: 263.9 }}
                    animate={{ strokeDashoffset: 263.9 - (263.9 * (result.durabilityScore || 0)) / 100 }}
                    className="text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black font-orbitron text-white">{result.durabilityScore}%</span>
                </div>
              </div>
              <span className="text-[8px] uppercase font-black tracking-[0.2em] text-cyan-400/60 mt-2">Narrative Durability</span>
           </div>
           
           <div className={`px-5 py-2 rounded border font-black uppercase tracking-widest text-[10px] ${theme.border} ${theme.bg} ${theme.text} ${theme.glow} animate-pulse-neon`}>
             {result.finalVerdict}
           </div>
        </div>

        {/* AI Verdict & Rubric */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           {/* Verdict Panel */}
           <div className={`glass-card p-6 border-r-4 ${theme.border}`}>
              <div className="scanline" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2">
                <Zap size={12} className="text-neon-purple" />
                Analysis Verdict
              </h3>
              <p className="text-xl md:text-2xl font-black font-orbitron leading-tight mb-4">
                {result.summary}
              </p>
           </div>

           {/* Rubric Meters */}
           <div className="glass-card p-6 grid grid-cols-2 gap-x-10 gap-y-6">
              {[
                { label: 'Narrative', val: result.breakdown.narrative, max: 20 },
                { label: 'Momentum', val: result.breakdown.momentum, max: 20 },
                { label: 'Liquidity', val: result.breakdown.liquidity, max: 20 },
                { label: 'Distribution', val: result.breakdown.holders, max: 15 },
                { label: 'Contract Safety', val: result.breakdown.safety, max: 15 },
                { label: 'Meme Launch Quality', val: result.breakdown.launchQuality, max: 10 },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                   <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] opacity-50">
                     <span>{item.label}</span>
                     <span>{item.val}/{item.max}</span>
                   </div>
                   <div className="h-1 w-full bg-white/5 flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: i < (item.val / item.max) * 10 ? 1 : 0.1 }}
                          className={`h-full flex-1 ${i < (item.val / item.max) * 10 ? 'bg-white/50' : 'bg-white/10'}`}
                          transition={{ delay: i * 0.05 }}
                        />
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* SECTION: SENTINEL AGENT HUB */}
      <div className="space-y-4">
         <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 pl-2">
           Autonomous Sentinel Network [Unibase_Membase]
         </h3>
         <SentinelAgents agents={result.agents} />
      </div>

      {/* SECTION 3: RED FLAGS & SIGNALS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Red Flags - Sharp & Aggressive */}
         <div className="glass-card p-6 border-l-4 border-red-500/50 bg-red-500/[0.02]">
            <div className="scanline" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-4 flex items-center gap-2">
              <ShieldAlert size={14} />
              Detected Risk Signals
            </h3>
            <div className="space-y-3">
              {result.topRedFlags.map((flag, i) => (
                <div key={i} className="p-3 bg-red-500/5 border border-red-500/10 flex items-start gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                   <p className="text-xs font-bold text-gray-200 uppercase tracking-tight">{flag}</p>
                </div>
              ))}
            </div>
         </div>

         {/* Positive Signals - Sleek & Fast */}
         <div className="glass-card p-6 border-l-4 border-cyber-green/50 bg-cyber-green/[0.02]">
            <div className="scanline" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyber-green mb-4 flex items-center gap-2">
              <ShieldCheck size={14} />
              Verified Trust Signals
            </h3>
            <div className="space-y-3">
              {result.topPositiveSignals.map((signal, i) => (
                <div key={i} className="p-3 bg-cyber-green/5 border border-cyber-green/10 flex items-start gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyber-green mt-1.5" />
                   <p className="text-xs font-bold text-gray-200 uppercase tracking-tight">{signal}</p>
                </div>
              ))}
            </div>
         </div>
      </div>

      {/* SECTION: RAW SENTINEL SIGNALS (THE EVIDENCE) */}
      <div className="glass-card p-6 overflow-hidden">
         <div className="scanline" />
         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-6 flex items-center gap-2">
            <Cpu size={14} className="text-neon-purple" />
            Raw Sentinel Signal Trace [Execution_Proof]
         </h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'Liq/FDV Ratio', val: (parseFloat(metadata.liquidityUsd || '0') / parseFloat(metadata.fdv || '1')).toFixed(4) },
              { label: 'Holder Concentration', val: `${metadata.holderConcentration}%` },
              { label: '1h B/S Ratio', val: `${metadata.txStats?.buys || 0}/${metadata.txStats?.sells || 0}` },
              { label: 'Ecosystem Lock', val: metadata.isFourMemeLaunch ? 'DET_OFFICIAL' : 'EXTERNAL' },
              { label: 'Safety Check', val: metadata.clusterDetected ? 'ANOMALY_DET' : 'PASSED' },
              { label: 'Market Depth', val: `$${parseFloat(metadata.liquidityUsd || '0').toLocaleString()}` },
              { label: '24h Momentum', val: `$${parseFloat(metadata.volume24h || '0').toLocaleString()}` },
              { label: 'Sentiment Index', val: `${result.durabilityScore}/100` },
            ].map((sig) => (
              <div key={sig.label} className="p-3 bg-black/40 border border-white/5 rounded">
                 <div className="text-[7px] font-black uppercase tracking-widest text-gray-600 mb-1">{sig.label}</div>
                 <div className="font-mono text-[10px] text-neon-purple tracking-tighter truncate">{sig.val}</div>
              </div>
            ))}
         </div>
      </div>

      {/* SECTION 4: WHY THIS SCORE? (TERMINAL LOG) */}
      <div className="glass-card">
         <button 
           onClick={() => setIsReasoningOpen(!isReasoningOpen)}
           className="w-full p-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors group"
         >
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-neon-purple transition-colors">
             Trace Reasoning Logs
           </span>
           <motion.div animate={{ rotate: isReasoningOpen ? 180 : 0 }}>
             <ChevronDown size={16} className="text-gray-500" />
           </motion.div>
         </button>
         <AnimatePresence>
            {isReasoningOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 border-t border-glass-border">
                   <div className="mt-4 p-5 bg-black/40 font-mono text-[11px] text-gray-400 leading-relaxed rounded-md border border-white/5">
                      <div className="text-neon-purple mb-2 opacity-50 font-bold tracking-widest uppercase text-[8px]">[Sentinel_Audit_Log_Initialized]</div>
                      {result.verdict}
                   </div>
                   <div className="grid grid-cols-2 gap-6 mt-8">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-cyber-green opacity-50 tracking-widest">Growth Thesis</span>
                        <p className="text-xs text-gray-300 italic">{result.bullCase}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-red-500 opacity-50 tracking-widest">Risk Thesis</span>
                        <p className="text-xs text-gray-300 italic">{result.bearCase}</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* DETAIL DRAWER / ALPHA DEEP-DIVE */}
      <div className="flex justify-center pt-8">
          <button 
            onClick={onOpenDetails}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 hover:text-white transition-all py-8"
          >
            [Initiate_Alpha_Deep-Dive]
          </button>
      </div>

      {/* AUDIT SIGNATURE & DISCLAIMER (V6) */}
      <div className="pt-12 pb-20 border-t border-white/5 space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div>
               <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Digital Audit Signature</div>
               <div className="text-[10px] font-mono text-gray-600">ID: SG-{(result.timestamp || '').replace(/[:.-]/g, '').slice(0, 12)}-V6</div>
            </div>
            <div className="text-[10px] font-mono text-gray-500">
               TIMESTAMP: {new Date(result.timestamp || Date.now()).toUTCString()}
            </div>
         </div>
         
         <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
            <p className="text-[9px] font-bold text-yellow-500/60 leading-relaxed uppercase tracking-wider text-center">
               DISCLAIMER: This analysis is provided for informational purposes only. It is generated by AI based on real-time on-chain signals. This is NOT financial advice. AI models can hallucinate or miss critical security exploits. Always perform your own deep-dive research before interacting with any smart contract.
            </p>
         </div>
      </div>
    </motion.div>
  );
};
