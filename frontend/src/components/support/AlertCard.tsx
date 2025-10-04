import { TrendingUp } from 'lucide-react';
import type { Alert } from '@/types';

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        alert.type === 'critical'
          ? 'bg-red-500/10 border-red-500/30'
          : alert.type === 'warning'
          ? 'bg-yellow-500/10 border-yellow-500/30'
          : 'bg-blue-500/10 border-blue-500/30'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3
          className={`font-semibold ${
            alert.type === 'critical' ? 'text-red-400' : alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
          }`}
        >
          {alert.title}
        </h3>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm font-bold">+{alert.count}</span>
        </div>
      </div>
      <p className="text-gray-300 text-sm mb-2">{alert.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{alert.platform}</span>
        <div className="flex gap-1">
          {alert.keywords.map((keyword, index) => (
            <span key={index} className="bg-slate-700 px-2 py-1 rounded">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
