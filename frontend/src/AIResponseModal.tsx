import { useState, useEffect } from 'react';
import { X, Copy, RefreshCw, CheckCircle, AlertTriangle, Clock, MessageSquare } from 'lucide-react';
import type { PrioritizedFeedback } from './types';

interface AIResponse {
  suggestion: string;
  tone: 'professional' | 'friendly' | 'apologetic' | 'grateful';
  category: 'complaint' | 'praise' | 'question' | 'suggestion';
  confidence: number;
}

interface AIResponseModalProps {
  feedback: PrioritizedFeedback | null;
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = 'http://localhost:3000';

export function AIResponseModal({ feedback, isOpen, onClose }: AIResponseModalProps) {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Генеруємо відповідь при відкритті модального вікна
  useEffect(() => {
    if (isOpen && feedback) {
      generateResponse();
    }
  }, [isOpen, feedback]);

  const generateResponse = async () => {
    if (!feedback) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: feedback.text,
          sentiment: feedback.sentiment,
          source: feedback.source,
          author: feedback.author,
          category: feedback.category,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAiResponse(data);
    } catch (err) {
      console.error('Помилка генерації відповіді:', err);
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (aiResponse?.suggestion) {
      try {
        await navigator.clipboard.writeText(aiResponse.suggestion);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Помилка копіювання:', err);
      }
    }
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'professional': return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'friendly': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'apologetic': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'grateful': return <CheckCircle className="w-4 h-4 text-purple-400" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  const getToneText = (tone: string) => {
    switch (tone) {
      case 'professional': return 'Професійний';
      case 'friendly': return 'Дружній';
      case 'apologetic': return 'Вибачливий';
      case 'grateful': return 'Вдячний';
      default: return 'Невідомий';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'complaint': return 'Скарга';
      case 'praise': return 'Похвала';
      case 'question': return 'Питання';
      case 'suggestion': return 'Пропозиція';
      default: return 'Загальний';
    }
  };

  if (!isOpen || !feedback) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-purple-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Швидка відповідь</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Оригінальний відгук */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Оригінальний відгук:</h3>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-gray-600/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-400">{feedback.author}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-sm text-gray-400">{feedback.source}</span>
              </div>
              <p className="text-gray-300 text-sm">{feedback.text}</p>
            </div>
          </div>

          {/* AI Відповідь */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
              <span className="ml-2 text-gray-300">Генеруємо відповідь...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">Помилка</span>
              </div>
              <p className="text-red-300 text-sm">{error}</p>
              <button
                onClick={generateResponse}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Спробувати знову
              </button>
            </div>
          )}

          {aiResponse && (
            <div className="space-y-4">
              {/* Метадані відповіді */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {getToneIcon(aiResponse.tone)}
                  <span className="text-gray-300">{getToneText(aiResponse.tone)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{getCategoryText(aiResponse.category)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">{Math.round(aiResponse.confidence * 100)}% впевненості</span>
                </div>
              </div>

              {/* Текст відповіді */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Пропонована відповідь:</h3>
                <p className="text-gray-100 leading-relaxed">{aiResponse.suggestion}</p>
              </div>

              {/* Дії */}
              <div className="flex items-center gap-3">
                <button
                  onClick={copyToClipboard}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Скопійовано!' : 'Копіювати'}
                </button>
                <button
                  onClick={generateResponse}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Згенерувати іншу
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
