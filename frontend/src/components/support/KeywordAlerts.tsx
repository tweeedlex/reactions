import { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import type { KeywordAlert } from '@/types';

interface KeywordAlertsProps {
  alerts: KeywordAlert[];
}

function KeywordAlerts({ alerts }: KeywordAlertsProps) {
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);

  const currentAlert = alerts[currentAlertIndex];
  const currentComment = currentAlert?.comments[currentCommentIndex];

  const nextAlert = () => {
    setCurrentAlertIndex((prev) => (prev + 1) % alerts.length);
    setCurrentCommentIndex(0);
  };

  const prevAlert = () => {
    setCurrentAlertIndex((prev) => (prev - 1 + alerts.length) % alerts.length);
    setCurrentCommentIndex(0);
  };

  const nextComment = () => {
    if (currentAlert) {
      setCurrentCommentIndex((prev) => (prev + 1) % currentAlert.comments.length);
    }
  };

  const prevComment = () => {
    if (currentAlert) {
      setCurrentCommentIndex((prev) => (prev - 1 + currentAlert.comments.length) % currentAlert.comments.length);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 border-red-500 text-red-300';
      case 'medium':
        return 'bg-orange-500/20 border-orange-500 text-orange-300';
      default:
        return 'bg-blue-500/20 border-blue-500 text-blue-300';
    }
  };

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return text;
    
    let highlightedText = text;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-400 text-yellow-900 px-1 rounded font-semibold">$1</mark>');
    });
    
    return highlightedText;
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20 text-center">
        <p className="text-gray-400">Немає алертів по ключових словах</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-purple-500/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Алерти по ключових словах</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={prevAlert}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              disabled={alerts.length <= 1}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <span className="text-sm text-gray-400">
              {currentAlertIndex + 1} з {alerts.length}
            </span>
            <button
              onClick={nextAlert}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              disabled={alerts.length <= 1}
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Info */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(currentAlert.severity)}`}>
              {currentAlert.severity === 'high' ? 'Високий' : currentAlert.severity === 'medium' ? 'Середній' : 'Низький'}
            </span>
            <h4 className="text-lg font-semibold text-white">"{currentAlert.keyword}"</h4>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {getTrendIcon(currentAlert.trend)}
            <span>{currentAlert.count} згадок</span>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          Остання згадка: {currentAlert.lastMention}
        </p>
      </div>

      {/* Comments Slider */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-sm font-medium text-gray-300">
            Коментарі з цим ключовим словом ({currentAlert.comments.length})
          </h5>
          <div className="flex items-center gap-2">
            <button
              onClick={prevComment}
              className="p-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              disabled={currentAlert.comments.length <= 1}
            >
              <ChevronLeft className="w-3 h-3 text-white" />
            </button>
            <span className="text-xs text-gray-400">
              {currentCommentIndex + 1} з {currentAlert.comments.length}
            </span>
            <button
              onClick={nextComment}
              className="p-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              disabled={currentAlert.comments.length <= 1}
            >
              <ChevronRight className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>

        {currentComment && (
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-lg">
                  {currentComment.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">{currentComment.username}</span>
                    <span className="text-xs text-gray-400">{currentComment.platform}</span>
                  </div>
                  <span className="text-xs text-gray-500">{currentComment.timestamp}</span>
                </div>
              </div>
              <a
                href={currentComment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 bg-slate-600 hover:bg-slate-500 rounded transition-colors"
              >
                <ExternalLink className="w-3 h-3 text-gray-300" />
              </a>
            </div>

            <div className="mb-3">
              <p 
                className="text-sm text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: highlightKeywords(currentComment.text, currentComment.highlightedKeywords || []) 
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>👍 {currentComment.likes}</span>
                <span>💬 {currentComment.replies}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentComment.sentiment === 'positive' 
                    ? 'bg-green-500/20 text-green-300' 
                    : currentComment.sentiment === 'negative'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {currentComment.sentiment === 'positive' ? 'Позитивний' : 
                   currentComment.sentiment === 'negative' ? 'Негативний' : 'Нейтральний'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentComment.priority === 'high' 
                    ? 'bg-red-500/20 text-red-300' 
                    : currentComment.priority === 'medium'
                    ? 'bg-orange-500/20 text-orange-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {currentComment.priority === 'high' ? 'Високий' : 
                   currentComment.priority === 'medium' ? 'Середній' : 'Низький'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dots Indicator */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="flex justify-center gap-2">
          {alerts.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentAlertIndex(index);
                setCurrentCommentIndex(0);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentAlertIndex ? 'bg-purple-400' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default KeywordAlerts;
