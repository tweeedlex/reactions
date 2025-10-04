import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  tooltipContent?: React.ReactNode;
}

export function MetricCard({ title, value, trend, icon: Icon, gradientFrom, gradientTo, tooltipContent }: MetricCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-gray-400 text-sm">{title}</p>
            {tooltipContent && (
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 border border-purple-500/30 text-white text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                  {tooltipContent}
                </div>
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={trend.direction === 'up' ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={`w-16 h-16 bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-full flex items-center justify-center`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}
