import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Instagram, 
  Smartphone, 
  MapPin, 
  Play, 
  Send,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000';

interface ParsingResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

function SourcesPage() {
  const [instagramUrl, setInstagramUrl] = useState('');
  const [playMarketUrl, setPlayMarketUrl] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [loading, setLoading] = useState({
    instagram: false,
    playMarket: false,
    googleMaps: false
  });
  const [results, setResults] = useState({
    instagram: null as ParsingResult | null,
    playMarket: null as ParsingResult | null,
    googleMaps: null as ParsingResult | null
  });

  const handleInstagramParse = async () => {
    if (!instagramUrl.trim()) return;
    
    setLoading(prev => ({ ...prev, instagram: true }));
    setResults(prev => ({ ...prev, instagram: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/instagram-parsing/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: [instagramUrl] }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(prev => ({ 
          ...prev, 
          instagram: { 
            success: true, 
            message: `Успішно оброблено ${Array.isArray(data) ? data.length : 0} коментарів з Instagram`,
            data: data
          } 
        }));
        setInstagramUrl('');
      } else {
        setResults(prev => ({ 
          ...prev, 
          instagram: { 
            success: false, 
            message: 'Помилка обробки Instagram поста',
            error: data.message || 'Невідома помилка'
          } 
        }));
      }
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        instagram: { 
          success: false, 
          message: 'Помилка з\'єднання з сервером',
          error: error instanceof Error ? error.message : 'Невідома помилка'
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, instagram: false }));
    }
  };

  const handlePlayMarketParse = async () => {
    if (!playMarketUrl.trim()) return;
    
    setLoading(prev => ({ ...prev, playMarket: true }));
    setResults(prev => ({ ...prev, playMarket: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/parsing/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: playMarketUrl
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(prev => ({ 
          ...prev, 
          playMarket: { 
            success: true, 
            message: `Успішно оброблено ${data.parsedCount || 0} відгуків з Google Play`,
            data: data
          } 
        }));
        setPlayMarketUrl('');
      } else {
        setResults(prev => ({ 
          ...prev, 
          playMarket: { 
            success: false, 
            message: 'Помилка обробки Google Play',
            error: data.message || 'Невідома помилка'
          } 
        }));
      }
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        playMarket: { 
          success: false, 
          message: 'Помилка з\'єднання з сервером',
          error: error instanceof Error ? error.message : 'Невідома помилка'
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, playMarket: false }));
    }
  };

  const handleGoogleMapsParse = async () => {
    if (!googleMapsUrl.trim()) return;
    
    setLoading(prev => ({ ...prev, googleMaps: true }));
    setResults(prev => ({ ...prev, googleMaps: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/google-maps/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: googleMapsUrl }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(prev => ({ 
          ...prev, 
          googleMaps: { 
            success: true, 
            message: `Успішно оброблено ${data.parsedCount || 0} відгуків з Google Maps`,
            data: data
          } 
        }));
        setGoogleMapsUrl('');
      } else {
        setResults(prev => ({ 
          ...prev, 
          googleMaps: { 
            success: false, 
            message: 'Помилка обробки Google Maps',
            error: data.message || 'Невідома помилка'
          } 
        }));
      }
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        googleMaps: { 
          success: false, 
          message: 'Помилка з\'єднання з сервером',
          error: error instanceof Error ? error.message : 'Невідома помилка'
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, googleMaps: false }));
    }
  };

  const clearResults = () => {
    setResults({
      instagram: null,
      playMarket: null,
      googleMaps: null
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Назад до дашборду
              </Link>
              <div className="flex items-center gap-3 ml-8">
                <ExternalLink className="w-8 h-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">Джерела Даних</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={clearResults}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Очистити
              </button>
              <Link 
                to="/kanban"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Перейти до Kanban
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instagram Section */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-pink-500/20 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Instagram className="w-8 h-8 text-pink-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Instagram Пост</h2>
              <p className="text-gray-400">Введіть посилання на пост Instagram для парсингу коментарів</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Посилання на Instagram пост
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/..."
                  className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg border border-pink-500/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
                <button
                  onClick={handleInstagramParse}
                  disabled={!instagramUrl.trim() || loading.instagram}
                  className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  {loading.instagram ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Парсити
                </button>
              </div>
            </div>

            {results.instagram && (
              <div className={`p-4 rounded-lg border ${
                results.instagram.success 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {results.instagram.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`font-medium ${
                    results.instagram.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {results.instagram.success ? 'Успішно' : 'Помилка'}
                  </span>
                </div>
                <p className="text-gray-300">{results.instagram.message}</p>
                {results.instagram.error && (
                  <p className="text-red-400 text-sm mt-1">{results.instagram.error}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Google Play Section */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-green-500/20 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Play className="w-8 h-8 text-green-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Google Play Store</h2>
              <p className="text-gray-400">Введіть посилання на додаток в Google Play для парсингу відгуків</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Посилання на додаток в Google Play
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={playMarketUrl}
                  onChange={(e) => setPlayMarketUrl(e.target.value)}
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg border border-green-500/30 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
                <button
                  onClick={handlePlayMarketParse}
                  disabled={!playMarketUrl.trim() || loading.playMarket}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  {loading.playMarket ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Парсити
                </button>
              </div>
            </div>

            {results.playMarket && (
              <div className={`p-4 rounded-lg border ${
                results.playMarket.success 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {results.playMarket.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`font-medium ${
                    results.playMarket.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {results.playMarket.success ? 'Успішно' : 'Помилка'}
                  </span>
                </div>
                <p className="text-gray-300">{results.playMarket.message}</p>
                {results.playMarket.error && (
                  <p className="text-red-400 text-sm mt-1">{results.playMarket.error}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Google Maps Section */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <MapPin className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Google Maps</h2>
              <p className="text-gray-400">Введіть посилання на місце в Google Maps для парсингу відгуків</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Посилання на місце в Google Maps
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/... або https://www.google.com/maps/place/..."
                  className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg border border-blue-500/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleGoogleMapsParse}
                  disabled={!googleMapsUrl.trim() || loading.googleMaps}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  {loading.googleMaps ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Парсити
                </button>
              </div>
            </div>

            {results.googleMaps && (
              <div className={`p-4 rounded-lg border ${
                results.googleMaps.success 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {results.googleMaps.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`font-medium ${
                    results.googleMaps.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {results.googleMaps.success ? 'Успішно' : 'Помилка'}
                  </span>
                </div>
                <p className="text-gray-300">{results.googleMaps.message}</p>
                {results.googleMaps.error && (
                  <p className="text-red-400 text-sm mt-1">{results.googleMaps.error}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-4 mb-4">
            <Smartphone className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Інформація</h3>
          </div>
          <div className="text-gray-300 space-y-2">
            <p>• Всі оброблені дані автоматично зберігаються в базі даних</p>
            <p>• Відгуки та коментарі з'являються в Kanban дошці з автоматичним розрахунком пріоритету</p>
            <p>• Використовуйте кнопку "Перейти до Kanban" для перегляду результатів</p>
            <p>• Підтримуються посилання з Instagram, Google Play Store та Google Maps</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SourcesPage;
