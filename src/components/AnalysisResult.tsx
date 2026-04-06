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
      case 'SAFE': 
        return {
          border: 'border-cyber-green',
          bg: 'bg-cyber-green/10',
          text: 'text-cyber-green',
          glow: 'drop-shadow-[0_0_25px_rgba(0,255,163,0.8)]',
          hex: '#00ffa3'
        };
      case 'DANGER': 
        return {
          border: 'border-cyber-red',
          bg: 'bg-cyber-red/10',
          text: 'text-cyber-red',
          glow: 'drop-shadow-[0_0_25px_rgba(255,77,77,0.8)]',
          hex: '#ff4d4d'
        };
      case 'MID': 
        return {
          border: 'border-cyber-orange',
          bg: 'bg-cyber-orange/10',
          text: 'text-cyber-orange',
          glow: 'drop-shadow-[0_0_25px_rgba(255,183,0,0.6)]',
          hex: '#ffb700'
        };
      default: return {
        border: 'border-gray-500',
        bg: 'bg-gray-500/10',
        text: 'text-gray-500',
        glow: '',
        hex: '#666'
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Verdict & Summary */}
        <div className="lg:col-span-8 space-y-6">
           <div className={`glass-card p-8 border-l-4 ${theme.border} ${theme.bg}`}>
              <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2 mb-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${theme.text.replace('text-', 'bg-')} animate-pulse`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme.text} opacity-60`}>Risk Assessment Analysis</span>
                 </div>
                 <h1 className={`text-6xl md:text-8xl font-black font-orbitron tracking-tighter uppercase italic leading-none ${theme.text} ${theme.glow} transition-all duration-700`}>
                    {result.finalVerdict}
                 </h1>
                 <p className="text-gray-300 font-mono text-sm md:text-base leading-relaxed mt-6 border-l-2 border-white/10 pl-6 italic">
                    "{result.summary}"
                 </p>
                 <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-4">
                    <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500">
                      Confidence: <span className="text-white">{result.confidenceLevel}%</span>
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500">
                      Trace_ID: <span className="text-white">HST-{(result.scores?.risk || 0).toString().padStart(3, '0')}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Global Risk Gauge */}
        <div className="lg:col-span-4 glass-card p-8 flex flex-col items-center justify-center text-center">
           <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                <motion.circle
                  cx="96" cy="96" r="80"
                  stroke={theme.hex} strokeWidth="8" strokeLinecap="square"
                  fill="transparent" strokeDasharray="502.6"
                  initial={{ strokeDashoffset: 502.6 }}
                  animate={{ strokeDashoffset: 502.6 - (502.6 * (result.scores?.risk || 0)) / 100 }}
                  transition={{ duration: 2, ease: "circOut" }}
                  style={{ filter: `drop-shadow(0 0 10px ${theme.hex})` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className={`text-7xl font-black font-orbitron tracking-tighter ${theme.text}`}>{result.scores?.risk || 0}</span>
                 <span className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mt-[-5px]">Risk Score</span>
              </div>
           </div>
        </div>
      </div>

      {/* SECTION 3: SIGNAL TRIO (THREAT, TRUST, MISSING) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* THREAT SIGNALS */}
         <div className="glass-card p-6 border-t-2 border-cyber-red bg-[#ff4d4d]/[0.02] flex flex-col shadow-[0_4px_20px_rgba(255,77,77,0.05)]">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-cyber-red/10 rounded border border-cyber-red/20 shadow-[0_0_10px_rgba(255,77,77,0.2)]">
                  <ShieldAlert size={16} className="text-cyber-red" />
               </div>
               <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-cyber-red leading-none">Threat</h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-cyber-red">Signals</span>
               </div>
            </div>
            <div className="space-y-3 flex-grow">
               {result.topRedFlags?.length > 0 ? result.topRedFlags.map((flag, i) => (
                 <div key={i} className="p-4 bg-cyber-red/[0.03] border border-cyber-red/10 rounded-md flex items-start gap-3 group hover:border-cyber-red/30 transition-colors">
                    <ShieldAlert size={12} className="text-cyber-red/60 mt-1 flex-shrink-0" />
                    <p className="text-[11px] font-bold text-cyber-red uppercase leading-tight tracking-tight">{flag}</p>
                 </div>
               )) : (
                 <div className="p-4 border border-cyber-red/10 rounded-md text-[10px] font-mono text-cyber-red/60 text-center italic bg-cyber-red/[0.02]">
                    No threats localized.
                 </div>
               )}
            </div>
         </div>

         {/* TRUST SIGNALS */}
         <div className="glass-card p-6 border-t-2 border-cyber-green bg-[#00ffa3]/[0.02] flex flex-col shadow-[0_4px_20px_rgba(0,255,163,0.05)]">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-cyber-green/10 rounded border border-cyber-green/20 shadow-[0_0_10px_rgba(0,255,163,0.2)]">
                  <ShieldCheck size={16} className="text-cyber-green" />
               </div>
               <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-cyber-green leading-none">Trust</h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-cyber-green">Signals</span>
               </div>
            </div>
            <div className="space-y-3 flex-grow">
               {result.topPositiveSignals?.length > 0 ? result.topPositiveSignals.map((sig, i) => (
                 <div key={i} className="p-4 bg-cyber-green/[0.03] border border-cyber-green/10 rounded-md flex items-start gap-3 group hover:border-cyber-green/30 transition-colors">
                    <ShieldCheck size={12} className="text-cyber-green/60 mt-1 flex-shrink-0" />
                    <p className="text-[11px] font-bold text-cyber-green uppercase leading-tight tracking-tight">{sig}</p>
                 </div>
               )) : (
                 <div className="p-4 border border-cyber-green/10 rounded-md text-[10px] font-mono text-cyber-green/60 text-center italic bg-cyber-green/[0.02]">
                    No trust signals confirmed.
                 </div>
               )}
            </div>
         </div>

         {/* MISSING SIGNALS (derived from rubric or generic if missing) */}
         <div className="glass-card p-6 border-t-2 border-cyber-orange bg-[#ffb700]/[0.02] flex flex-col shadow-[0_4px_20px_rgba(255,183,0,0.05)]">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-cyber-orange/10 rounded border border-cyber-orange/20 shadow-[0_0_10px_rgba(255,183,0,0.2)]">
                  <Cpu size={16} className="text-cyber-orange" />
               </div>
               <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-cyber-orange leading-none">Missing</h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-cyber-orange">Signals</span>
               </div>
            </div>
            <div className="space-y-3 flex-grow">
               {result.penalties?.length > 0 ? result.penalties.map((p, i) => (
                 <div key={i} className="p-4 bg-cyber-orange/[0.03] border border-cyber-orange/10 rounded-md flex items-start gap-3 group hover:border-cyber-orange/30 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyber-orange/60 mt-2 flex-shrink-0" />
                    <p className="text-[11px] font-bold text-cyber-orange uppercase leading-tight tracking-tight">{p.label}</p>
                 </div>
               )) : (
                 <div className="p-4 border border-cyber-orange/10 rounded-md text-[10px] font-mono text-cyber-orange/60 text-center italic bg-cyber-orange/[0.02]">
                    Full data sync achieved.
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* SECTION: SENTINEL AGENT HUB */}
      <div className="space-y-4 pt-12">
         <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700 pl-2">
           Autonomous Sentinel Network [Trace_Log]
         </h3>
         <SentinelAgents agents={result.agents} />
      </div>

      {/* SECTION: RAW SENTINEL SIGNALS (THE EVIDENCE) */}
      <div className="glass-card p-8 overflow-hidden mt-12 bg-black/20 border-white/5">
         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-8 flex items-center gap-2">
            <Cpu size={14} className="text-cyber-cyan" />
            Raw Execution Proof [Logic_Trace]
         </h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
              <div key={sig.label} className="p-4 bg-white/[0.02] border border-white/5 rounded hover:bg-white/[0.05] transition-colors group">
                 <div className="text-[7px] font-black uppercase tracking-widest text-gray-700 mb-1 group-hover:text-gray-500 transition-colors">{sig.label}</div>
                 <div className="font-mono text-[11px] text-cyber-cyan tracking-tighter truncate">{sig.val}</div>
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
