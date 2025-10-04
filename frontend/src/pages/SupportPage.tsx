import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, AlertTriangle, Clock } from 'lucide-react';
import type { Comment } from '@/types';
import { mockComments, mockAlerts, mockKeywordAlerts } from '@/utils/mockData';
import { CommentCard, AlertCard, ResponseConstructor, KeywordAlerts } from '@/components/support';

function SupportPage() {
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

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
                <h1 className="text-2xl font-bold text-white">Сапорт центр</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                Останнє оновлення: 2 хв тому
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Early Warning System */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Система раннього попередження
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>

        {/* Keyword Alerts Section */}
        <div className="mb-8">
          <KeywordAlerts alerts={mockKeywordAlerts} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Comments Feed */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Коментарі з соціальних мереж</h2>
            <div className="space-y-4">
              {mockComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  isSelected={selectedComment?.id === comment.id}
                  onClick={() => setSelectedComment(comment)}
                />
              ))}
            </div>
          </div>

          {/* Response Constructor */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Конструктор відповідей</h2>
            <ResponseConstructor selectedComment={selectedComment} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportPage;
