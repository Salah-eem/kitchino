'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Product } from '@/types';

interface SearchAutocompleteProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchAutocomplete({
  onSearch,
  placeholder = 'Search products...',
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length > 0) {
        try {
          const response = await apiClient.getProducts(1, 5, { name: debouncedQuery });
          const products = response.data.items as Product[];
          setSuggestions(products.map(p => p.name));
          setIsOpen(true);
        } catch (error) {
          console.error('Failed to fetch search suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSelect = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setIsOpen(false);
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== suggestion);
      return [suggestion, ...filtered].slice(0, 5);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) handleSelect(query);
  };

  return (
    <div className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (query || recentSearches.length > 0) setIsOpen(true); }}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-11 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
        </div>
      </form>

      <AnimatePresence>
        {isOpen && (inputRef.current === document.activeElement || query) && (
          <motion.div
            className="absolute top-full left-0 right-0 bg-dark-card border border-dark-border rounded-xl mt-2 shadow-2xl z-50 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {suggestions.length > 0 && (
              <div>
                <div className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-dark-surface border-b border-dark-border flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  Suggestions
                </div>
                {suggestions.slice(0, 5).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSelect(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-dark-border last:border-b-0 text-gray-300 hover:text-gold"
                  >
                    <Search className="w-3.5 h-3.5 text-gray-600" />
                    <span className="flex-1 text-sm">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            {recentSearches.length > 0 && suggestions.length === 0 && (
              <div>
                <div className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-dark-surface border-b border-dark-border flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Recent
                </div>
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSelect(search)}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-dark-border last:border-b-0 text-gray-400 hover:text-gold"
                  >
                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                    <span className="flex-1 text-sm">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {suggestions.length === 0 && query && (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No products found matching &quot;{query}&quot;</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
