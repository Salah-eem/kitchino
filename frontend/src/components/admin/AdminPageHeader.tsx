import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
}

export function AdminPageHeader({ 
  title, 
  subtitle, 
  actionLabel, 
  onAction, 
  actionIcon = <Plus className="w-5 h-5" /> 
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">{title}</h1>
        <p className="text-gray-500 mt-1">{subtitle}</p>
      </div>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-gold hover:bg-gold/90 text-dark-bg font-bold px-6 py-6 rounded-2xl flex items-center gap-2"
        >
          {actionIcon}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
