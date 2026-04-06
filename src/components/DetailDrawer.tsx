'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, AlertCircle, HelpCircle } from 'lucide-react';
import { ScorecardResult } from '@/lib/ai-analyzer';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: ScorecardResult;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ isOpen, onClose, result }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
          />
          
          {/* Drawer Wrapper */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-deep-space border-l border-glass-border shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-deep-space/80 backdrop-blur-md p-6 border-b border-glass-border flex justify-between items-center">
              <h2 className="text-xl font-orbitron font-bold text-gradient-purple">Alpha Breakdown</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 pb-20">
              
              {/* Audit Summary & Verdict */}
              <section className="space-y-4">
                <div className={`p-4 rounded-xl border ${result.finalVerdict === 'Avoid' ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-glass-border'}`}>
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Audit Summary</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-neon-purple">Verdict: {result.finalVerdict}</span>
                   </div>
                   <p className="text-sm italic text-gray-300 leading-relaxed">
                     "{result.summary}"
                   </p>
                </div>
              </section>

              {/* Positive Signals */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-cyber-green">
                  <TrendingUp size={20} />
                  <h3 className="font-orbitron text-lg">Positive Signals</h3>
                </div>
                <div className="space-y-3 pl-7">
                  {result.topPositiveSignals.map((signal, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 bg-cyber-green/5 border border-cyber-green/10 rounded-lg text-sm text-cyber-green/80 flex items-start gap-2"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyber-green shrink-0" />
                      {signal}
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Risk Signals (Red Flags) */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle size={20} />
                  <h3 className="font-orbitron text-lg">Red Flags</h3>
                </div>
                <div className="space-y-3 pl-7">
                  {result.topRedFlags.map((flag, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-sm text-red-500/80 flex items-start gap-2"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      {flag}
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Bull Case */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-xs font-bold uppercase tracking-widest">Growth Thesis</span>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  {result.bullCase}
                </p>
              </section>

              {/* Bear Case */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-xs font-bold uppercase tracking-widest">Risk Thesis</span>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  {result.bearCase}
                </p>
              </section>

              {/* Footer CTA */}
              <div className="pt-8 text-center text-xs text-gray-500">
                AI can be wrong. Always DYOR before trading.
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
