import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface AdminActionButtonProps {
  className: string;
  disabled: boolean;
  icon: ReactNode;
  isProcessing: boolean;
  label: string;
  onClick: () => void;
}

export function AdminActionButton({
  className,
  disabled,
  icon,
  isProcessing,
  label,
  onClick,
}: AdminActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-white disabled:opacity-50 ${className}`}
    >
      {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      {!isProcessing && label}
    </button>
  );
}
