import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  Filter, 
  Download, 
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import type { PrioritizedFeedback } from './types';
import { AIResponseModal } from './AIResponseModal';

const API_BASE_URL = 'http://localhost:3000';

function SimpleKanban() {
  const [feedbacks, setFeedbacks] = useState<PrioritizedFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    source: '',
    priority: '',
    sentiment: '',
    limit: 50
  });
  const [selectedFeedback, setSelectedFeedback] = useState<PrioritizedFeedback | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedResponses, setGeneratedResponses] = useState<Record<string, string>>({});

  // Завантаження даних з API
  useEffect(() => {
    loadFeedbacks();
  }, [filters]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.source) params.append('source', filters.source);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.sentiment) params.append('sentiment', filters.sentiment);
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/feedbacks/prioritized?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setFeedbacks(data);
    } catch (err) {
      console.error('Помилка завантаження відгуків:', err);
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  };

  // Обробка зміни статусу
  const handleStatusChange = (feedbackId: string, newStatus: 'Запит' | 'Вирішення' | 'Готово') => {
    setFeedbacks(prevFeedbacks => 
      prevFeedbacks.map(feedback => 
        feedback.id === feedbackId 
          ? { ...feedback, status: newStatus }
          : feedback
      )
    );
  };

  // Обробка швидкої відповіді
  const handleQuickResponse = async (feedback: PrioritizedFeedback) => {
    // Перевіряємо, чи вже є згенерована відповідь
    if (generatedResponses[feedback.id]) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: feedback.text,
          sentiment: feedback.sentiment,
          source: feedback.source,
          author: feedback.author,
          category: feedback.category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedResponses(prev => ({
          ...prev,
          [feedback.id]: data.suggestion
        }));
      } else {
        console.error('Помилка генерації відповіді');
      }
    } catch (error) {
      console.error('Помилка з\'єднання:', error);
    }
  };

  // Закриття модального вікна
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFeedback(null);
  };

  // Групування відгуків за статусом
  const groupedFeedbacks = {
    'Запит': feedbacks.filter(f => f.status === 'Запит'),
    'Вирішення': feedbacks.filter(f => f.status === 'Вирішення'),
    'Готово': feedbacks.filter(f => f.status === 'Готово')
  };

  // Статистика
  const stats = {
    total: feedbacks.length,
    запит: groupedFeedbacks['Запит'].length,
    вирішення: groupedFeedbacks['Вирішення'].length,
    готово: groupedFeedbacks['Готово'].length,
    high: feedbacks.filter(f => f.priority === 'high').length,
    medium: feedbacks.filter(f => f.priority === 'medium').length,
    low: feedbacks.filter(f => f.priority === 'low').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Завантаження відгуків...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-white mb-4">Помилка завантаження: {error}</p>
          <button 
            onClick={loadFeedbacks}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

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
                <MessageSquare className="w-8 h-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">Simple Kanban Дошка</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={loadFeedbacks}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Оновити
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Download className="w-4 h-4" />
                Експорт
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-purple-500/20">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-gray-400 text-sm">Всього</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-orange-500/20">
            <div className="text-2xl font-bold text-orange-400">{stats.запит}</div>
            <div className="text-gray-400 text-sm">Запит</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400">{stats.вирішення}</div>
            <div className="text-gray-400 text-sm">Вирішення</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">{stats.готово}</div>
            <div className="text-gray-400 text-sm">Готово</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">{stats.high}</div>
            <div className="text-gray-400 text-sm">Високий</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
            <div className="text-gray-400 text-sm">Середній</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-500/20">
            <div className="text-2xl font-bold text-gray-400">{stats.low}</div>
            <div className="text-gray-400 text-sm">Низький</div>
          </div>
        </div>

        {/* Фільтри */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Фільтри</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-purple-500/30"
            >
              <option value="">Всі джерела</option>
              <option value="Google Maps">Google Maps</option>
              <option value="App Store">App Store</option>
              <option value="Google Play">Google Play</option>
              <option value="TrustPilot">TrustPilot</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-purple-500/30"
            >
              <option value="">Всі пріоритети</option>
              <option value="high">Високий</option>
              <option value="medium">Середній</option>
              <option value="low">Низький</option>
            </select>
            <select
              value={filters.sentiment}
              onChange={(e) => setFilters(prev => ({ ...prev, sentiment: e.target.value }))}
              className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-purple-500/30"
            >
              <option value="">Вся тональність</option>
              <option value="positive">Позитивна</option>
              <option value="neutral">Нейтральна</option>
              <option value="negative">Негативна</option>
            </select>
            <input
              type="number"
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) || 50 }))}
              placeholder="Ліміт"
              className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-purple-500/30"
            />
          </div>
        </div>

        {/* Simple Kanban Доска */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Запит */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-orange-500/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-400" />
                <h3 className="text-xl font-semibold text-white">Запит</h3>
              </div>
              <div className="bg-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-sm font-semibold">
                {groupedFeedbacks['Запит'].length}
              </div>
            </div>
            <div className="space-y-3">
              {groupedFeedbacks['Запит'].map((feedback) => (
                <div key={feedback.id} className="bg-slate-700/50 rounded-lg p-4 border border-orange-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-gray-300">{feedback.sentiment}</div>
                    <div className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      {feedback.priority}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{feedback.text}</div>
                  <div className="text-xs text-gray-400 mb-3">
                    {feedback.author} • {feedback.source}
                  </div>
                  
                  {/* AI Відповідь або кнопка */}
                  {generatedResponses[feedback.id] ? (
                    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-3 border border-purple-500/30 mb-3">
                      <div className="text-xs text-purple-300 mb-1">🤖 AI Відповідь:</div>
                      <div className="text-sm text-white mb-2">{generatedResponses[feedback.id]}</div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(generatedResponses[feedback.id])}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs"
                      >
                        📋 Копіювати
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <button 
                        onClick={() => handleQuickResponse(feedback)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Швидка відповідь
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => handleStatusChange(feedback.id, 'Вирішення')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                    >
                      В процесі
                    </button>
                    <button 
                      onClick={() => handleStatusChange(feedback.id, 'Готово')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Готово
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Вирішення */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Вирішення</h3>
              </div>
              <div className="bg-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                {groupedFeedbacks['Вирішення'].length}
              </div>
            </div>
            <div className="space-y-3">
              {groupedFeedbacks['Вирішення'].map((feedback) => (
                <div key={feedback.id} className="bg-slate-700/50 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-gray-300">{feedback.sentiment}</div>
                    <div className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      {feedback.priority}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{feedback.text}</div>
                  <div className="text-xs text-gray-400 mb-3">
                    {feedback.author} • {feedback.source}
                  </div>
                  
                  {/* AI Відповідь або кнопка */}
                  {generatedResponses[feedback.id] ? (
                    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-3 border border-purple-500/30 mb-3">
                      <div className="text-xs text-purple-300 mb-1">🤖 AI Відповідь:</div>
                      <div className="text-sm text-white mb-2">{generatedResponses[feedback.id]}</div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(generatedResponses[feedback.id])}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs"
                      >
                        📋 Копіювати
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <button 
                        onClick={() => handleQuickResponse(feedback)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Швидка відповідь
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => handleStatusChange(feedback.id, 'Запит')}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Назад
                    </button>
                    <button 
                      onClick={() => handleStatusChange(feedback.id, 'Готово')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Готово
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Готово */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h3 className="text-xl font-semibold text-white">Готово</h3>
              </div>
              <div className="bg-green-500/30 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                {groupedFeedbacks['Готово'].length}
              </div>
            </div>
            <div className="space-y-3">
              {groupedFeedbacks['Готово'].map((feedback) => (
                <div key={feedback.id} className="bg-slate-700/50 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-gray-300">{feedback.sentiment}</div>
                    <div className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      {feedback.priority}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{feedback.text}</div>
                  <div className="text-xs text-gray-400 mb-3">
                    {feedback.author} • {feedback.source}
                  </div>
                  
                  {/* AI Відповідь або кнопка */}
                  {generatedResponses[feedback.id] ? (
                    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-3 border border-purple-500/30 mb-3">
                      <div className="text-xs text-purple-300 mb-1">🤖 AI Відповідь:</div>
                      <div className="text-sm text-white mb-2">{generatedResponses[feedback.id]}</div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(generatedResponses[feedback.id])}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs"
                      >
                        📋 Копіювати
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <button 
                        onClick={() => handleQuickResponse(feedback)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Швидка відповідь
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => handleStatusChange(feedback.id, 'Запит')}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Назад
                    </button>
                    <button 
                      onClick={() => handleStatusChange(feedback.id, 'Вирішення')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                    >
                      В процесі
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Response Modal */}
      <AIResponseModal
        feedback={selectedFeedback}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}

export default SimpleKanban;
