export interface PrioritizedFeedback {
  id: string;
  text: string;
  date: string;
  source: string;
  author: string;
  likes: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'Запит' | 'Вирішення' | 'Готово';
  totalScore: number;
  sentimentScore: number;
  likesScore: number;
  recencyScore: number;
}
