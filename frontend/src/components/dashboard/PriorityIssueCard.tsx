import { TrendingUp, TrendingDown } from 'lucide-react';
import type { PriorityIssue } from '@/types';

interface PriorityIssueCardProps {
  issue: PriorityIssue;
}

export function PriorityIssueCard({ issue }: PriorityIssueCardProps) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-white font-semibold">{issue.title}</h4>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                issue.severity === 'high'
                  ? 'bg-red-500/20 text-red-400'
                  : issue.severity === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-green-500/20 text-green-400'
              }`}
            >
              {issue.severity === 'high' ? 'Критично' : issue.severity === 'medium' ? 'Важливо' : 'Низький'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{issue.mentions} згадок</span>
            <span>{issue.source}</span>
            <span
              className={`${
                issue.sentiment === 'negative'
                  ? 'text-red-400'
                  : issue.sentiment === 'positive'
                  ? 'text-green-400'
                  : 'text-yellow-400'
              }`}
            >
              {issue.sentiment === 'negative' ? 'Негативний' : issue.sentiment === 'positive' ? 'Позитивний' : 'Нейтральний'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {issue.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-400" />}
          {issue.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-400" />}
          {issue.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full"></div>}
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">Дії</button>
        </div>
      </div>
    </div>
  );
}
