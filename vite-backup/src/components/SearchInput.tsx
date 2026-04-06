import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchInputProps {
  onSearch: (input: string) => void;
  isLoading: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onSearch(input.trim());
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="relative w-full max-w-2xl mx-auto group"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple to-cyber-green rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative flex items-center bg-deep-space border border-glass-border rounded-2xl p-2 focus-within:border-neon-purple/50 transition-all duration-300">
        <div className="pl-4 pr-2 text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Token Contract, Four.Meme Link, or Name..."
          className="flex-1 bg-transparent border-none outline-none text-gray-100 placeholder-gray-500 py-3 text-lg font-medium"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="ml-2 px-6 py-3 bg-neon-purple text-white rounded-xl font-bold uppercase tracking-wider hover:bg-neon-purple/80 hover:shadow-lg hover:shadow-neon-purple/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Analyzing
            </>
          ) : (
            "Scan"
          )}
        </button>
      </div>
    </motion.form>
  );
};
