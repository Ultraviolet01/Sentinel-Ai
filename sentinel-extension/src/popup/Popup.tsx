import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  ExternalLink, 
  Cpu,
  RefreshCw,
  Volume2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioHandler } from '../lib/audio-handler';
import { SentinelError, SentinelErrorCode } from '../lib/errors';

const Popup = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<SentinelError | null>(null);

  const startScan = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new SentinelError(SentinelErrorCode.ACCESS_RESTRICTED, "No active tab detected.");

      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('https://chrome.google.com')) {
          throw new SentinelError(SentinelErrorCode.ACCESS_RESTRICTED, "Cannot scan browser system pages.");
      }

      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_TOKEN" });
      } catch (e) {
        throw new SentinelError(SentinelErrorCode.ACCESS_RESTRICTED, "Content script connection failed. Try reloading the page.");
      }

      const extraction = response;
      if (!extraction || extraction.confidence === 0) {
        throw new SentinelError(SentinelErrorCode.NO_TOKEN_FOUND);
      }

      const analysisResponse = await chrome.runtime.sendMessage({ 
        action: "ANALYZE_TOKEN", 
        extraction,
        scanMode: "manual"
      });

      if (analysisResponse.success) {
        const audit = analysisResponse.data;
        setData(audit);
        AudioHandler.announceVerdict(audit.shortSummary, audit.audioBase64);
      } else {
        throw new SentinelError(SentinelErrorCode.API_FAILURE, analysisResponse.error);
      }
    } catch (err: any) {
      if (err instanceof SentinelError) setError(err);
      else setError(new SentinelError(SentinelErrorCode.API_FAILURE, err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderClick = () => {
    chrome.tabs.create({ url: 'https://sentinel-ai-ruddy.vercel.app' });
  };

  return (
    <div className="w-96 min-h-screen bg-deep-space text-foreground font-inter p-6 space-y-6 overflow-hidden relative">
      <div className="scanline" />
      
      {/* Header */}
      <div className="flex justify-between items-center relative z-10">
        <div 
          onClick={handleHeaderClick}
          className="cursor-pointer group select-none"
        >
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black font-orbitron tracking-tighter text-white group-hover:text-neon-purple transition-colors">FourScan</h1>
            <div className="w-1.5 h-1.5 bg-cyber-green rounded-full animate-pulse shadow-[0_0_8px_rgba(5,255,161,0.5)]" />
          </div>
          <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">Sentient Background Listening Active <ExternalLink size={8} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" /></p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={startScan}
            disabled={loading}
            className="p-2 border border-white/10 rounded text-gray-500 hover:text-white hover:border-white/30 transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Content with Framer Motion */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!data && !loading && !error && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="relative">
                <Cpu size={48} className="text-gray-700" />
                <motion.div 
                  className="absolute inset-0 text-neon-purple/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Cpu size={48} />
                </motion.div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Awaiting Operative Target</p>
                <p className="text-[8px] text-gray-700 font-mono">SECURE SCAN CHANNEL V1.0</p>
              </div>
              <button 
                onClick={startScan}
                className="px-8 py-2.5 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple/20 hover:border-neon-purple hover:shadow-[0_0_20px_rgba(188,19,254,0.2)] transition-all rounded"
              >
                Launch Intelligence Scan
              </button>
            </motion.div>
          )}

          {loading && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="relative w-20 h-20">
                <motion.div 
                  className="absolute inset-0 border-2 border-neon-purple/30 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-2 border-t-2 border-neon-purple rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap size={24} className="text-neon-purple animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black animate-pulse text-neon-purple uppercase tracking-[0.4em]">Deciphering...</p>
                <div className="flex gap-1 justify-center">
                   {[0, 1, 2].map(i => (
                     <motion.div 
                        key={i}
                        className="w-1 h-1 bg-neon-purple/40 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                     />
                   ))}
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-10 border-red-500/30 bg-red-500/[0.02] text-center space-y-6"
            >
              <div className="relative inline-block">
                <ShieldAlert size={48} className="text-red-500 mx-auto" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                   <AlertCircle size={10} className="text-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-black font-mono text-red-400 uppercase tracking-widest">{error.userMessage}</p>
                <p className="text-[8px] text-gray-600 font-mono leading-tight">{error.message}</p>
              </div>

              <button 
                onClick={startScan}
                className="px-8 py-3 bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-400 rounded flex items-center gap-2 mx-auto hover:bg-red-500/20 hover:border-red-500 transition-all group shadow-sm"
              >
                <RotateCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                Retry Scan
              </button>
            </motion.div>
          )}

          {data && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Score & Verdict */}
              <div className={`glass-card p-4 border-l-4 ${data.riskLevel === 'Low' ? 'border-cyber-green' : 'border-red-500'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Sentinel Grade</span>
                  <span className="text-[8px] font-black uppercase text-cyber-green/50 tracking-widest">CONFIDENCE: {data.confidence}%</span>
                </div>
                <div className="flex justify-between items-end">
                  <h2 className="text-4xl font-black font-orbitron text-white">{data.score}</h2>
                  <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${data.riskLevel === 'Low' ? 'bg-cyber-green/20 text-cyber-green' : 'bg-red-500/20 text-red-500'}`}>
                     {data.riskLevel} Risk
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="glass-card p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity">
                   <Volume2 size={10} className="text-neon-purple active:scale-125 transition-transform" onClick={() => AudioHandler.announceVerdict(data.shortSummary, data.audioBase64)} />
                </div>
                <p className="text-xs text-gray-300 leading-relaxed italic pr-4">"{data.shortSummary}"</p>
              </div>

              {/* Red Flags & Positives */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded group hover:bg-red-500/10 transition-colors">
                   <h4 className="text-[7px] font-black uppercase text-red-400 tracking-widest mb-2 flex items-center gap-1"><ShieldAlert size={8} /> Red Flags</h4>
                   <div className="space-y-1">
                     {data.redFlags.slice(0, 3).map((flag: string, i: number) => (
                        <div key={i} className="text-[8px] text-gray-400 truncate group-hover:text-gray-300">• {flag}</div>
                     ))}
                   </div>
                </div>
                <div className="p-3 bg-cyber-green/5 border border-cyber-green/10 rounded group hover:bg-cyber-green/10 transition-colors">
                   <h4 className="text-[7px] font-black uppercase text-cyber-green tracking-widest mb-2 flex items-center gap-1"><ShieldCheck size={8} /> Verified</h4>
                   <div className="space-y-1">
                     {data.positives.slice(0, 3).map((sig: string, i: number) => (
                        <div key={i} className="text-[8px] text-gray-400 truncate group-hover:text-gray-300">• {sig}</div>
                     ))}
                   </div>
                </div>
              </div>

              <button 
                onClick={() => window.open(data.fullReportUrl)}
                className="w-full py-3.5 bg-white/5 border border-white/10 rounded flex justify-center items-center gap-2 hover:bg-neon-purple/20 hover:border-neon-purple hover:shadow-[0_0_25px_rgba(188,19,254,0.15)] transition-all group"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-white">Deep Scrutiny Report</span>
                <ExternalLink size={12} className="text-gray-500 group-hover:text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="pt-4 text-[7px] text-center text-gray-800 font-mono tracking-[0.4em] uppercase opacity-50">
        Sentinel AI v1.0 // Unibase Membase Sync
      </footer>
    </div>
  );
};

export default Popup;
