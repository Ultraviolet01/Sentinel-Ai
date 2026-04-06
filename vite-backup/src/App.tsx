import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchInput } from './components/SearchInput';
import { AnalysisResult } from './components/AnalysisResult';
import { DetailDrawer } from './components/DetailDrawer';
import { fetchTokenData, TokenMetadata } from './lib/data-fetcher';
import { analyzeToken, ScorecardResult } from './lib/ai-analyzer';
import { ShieldCheck, Info } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{ metadata: TokenMetadata; result: ScorecardResult } | null>(null);

  const handleSearch = async (input: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // 1. Fetch Data
      const metadata = await fetchTokenData(input);
      
      // 2. Analyze with AI
      const result = await analyzeToken(metadata);
      
      setAnalysis({ metadata, result });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh p-6 md:p-12 selection:bg-neon-purple/30 selection:text-neon-purple text-gray-100 font-inter">
      {/* Navbar / Logo */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-20 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="bg-neon-purple p-2 rounded-lg neon-glow-purple">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-orbitron font-bold tracking-tighter">
            Four.<span className="text-cyber-green">Scan</span>
          </h1>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-neon-purple transition-colors">How it works</a>
          <a href="#" className="hover:text-neon-purple transition-colors">API Docs</a>
          <a href="https://four.meme" target="_blank" rel="noreferrer" className="px-4 py-1.5 border border-glass-border rounded-full hover:bg-white/5 transition-all">Launch on Four.Meme</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white"
          >
            AI-POWERED <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-cyber-green">MEME SCANNER</span>
          </motion.h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Is this meme launch gaining real traction, or is it likely low-quality / dangerous? Get your scorecard in seconds.
          </p>
        </div>

        <SearchInput onSearch={handleSearch} isLoading={isLoading} />

        {/* Error Handling */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm max-w-2xl mx-auto flex items-center gap-3"
            >
              <Info size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Area */}
        {analysis && (
          <AnalysisResult 
            metadata={analysis.metadata} 
            result={analysis.result} 
            onOpenDetails={() => setIsDrawerOpen(true)}
          />
        )}

        {/* Detail Drawer */}
        {analysis && (
          <DetailDrawer 
            isOpen={isDrawerOpen} 
            onClose={() => setIsDrawerOpen(false)} 
            result={analysis.result} 
          />
        )}

        {/* Empty State / Hints */}
        {!analysis && !isLoading && (
          <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            <div className="glass-card p-6 border-t-2 border-neon-purple/50">
              <h3 className="text-sm font-bold mb-2 uppercase opacity-50">Multi-Input</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Paste any BSC contract, a Four.Meme link, or simply search by the token's name.
              </p>
            </div>
            <div className="glass-card p-6 border-t-2 border-cyber-green/50">
              <h3 className="text-sm font-bold mb-2 uppercase opacity-50">Flash Analysis</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Powered by Gemini 1.5 Flash for sub-second analysis of narrative, community, and risk.
              </p>
            </div>
            <div className="glass-card p-6 border-t-2 border-blue-500/50">
              <h3 className="text-sm font-bold mb-2 uppercase opacity-50">Safe Trading</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We cross-check DexScreener data, social signals, and on-chain liquidity depth.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-40 max-w-7xl mx-auto border-t border-glass-border pt-8 pb-12 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between gap-4">
        <p>&copy; 2026 Four.Scan AI | Precision Memecoin Intelligence</p>
        <div className="flex gap-4 justify-center">
          <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
          <a href="#" className="hover:text-gray-300 transition-colors">BSC Official</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
