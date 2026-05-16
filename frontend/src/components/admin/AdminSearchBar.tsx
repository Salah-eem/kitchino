import { Search } from 'lucide-react';
import { ReactNode } from 'react';

interface AdminSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  totalCount: number;
  icon?: ReactNode;
}

export function AdminSearchBar({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search...", 
  totalCount, 
  icon 
}: AdminSearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center">
      <div className="relative flex-1 w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-gold transition-colors" />
        <input 
          type="text" 
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-dark-surface border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-gold/50 outline-none transition-all"
        />
      </div>
      <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-6 py-4 rounded-2xl">
        {icon}
        <span className="text-sm font-medium text-gray-400">
          Total: <span className="text-white">{totalCount}</span>
        </span>
      </div>
    </div>
  );
}
