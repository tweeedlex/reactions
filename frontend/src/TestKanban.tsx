import { useState, useEffect } from 'react';

interface TestFeedback {
  id: string;
  text: string;
  author: string;
  source: string;
  priority: string;
  sentiment: string;
  status: string;
}

function TestKanban() {
  const [feedbacks, setFeedbacks] = useState<TestFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/feedbacks/prioritized');
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-white">Завантаження відгуків...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-white mb-4">Помилка: {error}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🧪 Тест Kanban API
        </h1>
        
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">📊 Статистика</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{feedbacks.length}</div>
              <div className="text-gray-400 text-sm">Всього</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">
                {feedbacks.filter(f => f.status === 'Запит').length}
              </div>
              <div className="text-gray-400 text-sm">Запит</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {feedbacks.filter(f => f.status === 'Вирішення').length}
              </div>
              <div className="text-gray-400 text-sm">Вирішення</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {feedbacks.filter(f => f.status === 'Готово').length}
              </div>
              <div className="text-gray-400 text-sm">Готово</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Запит */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-orange-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">🕐 Запит</h3>
              <div className="bg-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-sm font-semibold">
                {feedbacks.filter(f => f.status === 'Запит').length}
              </div>
            </div>
            <div className="space-y-3">
              {feedbacks.filter(f => f.status === 'Запит').map((feedback) => (
                <div key={feedback.id} className="bg-slate-700/50 rounded-lg p-4 border border-orange-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-gray-300">{feedback.sentiment}</div>
                    <div className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      {feedback.priority}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{feedback.text}</div>
                  <div className="text-xs text-gray-400">
                    {feedback.author} • {feedback.source}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Вирішення */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">⚡ Вирішення</h3>
              <div className="bg-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                {feedbacks.filter(f => f.status === 'Вирішення').length}
              </div>
            </div>
            <div className="space-y-3">
              {feedbacks.filter(f => f.status === 'Вирішення').map((feedback) => (
                <div key={feedback.id} className="bg-slate-700/50 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-gray-300">{feedback.sentiment}</div>
                    <div className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      {feedback.priority}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{feedback.text}</div>
                  <div className="text-xs text-gray-400">
                    {feedback.author} • {feedback.source}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Готово */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">✅ Готово</h3>
              <div className="bg-green-500/30 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                {feedbacks.filter(f => f.status === 'Готово').length}
              </div>
            </div>
            <div className="space-y-3">
              {feedbacks.filter(f => f.status === 'Готово').map((feedback) => (
                <div key={feedback.id} className="bg-slate-700/50 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-gray-300">{feedback.sentiment}</div>
                    <div className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      {feedback.priority}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{feedback.text}</div>
                  <div className="text-xs text-gray-400">
                    {feedback.author} • {feedback.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestKanban;
