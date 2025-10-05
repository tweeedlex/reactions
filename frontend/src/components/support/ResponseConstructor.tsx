import { useState, useEffect } from 'react';
import { Zap, Copy, Send, MessageSquare, Sparkles, ExternalLink } from 'lucide-react';
import type { Comment, ResponseStyle, SupportTicket } from '@/types';
import { generateResponse } from '@/utils/responseTemplates';
import { supportService } from '@/utils/supportService';

interface ResponseConstructorProps {
  selectedComment: Comment | null;
  selectedTicket?: SupportTicket | null;
}

export function ResponseConstructor({ selectedComment, selectedTicket }: ResponseConstructorProps) {
  const [responseText, setResponseText] = useState('');
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>('friendly');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [useAiResponse, setUseAiResponse] = useState(false);

  // Завантажуємо AI відповідь при виборі тікета
  useEffect(() => {
    if (selectedTicket?.ai_suggested_answer_text) {
      setAiResponse(selectedTicket.ai_suggested_answer_text);
      setUseAiResponse(true);
      setResponseText(selectedTicket.ai_suggested_answer_text);
    } else {
      setAiResponse('');
      setUseAiResponse(false);
      setResponseText('');
    }
  }, [selectedTicket]);

  const handleGenerateResponse = () => {
    if (selectedComment) {
      const response = generateResponse(selectedComment, responseStyle);
      setResponseText(response);
      setUseAiResponse(false);
    }
  };

  const handleUseAiResponse = () => {
    if (aiResponse) {
      setResponseText(aiResponse);
      setUseAiResponse(true);
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
            {selectedTicket && (
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                #{selectedTicket.number}
              </span>
            )}
          </div>
          <p className="text-gray-300 mb-3">{selectedComment.text}</p>
          
          {/* Додаткова інформація з тікета */}
          {selectedTicket && (
            <div className="border-t border-gray-600 pt-3 mt-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Статус:</span>
                  <span className="ml-2 text-white">{selectedTicket.status_title}</span>
                </div>
                <div>
                  <span className="text-gray-400">Тип:</span>
                  <span className="ml-2 text-white">{selectedTicket.ticket_type_title}</span>
                </div>
                <div>
                  <span className="text-gray-400">Тема:</span>
                  <span className="ml-2 text-white">{selectedTicket.ai_theme}</span>
                </div>
                <div>
                  <span className="text-gray-400">Тональність:</span>
                  <span className="ml-2 text-white">{selectedTicket.ai_ton_of_voice_title}</span>
                </div>
              </div>
              
              {/* Теги */}
              {selectedTicket.tags_array && selectedTicket.tags_array.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-400 text-sm">Теги:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTicket.tags_array.map((tag, index) => (
                      <span key={index} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Джерело даних */}
              {selectedTicket.ai_company_answer_data_source_title && (
                <div className="mt-3">
                  <span className="text-gray-400 text-sm">Джерело:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white text-sm">{selectedTicket.ai_company_answer_data_source_title}</span>
                    {selectedTicket.ai_company_answer_data_source_url && (
                      <a 
                        href={selectedTicket.ai_company_answer_data_source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      

      {/* AI відповідь */}
      {aiResponse && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <label className="text-sm font-medium text-gray-300">AI запропонована відповідь:</label>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-3">
            <p className="text-gray-300 text-sm">{aiResponse}</p>
          </div>
          <button
            onClick={handleUseAiResponse}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Використати AI відповідь
          </button>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={handleGenerateResponse}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Згенерувати власну відповідь
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
