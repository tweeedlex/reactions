import { useState } from 'react';
import { Zap, Copy, Send, MessageSquare } from 'lucide-react';
import type { Comment, ResponseStyle } from '@/types';
import { generateResponse } from '@/utils/responseTemplates';

interface ResponseConstructorProps {
  selectedComment: Comment | null;
}

export function ResponseConstructor({ selectedComment }: ResponseConstructorProps) {
  const [responseText, setResponseText] = useState('');
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>('friendly');

  const handleGenerateResponse = () => {
    if (selectedComment) {
      const response = generateResponse(selectedComment, responseStyle);
      setResponseText(response);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(responseText);
  };

  if (!selectedComment) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 text-center">
        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Оберіть коментар</h3>
        <p className="text-gray-400">Натисніть на коментар зліва, щоб почати створювати відповідь</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Обраний коментар:</h3>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{selectedComment.avatar}</span>
            <span className="font-semibold text-white">{selectedComment.username}</span>
            <span className="text-sm text-gray-400">({selectedComment.platform})</span>
          </div>
          <p className="text-gray-300">{selectedComment.text}</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Стиль відповіді:</label>
        <div className="grid grid-cols-3 gap-2">
          {(['official', 'friendly', 'support'] as ResponseStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setResponseStyle(style)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                responseStyle === style ? 'bg-purple-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {style === 'official' ? 'Офіційний' : style === 'friendly' ? 'Дружній' : 'Техпідтримка'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={handleGenerateResponse}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Згенерувати відповідь
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Текст відповіді:</label>
        <textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          className="w-full h-40 bg-slate-700 text-white p-4 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none resize-none"
          placeholder="Тут з'явиться згенерована відповідь..."
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={copyToClipboard}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          disabled={!responseText}
        >
          <Copy className="w-4 h-4" />
          Копіювати
        </button>
        <button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          disabled={!responseText}
        >
          <Send className="w-4 h-4" />
          Відправити
        </button>
      </div>
    </div>
  );
}
