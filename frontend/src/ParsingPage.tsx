import React, { useState } from 'react';
import { Send, Download, MessageSquare, Star, Eye, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface Comment {
  id: number;
  appId: string;
  appName: string;
  store: 'playstore' | 'appstore' | 'googlemaps';
  content: string;
  author: string;
  rating: number;
  reviewDate: string | null;
  helpfulVotes: number | null;
  createdAt: string;
}

interface ParsingResult {
  success: boolean;
  message: string;
  url: string;
  appId?: string;
  parsedCount?: number;
  appName?: string;
  store?: string;
  timestamp?: string;
}

const ParsingPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState('');
  const [parsingResult, setParsingResult] = useState<ParsingResult | null>(null);
  const [showParsedComments, setShowParsedComments] = useState(false);
  const [lastParsedUrl, setLastParsedUrl] = useState('');
  const [parsingMethod, setParsingMethod] = useState<'standard' | 'advanced'>('advanced');

  const handleParse = async () => {
    if (!url) {
      setMessage('Будь ласка, введіть URL додатку');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setParsingResult(null);
    setShowParsedComments(false);

    try {
      // Визначаємо правильний ендпоінт залежно від типу URL
      let endpoint = 'http://localhost:3000/parsing/parse';
      let isGoogleMaps = url.includes('google.com/maps') || url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl');
      
      // Перевіряємо, чи URL починається з @ (для Google Maps)
      if (url.startsWith('@') && (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps') || url.includes('google.com/maps'))) {
        endpoint = 'http://localhost:3000/google-maps/parse-with-at';
        isGoogleMaps = true;
      } else if (isGoogleMaps) {
        endpoint = 'http://localhost:3000/google-maps/parse';
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();
      
      // Визначаємо тип магазину
      let store: 'playstore' | 'appstore' | 'googlemaps' = 'playstore';
      if (url.includes('play.google.com')) {
        store = 'playstore';
      } else if (url.includes('apps.apple.com')) {
        store = 'appstore';
      } else if (isGoogleMaps) {
        store = 'googlemaps';
      }
      const appName = extractAppNameFromUrl(url);
      
      const parsingResult: ParsingResult = {
        success: result.success,
        message: result.message,
        url: result.url || url,
        appId: result.appId,
        appName: appName,
        store: store,
        parsedCount: result.parsedCount || 0,
        timestamp: result.timestamp
      };

      setParsingResult(parsingResult);
      setLastParsedUrl(url);
      
      if (result.success) {
        setMessage('Парсинг завершено успішно!');
        // Завантажуємо коментарі
        await loadComments();
        // Показуємо коментарі для цього додатку
        setShowParsedComments(true);
      } else {
        setMessage(`Помилка: ${result.message}`);
      }
    } catch (error) {
      setMessage('Помилка при парсингу');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch('http://localhost:3000/comments');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const getStoreIcon = (store: string) => {
    switch (store) {
      case 'playstore':
        return '📱';
      case 'appstore':
        return '🍎';
      case 'googlemaps':
        return '🗺️';
      default:
        return '❓';
    }
  };

  const getStoreName = (store: string) => {
    switch (store) {
      case 'playstore':
        return 'Google Play Store';
      case 'appstore':
        return 'App Store';
      case 'googlemaps':
        return 'Google Maps';
      default:
        return 'Unknown Store';
    }
  };

  const extractAppNameFromUrl = (url: string): string => {
    if (url.includes('play.google.com')) {
      // Для Google Play Store можемо спробувати витягти назву з URL
      return 'Google Play App';
    } else if (url.includes('apps.apple.com')) {
      // Для App Store
      return 'App Store App';
    } else if (url.includes('google.com/maps') || url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl')) {
      // Для Google Maps
      return 'Google Maps Place';
    }
    return 'Unknown App';
  };

  const getFilteredComments = () => {
    if (showParsedComments && lastParsedUrl) {
      // Визначаємо тип магазину за URL
      let storeType: 'playstore' | 'appstore' | 'googlemaps' | null = null;
      if (lastParsedUrl.includes('play.google.com')) {
        storeType = 'playstore';
      } else if (lastParsedUrl.includes('apps.apple.com')) {
        storeType = 'appstore';
      } else if (lastParsedUrl.includes('maps.app.goo.gl') || lastParsedUrl.includes('google.com/maps')) {
        storeType = 'googlemaps';
      }
      
      if (storeType) {
        return comments.filter(comment => comment.store === storeType);
      }
    }
    return comments;
  };

  const extractAppIdFromUrl = (url: string): string => {
    if (url.includes('play.google.com')) {
      const match = url.match(/id=([^&]+)/);
      return match ? match[1] : '';
    } else if (url.includes('apps.apple.com')) {
      const match = url.match(/id(\d+)/);
      return match ? match[1] : '';
    } else if (url.includes('maps.app.goo.gl') || url.includes('google.com/maps')) {
      // Для Google Maps повертаємо сам URL як ідентифікатор
      return url;
    }
    return '';
  };

  const handleShowAllComments = () => {
    setShowParsedComments(false);
  };

  const handleShowParsedComments = () => {
    setShowParsedComments(true);
  };

  React.useEffect(() => {
    loadComments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="mr-3 text-blue-600" />
            Парсинг коментарів з магазинів додатків
          </h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL додатку
              </label>
              <div className="flex space-x-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://play.google.com/store/apps/details?id=... або https://apps.apple.com/app/... або @https://maps.app.goo.gl/... або https://www.google.com/maps/place/..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleParse}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Метод парсингу
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="advanced"
                    checked={parsingMethod === 'advanced'}
                    onChange={(e) => setParsingMethod(e.target.value as 'standard' | 'advanced')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Розширений (рекомендовано)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="standard"
                    checked={parsingMethod === 'standard'}
                    onChange={(e) => setParsingMethod(e.target.value as 'standard' | 'advanced')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Стандартний</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Розширений метод використовує кілька підходів для отримання максимальної кількості реальних коментарів
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('Помилка') 
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
                          <span className="text-2xl">{getStoreIcon(parsingResult.store || '')}</span>
                          <div>
                            <p className="font-medium text-gray-900">{parsingResult.appName}</p>
                            <p className="text-sm text-gray-600">{getStoreName(parsingResult.store || '')}</p>
                            {parsingResult.parsedCount !== undefined && (
                              <p className="text-sm font-medium text-green-600">
                                Напарсено коментарів: {parsingResult.parsedCount}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-4 mt-4">
                          <button
                            onClick={handleShowParsedComments}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
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
              <Download className="mr-3 text-green-600" />
              {showParsedComments ? 'Напарсені коментарі' : 'Збережені коментарі'} ({getFilteredComments().length})
            </h2>
            <div className="flex space-x-2">
              {showParsedComments && (
                <button
                  onClick={handleShowAllComments}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
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
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Коментарі ще не додані. Почніть парсинг додатку!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredComments().map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getStoreIcon(comment.store)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{comment.appName}</h3>
                        <p className="text-sm text-gray-600">{getStoreName(comment.store)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < comment.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{comment.rating}/5</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Автор: {comment.author}</span>
                    <span>
                      {comment.helpfulVotes && comment.helpfulVotes > 0 && (
                        <span className="mr-4">👍 {comment.helpfulVotes}</span>
                      )}
                      {new Date(comment.createdAt).toLocaleDateString('uk-UA')}
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

export default ParsingPage;
