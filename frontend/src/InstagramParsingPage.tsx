import React, { useState, useEffect } from 'react';
import { Send, Download, MessageSquare, Heart, User, Calendar, RefreshCw, CheckCircle, AlertCircle, Instagram } from 'lucide-react';

interface InstagramComment {
  id: number;
  postUrl: string;
  commentId: string;
  text: string;
  authorUsername: string;
  authorFullName: string;
  authorProfilePictureUrl?: string;
  likesCount: number;
  timestamp: string;
  parentCommentId?: string;
  isReply: boolean;
  createdAt: string;
}

interface InstagramParsingResult {
  success: boolean;
  message: string;
  parsedCount?: number;
  timestamp?: string;
}

const InstagramParsingPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<InstagramComment[]>([]);
  const [message, setMessage] = useState('');
  const [parsingResult, setParsingResult] = useState<InstagramParsingResult | null>(null);
  const [showParsedComments, setShowParsedComments] = useState(false);
  const [lastParsedUrl, setLastParsedUrl] = useState('');
  const [maxComments, setMaxComments] = useState(100);

  const handleParse = async () => {
    if (!url) {
      setMessage('Будь ласка, введіть URL Instagram поста');
      return;
    }

    // Перевірка на валідний Instagram URL
    if (!url.includes('instagram.com/p/')) {
      setMessage('Будь ласка, введіть валідний URL Instagram поста (наприклад: https://www.instagram.com/p/DI_rMo2CCTz)');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setParsingResult(null);
    setShowParsedComments(false);

    try {
      const response = await fetch('http://localhost:3000/instagram-parsing/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          urls: [url],
          maxComments: maxComments,
          useApifyProxy: true
        }),
      });

      const result = await response.json();
      
      const parsingResult: InstagramParsingResult = {
        success: result.length > 0,
        message: result.length > 0 ? `Успішно напарсено ${result.length} коментарів` : 'Коментарі не знайдено',
        parsedCount: result.length,
        timestamp: new Date().toISOString()
      };

      setParsingResult(parsingResult);
      setLastParsedUrl(url);
      
      if (result.length > 0) {
        setMessage('Парсинг завершено успішно!');
        await loadComments();
        setShowParsedComments(true);
      } else {
        setMessage('Коментарі не знайдено або пост недоступний');
      }
    } catch (error) {
      setMessage('Помилка при парсингу Instagram коментарів');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch('http://localhost:3000/instagram-parsing/comments');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const getFilteredComments = () => {
    if (showParsedComments && lastParsedUrl) {
      return comments.filter(comment => comment.postUrl === lastParsedUrl);
    }
    return comments;
  };

  const handleShowAllComments = () => {
    setShowParsedComments(false);
  };

  const handleShowParsedComments = () => {
    setShowParsedComments(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Instagram className="mr-3 text-pink-600" />
            Парсинг коментарів з Instagram
          </h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Instagram поста
              </label>
              <div className="flex space-x-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/DI_rMo2CCTz"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button
                  onClick={handleParse}
                  disabled={isLoading}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Парсити
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Максимальна кількість коментарів
                </label>
                <input
                  type="number"
                  value={maxComments}
                  onChange={(e) => setMaxComments(parseInt(e.target.value) || 100)}
                  min="1"
                  max="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-500">
                  <p>Рекомендовано: 50-200 коментарів</p>
                  <p>Максимум: 1000 коментарів</p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('Помилка') || message.includes('не знайдено')
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {message}
              </div>
            )}

            {/* Результати парсингу */}
            {parsingResult && (
              <div className={`mt-6 p-6 rounded-lg border-2 ${
                parsingResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {parsingResult.success ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      parsingResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {parsingResult.success ? 'Парсинг завершено успішно!' : 'Помилка парсингу'}
                    </h3>
                    <p className={`mt-2 ${
                      parsingResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {parsingResult.message}
                    </p>
                    
                    {parsingResult.success && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Instagram className="h-6 w-6 text-pink-600" />
                          <div>
                            <p className="font-medium text-gray-900">Instagram пост</p>
                            <p className="text-sm text-gray-600">Напарсено коментарів: {parsingResult.parsedCount}</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-4 mt-4">
                          <button
                            onClick={handleShowParsedComments}
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center space-x-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>Переглянути напарсені коментарі</span>
                          </button>
                          <button
                            onClick={handleShowAllComments}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span>Всі коментарі</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Download className="mr-3 text-pink-600" />
              {showParsedComments ? 'Напарсені коментарі' : 'Збережені коментарі'} ({getFilteredComments().length})
            </h2>
            <div className="flex space-x-2">
              {showParsedComments && (
                <button
                  onClick={handleShowAllComments}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Всі коментарі</span>
                </button>
              )}
              <button
                onClick={loadComments}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Оновити
              </button>
            </div>
          </div>

          {getFilteredComments().length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Instagram className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Коментарі ще не додані. Почніть парсинг Instagram поста!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredComments().map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4 mb-4">
                    {comment.authorProfilePictureUrl ? (
                      <img 
                        src={comment.authorProfilePictureUrl} 
                        alt={comment.authorUsername}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-pink-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{comment.authorFullName || comment.authorUsername}</h3>
                        <span className="text-sm text-gray-500">@{comment.authorUsername}</span>
                        {comment.isReply && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Відповідь
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatTimestamp(comment.timestamp)}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Heart className="h-4 w-4" />
                      <span>{comment.likesCount}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-800 leading-relaxed">{comment.text}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>ID коментаря: {comment.commentId}</span>
                    <span>
                      Збережено: {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstagramParsingPage;
