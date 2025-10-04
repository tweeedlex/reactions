import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
}

export function MetricCard({ title, value, trend, icon: Icon, gradientFrom, gradientTo }: MetricCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
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
