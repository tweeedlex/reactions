import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Clock, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import type { Comment } from '@/types';
import { CommentCard, ResponseConstructor } from '@/components/support';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportTickets, type TicketStatusFilter } from '@/hooks/useSupportTickets';

function SupportPage() {
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<import('@/types').SupportTicket | null>(null);
  const { userRole } = useAuth();
  const { 
    tickets, 
    comments, 
    loading, 
    error, 
    refetch, 
    statusFilter, 
    setStatusFilter, 
    closeTicket, 
    reopenTicket 
  } = useSupportTickets();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link
                to={userRole === 'admin' ? "/dashboard" : "/"}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {userRole === 'admin' ? "Назад до дашборду" : "Назад на головну"}
              </Link>
              <div className="flex items-center gap-3 ml-8">
                <MessageSquare className="w-8 h-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">Сапорт центр</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Фільтр статусу */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TicketStatusFilter)}
                  className="bg-slate-800 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Всі тікети</option>
                  <option value="open">Відкриті</option>
                  <option value="closed">Закриті</option>
                </select>
              </div>
              
              <button
                onClick={refetch}
                disabled={loading}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Оновити
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                Останнє оновлення: щойно
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold">Помилка завантаження</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Comments Feed */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Коментарі з соціальних мереж</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span>Завантаження коментарів...</span>
                </div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Немає коментарів</h3>
                <p className="text-gray-500">Поки що немає коментарів для відображення</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, index) => {
                  const ticket = tickets[index]; // Відповідний тікет за індексом
                  return (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      isSelected={selectedComment?.id === comment.id}
                      onClick={() => {
                        setSelectedComment(comment);
                        setSelectedTicket(ticket);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Response Constructor */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Конструктор відповідей</h2>
            <ResponseConstructor 
              selectedComment={selectedComment} 
              selectedTicket={selectedTicket}
              onCloseTicket={closeTicket}
              onReopenTicket={reopenTicket}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportPage;
