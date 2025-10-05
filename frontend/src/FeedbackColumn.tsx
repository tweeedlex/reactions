import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FeedbackCard } from './FeedbackCard';
import type { PrioritizedFeedback } from './types';

interface FeedbackColumnProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: 'orange' | 'blue' | 'green';
  feedbacks: PrioritizedFeedback[];
}

export function FeedbackColumn({ id, title, icon, color, feedbacks }: FeedbackColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  // Кольори для стовпців
  const colorClasses = {
    orange: {
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/10',
      header: 'bg-orange-500/20',
      text: 'text-orange-400',
      count: 'bg-orange-500/30'
    },
    blue: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      header: 'bg-blue-500/20',
      text: 'text-blue-400',
      count: 'bg-blue-500/30'
    },
    green: {
      border: 'border-green-500/30',
      bg: 'bg-green-500/10',
      header: 'bg-green-500/20',
      text: 'text-green-400',
      count: 'bg-green-500/30'
    }
  };

  const currentColor = colorClasses[color];

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок стовпця */}
      <div className={`
        ${currentColor.header} ${currentColor.border} border rounded-t-xl p-4 mb-4
        backdrop-blur-lg
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={currentColor.text}>
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <div className={`
            ${currentColor.count} ${currentColor.text} px-3 py-1 rounded-full text-sm font-semibold
          `}>
            {feedbacks.length}
          </div>
        </div>
      </div>

      {/* Контейнер для карток */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-[400px] p-4 rounded-b-xl border-2 border-dashed transition-all duration-200
          ${isOver ? currentColor.border : 'border-slate-600/30'}
          ${isOver ? currentColor.bg : 'bg-slate-800/30'}
          ${isOver ? 'scale-105' : ''}
        `}
      >
        <SortableContext items={feedbacks.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {feedbacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm">Немає відгуків</p>
              </div>
            ) : (
              feedbacks.map((feedback) => (
                <FeedbackCard
                  key={feedback.id}
                  feedback={feedback}
                />
              ))
            )}
          </div>
        </SortableContext>

        {/* Підказка для перетягування */}
        {isOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`
              ${currentColor.bg} ${currentColor.border} border-2 border-dashed rounded-xl p-4
              backdrop-blur-lg
            `}>
              <p className={`${currentColor.text} font-semibold`}>
                Перетягніть сюди
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
