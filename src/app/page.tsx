'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchInput } from '@/components/SearchInput';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, ShieldCheck, TrendingUp, Globe } from 'lucide-react';

import { sanitizeAddress } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);

  const handleSearch = (query: string) => {
    const address = sanitizeAddress(query);
    if (!address || !address.startsWith('0x')) return; // Basic validation
    
    setIsScanning(true);
    router.push(`/scan/${address}`);
  };

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden flex flex-col items-center">
      <div className="scanline" />
      
      {/* Top Navigation - Extension Access */}
      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={() => window.open('/sentinel-extension.zip', '_blank')}
          className="glass-card px-4 py-2 flex items-center gap-2 border border-white/10 hover:border-[#00f8bb]/50 hover:bg-[#00f8bb]/10 transition-all group"
        >
          <Globe size={14} className="text-gray-500 group-hover:text-[#00f8bb]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white">Download Extension</span>
        </button>
      </div>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/5 blur-[120px] rounded-full animate-pulse-neon" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-green/5 blur-[120px] rounded-full animate-pulse-neon" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-4xl w-full mx-auto space-y-12 text-center">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--cta-color)] mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--cta-color)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--cta-color)]"></span>
            </span>
            Sentinel AI Active
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-orbitron tracking-tighter uppercase italic leading-[0.9]">
            <span className="bg-gradient-to-r from-[#90f7ec] to-[#ffb7f5] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(144,247,236,0.3)]">
              Sentinel <br />
              AI
            </span>
          </h1>
          <p className="text-gray-400 font-mono text-xs md:text-sm max-w-xl mx-auto uppercase tracking-[0.2em] leading-relaxed opacity-80">
            The decentralized intelligence hub for the Four.Meme ecosystem. Verifiable on-chain audits, trend anthropological reports, and risk guarding.
          </p>
        </motion.div>

        {/* Search / Command Center */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-2xl mx-auto"
        >
          <AnimatePresence mode="wait">
            {!isScanning ? (
              <motion.div 
                key="input"
                exit={{ opacity: 0, scale: 1.1 }}
              >
                <SearchInput onSearch={handleSearch} isLoading={false} />
              </motion.div>
            ) : (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-12 flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
                <div className="font-mono text-[10px] text-neon-purple animate-pulse uppercase tracking-[0.5em]">
                   Initializing Sentinel Audit Trace...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Extension Installation Protocol */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-12 space-y-8"
        >
          <div className="max-w-2xl mx-auto glass-card p-8 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Globe size={80} className="text-neon-purple" />
            </div>
            
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-purple flex items-center justify-center gap-2 mb-8">
              <Zap size={14} />
              Sentinel Protocol: Extension Setup
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-neon-purple font-mono">01</div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Download Package</p>
                    <p className="text-[9px] text-gray-500 font-mono leading-relaxed">Secure the sentinel-extension.zip from the portal uplink.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-neon-purple font-mono">02</div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Access Extensions</p>
                    <p className="text-[9px] text-gray-500 font-mono leading-relaxed">Navigate to chrome://extensions in your browser interface.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-neon-purple font-mono">03</div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Developer Mode</p>
                    <p className="text-[9px] text-gray-500 font-mono leading-relaxed">Toggle Developer Mode [ON] in the upper-right control panel.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-neon-purple font-mono">04</div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Load Sentinel</p>
                    <p className="text-[9px] text-gray-500 font-mono leading-relaxed">Drag zip or select 'Load unpacked' to initialize deep-scan protection.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/5">
              <button 
                onClick={() => window.open('/sentinel-extension.zip', '_blank')}
                className="cta-button w-full"
              >
                Execute Download Protocol
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="mt-auto pt-20 text-[9px] text-gray-700 font-mono tracking-[0.4em] uppercase">
        Build 1.5.0-Sentinel // Unibase_Membase_Sync
      </footer>
    </main>
  );
}
