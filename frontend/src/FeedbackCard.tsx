import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  User, 
  Calendar, 
  ThumbsUp, 
  Tag, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MessageSquare
} from 'lucide-react';
import type { PrioritizedFeedback } from './types';

interface FeedbackCardProps {
  feedback: PrioritizedFeedback;
  isDragging?: boolean;
  onQuickResponse?: (feedback: PrioritizedFeedback) => void;
}

export function FeedbackCard({ feedback, isDragging = false, onQuickResponse }: FeedbackCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: feedback.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Кольори для пріоритету
  const priorityColors = {
    high: 'border-red-500/50 bg-red-500/10',
    medium: 'border-yellow-500/50 bg-yellow-500/10',
    low: 'border-gray-500/50 bg-gray-500/10'
  };

  // Кольори для тональності
  const sentimentColors = {
    positive: 'text-green-400',
    neutral: 'text-yellow-400',
    negative: 'text-red-400'
  };

  // Іконки для тональності
  const sentimentIcons = {
    positive: <CheckCircle className="w-4 h-4 text-green-400" />,
    neutral: <Clock className="w-4 h-4 text-yellow-400" />,
    negative: <AlertTriangle className="w-4 h-4 text-red-400" />
  };

  // Форматування дати
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Вчора';
    if (diffDays < 7) return `${diffDays} дн. тому`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} тиж. тому`;
    return date.toLocaleDateString('uk-UA');
  };

  // Обрізання тексту
  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Обробка швидкої відповіді
  const handleQuickResponse = (feedback: PrioritizedFeedback) => {
    if (onQuickResponse) {
      onQuickResponse(feedback);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 border cursor-grab active:cursor-grabbing
        hover:bg-slate-700/80 transition-all duration-200 shadow-lg hover:shadow-xl
        ${priorityColors[feedback.priority]}
        ${isDragging || isSortableDragging ? 'opacity-50 scale-95' : ''}
        ${isDragging ? 'rotate-3 shadow-2xl' : ''}
      `}
    >
      {/* Заголовок з пріоритетом */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {sentimentIcons[feedback.sentiment]}
          <span className={`text-sm font-semibold ${sentimentColors[feedback.sentiment]}`}>
            {feedback.sentiment === 'positive' ? 'Позитивний' :
             feedback.sentiment === 'negative' ? 'Негативний' : 'Нейтральний'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-1 rounded-full text-xs font-semibold
            ${feedback.priority === 'high' ? 'bg-red-500/20 text-red-400' :
              feedback.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'}
          `}>
            {feedback.priority === 'high' ? 'Високий' :
             feedback.priority === 'medium' ? 'Середній' : 'Низький'}
          </span>
          <span className="text-xs text-gray-400">{feedback.totalScore}</span>
        </div>
      </div>

      {/* Текст відгуку */}
      <div className="mb-3">
        <p className="text-gray-300 text-sm leading-relaxed">
          {truncateText(feedback.text)}
        </p>
      </div>

      {/* Метадані */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <User className="w-3 h-3" />
          <span>{feedback.author}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(feedback.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <MessageSquare className="w-3 h-3" />
          <span>{feedback.source}</span>
        </div>
        {feedback.likes > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ThumbsUp className="w-3 h-3" />
            <span>{feedback.likes} лайків</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Tag className="w-3 h-3" />
          <span>{feedback.category}</span>
        </div>
      </div>

       {/* Детальна статистика */}
       <div className="bg-slate-700/50 rounded-lg p-2 mb-3">
         <div className="grid grid-cols-3 gap-2 text-xs">
           <div className="text-center">
             <div className="text-gray-400">Тональність</div>
             <div className="font-semibold text-white">{feedback.sentimentScore}</div>
           </div>
           <div className="text-center">
             <div className="text-gray-400">Вплив</div>
             <div className="font-semibold text-white">{feedback.likesScore}</div>
           </div>
           <div className="text-center">
             <div className="text-gray-400">Свіжість</div>
             <div className="font-semibold text-white">{feedback.recencyScore}</div>
           </div>
         </div>
       </div>

       {/* Швидка відповідь */}
       <div className="flex justify-center">
         <button 
           onClick={() => handleQuickResponse(feedback)}
           className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
         >
           <MessageSquare className="w-4 h-4" />
           Швидка відповідь
         </button>
       </div>

    </div>
  );
}
