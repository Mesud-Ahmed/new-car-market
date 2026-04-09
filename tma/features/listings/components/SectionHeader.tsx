import { Truck } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Truck className="h-9 w-9 text-emerald-500" />
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-emerald-400">{subtitle}</p>}
      </div>
    </div>
  );
}
