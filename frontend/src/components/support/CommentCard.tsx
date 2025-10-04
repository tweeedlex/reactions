import { Calendar, ThumbsUp, ThumbsDown, MessageSquare, ExternalLink } from 'lucide-react';
import type { Comment } from '@/types';

interface CommentCardProps {
  comment: Comment;
  isSelected: boolean;
  onClick: () => void;
}

export function CommentCard({ comment, isSelected, onClick }: CommentCardProps) {
  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border cursor-pointer transition-all hover:scale-105 ${
        isSelected ? 'border-purple-500/50 bg-purple-500/10' : 'border-purple-500/20 hover:border-purple-500/50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl">{comment.avatar}</div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-white">{comment.username}</h3>
            <span className="text-sm text-gray-400">{comment.platform}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                comment.priority === 'high'
                  ? 'bg-red-500/20 text-red-400'
                  : comment.priority === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-green-500/20 text-green-400'
              }`}
            >
              {comment.priority === 'high' ? 'Високий' : comment.priority === 'medium' ? 'Середній' : 'Низький'}
            </span>
          </div>
          <p className="text-gray-300 mb-3">{comment.text}</p>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {comment.timestamp}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                {comment.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {comment.replies}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {comment.sentiment === 'positive' && <ThumbsUp className="w-4 h-4 text-green-400" />}
              {comment.sentiment === 'negative' && <ThumbsDown className="w-4 h-4 text-red-400" />}
              {comment.sentiment === 'neutral' && <div className="w-4 h-4 bg-gray-400 rounded-full"></div>}
              <a href={comment.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
