'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';
import { ScorecardResult } from '@/lib/ai-analyzer';

interface SentinelAgentsProps {
  agents: ScorecardResult['agents'];
}

export const SentinelAgents: React.FC<SentinelAgentsProps> = ({ agents }) => {
  // Safe fallbacks to prevent rendering crashes
  const watch = agents?.watch || { status: 'Offline', report: 'Sentinel watch currently recalibrating...', stability: 0 };
  const narrative = agents?.narrative || { trend: 'Stagnant', report: 'Narrative trend gathering data...', first24hIntel: '' };
  const alert = agents?.alert || { severity: 'Normal', signal: 'No critical anomalies detected.' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* WATCH AGENT */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 border-t-2 border-cyber-cyan/30"
      >
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <Eye size={16} className="text-cyber-cyan" />
             <span className="text-[10px] font-black uppercase tracking-widest text-cyber-cyan">Watch Agent</span>
           </div>
           <div className="text-[8px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">ID: HST-01</div>
        </div>
        
        <div className="space-y-3">
           <div className="flex justify-between items-end">
              <span className="text-2xl font-black font-orbitron text-white">{watch.stability}%</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500 pb-1">Stability Rate</span>
           </div>
           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${watch.stability}%` }}
                className="h-full bg-cyber-cyan shadow-[0_0_10px_rgba(144,247,236,0.5)]"
              />
           </div>
           <p className="text-[11px] text-gray-400 leading-relaxed italic">
             "{watch.report}"
           </p>
        </div>
      </motion.div>

      {/* NARRATIVE AGENT */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 border-t-2 border-neon-purple/30"
      >
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <TrendingUp size={16} className="text-neon-purple" />
             <span className="text-[10px] font-black uppercase tracking-widest text-neon-purple">Narrative Agent</span>
           </div>
           <div className="text-[8px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">ID: ANT-02</div>
        </div>
        
        <div className="space-y-3">
           <div className="flex justify-between items-center">
              <span className={`text-xs font-black uppercase tracking-[0.2em] px-3 py-1 rounded bg-white/5 border ${
                narrative.trend === 'Rising' ? 'text-cyber-green border-cyber-green/30' : 
                narrative.trend === 'Dying' ? 'text-red-500 border-red-500/30' : 'text-gray-400 border-white/10'
              }`}>
                {narrative.trend}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Vibe Velocity</span>
           </div>
           <p className="text-[11px] text-gray-400 leading-relaxed italic mb-3">
             "{narrative.report}"
           </p>
           {narrative.first24hIntel && (
             <div className="p-2 bg-cyan-500/5 border border-cyan-500/20 rounded text-[10px] text-cyan-400 font-mono">
                <span className="text-cyan-500 font-bold">[24H_INTEL]:</span> {narrative.first24hIntel}
             </div>
           )}
        </div>
      </motion.div>

      {/* ALERT AGENT */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 border-t-2 border-red-500/30"
      >
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <ShieldAlert size={16} className="text-cyber-red" />
             <span className="text-[10px] font-black uppercase tracking-widest text-cyber-red">Alert Agent</span>
           </div>
           <div className="text-[8px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">ID: GRD-03</div>
        </div>
        
        <div className="space-y-3">
           <div className="flex justify-between items-center">
              <span className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                alert.severity === 'Critical' ? 'text-cyber-red' : 
                alert.severity === 'Warning' ? 'text-cyber-orange' : 'text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  alert.severity === 'Critical' ? 'bg-cyber-red' : 
                  alert.severity === 'Warning' ? 'bg-cyber-orange' : 'bg-gray-500'
                }`} />
                {alert.severity}
              </span>
           </div>
           <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
             {alert.signal}
           </p>
        </div>
      </motion.div>
    </div>
  );
};
