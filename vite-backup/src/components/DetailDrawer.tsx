import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, AlertCircle, HelpCircle } from 'lucide-react';
import { ScorecardResult } from '../lib/ai-analyzer';

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
            <div className="p-6 space-y-8">
              
              {/* Reasoning Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <HelpCircle size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Why this score?</span>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 leading-relaxed text-sm">
                  {result.reasoning}
                </div>
              </section>

              {/* Bull Case */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-cyber-green">
                  <TrendingUp size={20} />
                  <h3 className="font-orbitron text-lg">Bull Case</h3>
                </div>
                <p className="text-gray-300 leading-relaxed pl-7 border-l border-cyber-green/30">
                  {result.bullCase}
                </p>
              </section>

              {/* Bear Case */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-orange-500">
                  <TrendingDown size={20} />
                  <h3 className="font-orbitron text-lg">Bear Case</h3>
                </div>
                <p className="text-gray-300 leading-relaxed pl-7 border-l border-orange-500/30">
                  {result.bearCase}
                </p>
              </section>

              {/* Red Flags */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle size={20} />
                  <h3 className="font-orbitron text-lg">Red Flags</h3>
                </div>
                <div className="space-y-3 pl-7">
                  {result.redFlags.map((flag, i) => (
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
