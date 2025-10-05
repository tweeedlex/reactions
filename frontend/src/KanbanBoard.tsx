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
import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { FeedbackCard } from './FeedbackCard';
import { FeedbackColumn } from './FeedbackColumn';
import type { PrioritizedFeedback } from './types';

const API_BASE_URL = 'http://localhost:3000';

function KanbanBoard() {
  const [feedbacks, setFeedbacks] = useState<PrioritizedFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    source: '',
    priority: '',
    sentiment: '',
    limit: 50
  });

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

  // Обробка перетягування
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const feedbackId = active.id as string;
    const newStatus = over.id as string;

    // Оновлюємо статус відгуку
    setFeedbacks(prevFeedbacks => 
      prevFeedbacks.map(feedback => 
        feedback.id === feedbackId 
          ? { ...feedback, status: newStatus as 'Запит' | 'Вирішення' | 'Готово' }
          : feedback
      )
    );

    setActiveId(null);
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
                <h1 className="text-2xl font-bold text-white">Kanban Дошка Відгуків</h1>
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

        {/* Kanban Доска */}
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Запит */}
            <FeedbackColumn
              id="Запит"
              title="Запит"
              icon={<Clock className="w-5 h-5" />}
              color="orange"
              feedbacks={groupedFeedbacks['Запит']}
            />

            {/* Вирішення */}
            <FeedbackColumn
              id="Вирішення"
              title="Вирішення"
              icon={<AlertTriangle className="w-5 h-5" />}
              color="blue"
              feedbacks={groupedFeedbacks['Вирішення']}
            />

            {/* Готово */}
            <FeedbackColumn
              id="Готово"
              title="Готово"
              icon={<CheckCircle className="w-5 h-5" />}
              color="green"
              feedbacks={groupedFeedbacks['Готово']}
            />
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId ? (
              <FeedbackCard 
                feedback={feedbacks.find(f => f.id === activeId)!}
                isDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

export default KanbanBoard;
