'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchInput } from '@/components/SearchInput';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, ShieldCheck, TrendingUp, Globe } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);

  const handleSearch = (address: string) => {
    setIsScanning(true);
    setTimeout(() => {
      router.push(`/scan/${address}`);
    }, 1500);
  };

  const sampleTokens = [
    { name: 'Binance Coin', symbol: 'BNB', address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', icon: <Cpu className="text-yellow-500" /> },
    { name: 'PancakeSwap', symbol: 'CAKE', address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', icon: <Zap className="text-neon-purple" /> },
    { name: 'Tether USD', symbol: 'USDT', address: '0x55d398326f99059ff775485246999027b3197955', icon: <ShieldCheck className="text-cyber-green" /> },
  ];

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden flex flex-col items-center">
      <div className="scanline" />
      
      {/* Top Navigation - Extension Access */}
      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={() => window.open('https://github.com/USER/sentinel-extension', '_blank')}
          className="glass-card px-4 py-2 flex items-center gap-2 border border-white/10 hover:border-neon-purple/50 hover:bg-neon-purple/20 transition-all group"
        >
          <Globe size={14} className="text-gray-500 group-hover:text-neon-purple" />
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-neon-purple mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-purple opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-purple"></span>
            </span>
            Sentinel AI Active
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-orbitron tracking-tighter text-white uppercase italic">
            Sentinel <br />
            <span className="text-neon-purple">AI</span>
          </h1>
          <p className="text-gray-500 font-mono text-xs md:text-sm max-w-xl mx-auto uppercase tracking-widest leading-relaxed">
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

        {/* Sample Scans Demonstration */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-12 space-y-6"
        >
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 flex items-center justify-center gap-2">
            <TrendingUp size={14} />
            Featured Sentinel Demonstrations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleTokens.map((token) => (
              <button 
                key={token.symbol}
                onClick={() => handleSearch(token.address)}
                className="glass-card p-6 text-left hover:bg-white/[0.08] hover:border-white/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-white/5 border border-white/10 rounded group-hover:scale-110 transition-transform">
                      {token.icon}
                   </div>
                   <div className="text-[8px] font-black font-mono text-gray-500 uppercase tracking-tighter">Verified_Source</div>
                </div>
                <div className="font-orbitron text-sm font-bold text-white mb-1">{token.name}</div>
                <div className="font-mono text-[10px] text-gray-500 italic">Analyze ${token.symbol} Audit Trace</div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <footer className="mt-auto pt-20 text-[9px] text-gray-700 font-mono tracking-[0.4em] uppercase">
        Build 1.5.0-Sentinel // Unibase_Membase_Sync
      </footer>
    </main>
  );
}
