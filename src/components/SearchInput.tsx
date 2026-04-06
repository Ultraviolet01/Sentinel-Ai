'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-0 bg-neon-purple/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-lg" />
        
        <div className="relative flex items-center bg-black/40 border border-white/10 group-focus-within:border-neon-purple/50 transition-all duration-300 rounded-lg overflow-hidden backdrop-blur-md">
          <div className="pl-4 pr-2 text-neon-purple font-mono font-bold animate-pulse-neon">
            {'>'}
          </div>
          <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="PASTE FOUR.MEME URL OR ADDRESS_ [SENTINEL]"
          className="w-full bg-transparent border-none text-white font-mono placeholder:text-white/20 focus:ring-0 outline-none p-0 caret-neon-purple"
          disabled={isLoading}
        />
          <button 
            type="submit"
            disabled={isLoading}
            className="pr-4 pl-2 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Zap size={20} className="text-neon-purple" />
              </motion.div>
            ) : (
              <Search size={20} />
            )}
          </button>
        </div>

        {/* Floating Indicator */}
        <div className="absolute -bottom-6 left-0 flex gap-4 opacity-30 group-focus-within:opacity-100 transition-opacity">
           <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">System_Active: [True]</span>
           <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Encryption: [Enabled]</span>
        </div>
      </form>
    </div>
  );
};
