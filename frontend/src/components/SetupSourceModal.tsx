import { useState } from 'react';
import { X, Link, Globe, Check, AlertCircle } from 'lucide-react';
import type { SourceLink } from '@/types';

interface SetupSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sourceLink: SourceLink) => void;
  sourceName: string;
  existingUrl?: string;
}

const SOCIAL_NETWORKS = [
  { name: 'Facebook', placeholder: 'https://facebook.com/yourpage', icon: '📘' },
  { name: 'Instagram', placeholder: 'https://instagram.com/yourpage', icon: '📷' },
  { name: 'Twitter', placeholder: 'https://twitter.com/yourpage', icon: '🐦' },
  { name: 'Reddit', placeholder: 'https://reddit.com/r/yoursubreddit', icon: '🤖' },
  { name: 'Quora', placeholder: 'https://quora.com/profile/yourpage', icon: '❓' },
];

const OTHER_SOURCES = [
  { name: 'Google SERP', placeholder: 'https://google.com/search?q=yourbrand', icon: '🔍' },
  { name: 'App Store', placeholder: 'https://apps.apple.com/app/your-app', icon: '📱' },
  { name: 'Google Play', placeholder: 'https://play.google.com/store/apps/details?id=your.app', icon: '🤖' },
  { name: 'TrustPilot', placeholder: 'https://trustpilot.com/review/yourcompany', icon: '⭐' },
  { name: 'Форуми', placeholder: 'https://forum.example.com/your-thread', icon: '💬' },
];

function SetupSourceModal({ isOpen, onClose, onSave, sourceName, existingUrl }: SetupSourceModalProps) {
  const [url, setUrl] = useState(existingUrl || '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!url.trim()) {
      setError('Будь ласка, введіть посилання');
      return;
    }

    // Базова валідація URL
    try {
      new URL(url);
    } catch {
      setError('Будь ласка, введіть коректне посилання (починається з http:// або https://)');
      return;
    }

    onSave({ name: sourceName, url: url.trim() });
    onClose();
  };

  const handleClose = () => {
    setUrl('');
    setError(null);
    onClose();
  };

  const getPlaceholder = () => {
    const socialNetwork = SOCIAL_NETWORKS.find(s => s.name === sourceName);
    if (socialNetwork) return socialNetwork.placeholder;
    
    const otherSource = OTHER_SOURCES.find(s => s.name === sourceName);
    if (otherSource) return otherSource.placeholder;
    
    return 'https://example.com/your-page';
  };

  const getIcon = () => {
    const socialNetwork = SOCIAL_NETWORKS.find(s => s.name === sourceName);
    if (socialNetwork) return socialNetwork.icon;
    
    const otherSource = OTHER_SOURCES.find(s => s.name === sourceName);
    if (otherSource) return otherSource.icon;
    
    return '🔗';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl border border-purple-500/30 max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">{getIcon()}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Налаштування {sourceName}</h2>
                <p className="text-sm text-gray-400">Введіть посилання на вашу сторінку</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Посилання на сторінку {sourceName}
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-700 text-white pl-12 pr-4 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                placeholder={getPlaceholder()}
                autoFocus
              />
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Для чого це потрібно?</h4>
                <p className="text-xs text-gray-400">
                  Ми використовуємо це посилання для моніторингу відгуків та згадок вашого бренду на цій платформі.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-purple-500/20 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetupSourceModal;
