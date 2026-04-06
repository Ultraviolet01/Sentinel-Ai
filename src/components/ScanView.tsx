'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from '@/components/AnalysisResult';
import { DetailDrawer } from '@/components/DetailDrawer';
import { TokenMetadata } from '@/lib/data-fetcher';
import { ScorecardResult } from '@/lib/ai-analyzer';
import { SearchInput } from '@/components/SearchInput';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface ScanViewProps {
  initialData: {
    metadata: TokenMetadata;
    result: ScorecardResult;
  };
}

export const ScanView: React.FC<ScanViewProps> = ({ initialData }) => {
  const [data, setData] = useState(initialData);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/scan/${query}`);
  };

  return (
    <div className="container mx-auto px-6 pb-20">
      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-12">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Scanner</span>
        </button>
        <div className="w-full max-w-sm hidden md:block">
           <SearchInput onSearch={handleSearch} isLoading={isLoading} />
        </div>
        <div className="text-[10px] text-cyber-green font-mono uppercase tracking-widest hidden lg:block">
          Synced with Unibase Membase
        </div>
      </div>

      {/* Main Results */}
      <AnimatePresence mode="wait">
        <AnalysisResult 
          key={data.metadata.address}
          metadata={data.metadata}
          result={data.result}
          onOpenDetails={() => setIsDrawerOpen(true)}
        />
      </AnimatePresence>

      {/* Alpha Drawer */}
      <DetailDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        result={data.result}
      />
    </div>
  );
};
