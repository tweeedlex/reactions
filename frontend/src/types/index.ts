// Comment types for SupportPage
export interface Comment {
  id: number;
  platform: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  priority: 'high' | 'medium' | 'low';
  likes: number;
  replies: number;
  url: string;
}

// Alert types for SupportPage
export interface Alert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  platform: string;
  keywords: string[];
  count: number;
  trend: 'up' | 'down' | 'stable';
}

// Dashboard types
export interface PriorityIssue {
  id: number;
  title: string;
  severity: 'high' | 'medium' | 'low';
  mentions: number;
  trend: 'up' | 'down' | 'stable';
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface TrendingTopic {
  topic: string;
  mentions: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DailyStat {
  date: string;
  mentions: number;
  sentiment: number;
}

export interface DashboardData {
  reputationScore: number;
  totalMentions: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  sources: Record<string, number>;
  intentClassification: Record<string, number>;
  trendingTopics: TrendingTopic[];
  priorityIssues: PriorityIssue[];
  dailyStats: DailyStat[];
}

// Response style type
export type ResponseStyle = 'official' | 'friendly' | 'support';
