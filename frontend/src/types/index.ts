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
  highlightedKeywords?: string[];
}

export interface KeywordAlert {
  id: number;
  keyword: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'high' | 'medium' | 'low';
  comments: Comment[];
  lastMention: string;
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

// Auth & Onboarding types
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface SourceLink {
  name: string;
  url: string;
}

export interface BrandSetup {
  brandName: string;
  keywords: string[];
  sources: string[];
  sourceLinks: SourceLink[];
  saasPoints: number;
}

export interface BillingRecord {
  id: string;
  date: string;
  requests: number;
  cost: number;
  description: string;
  type: 'parsing' | 'api' | 'export' | 'premium_feature';
}

export interface Subscription {
  isActive: boolean;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  parsingEnabled: boolean;
  maxSources: number;
  usedSources: number;
  expiresAt?: string;
  autoRenew: boolean;
  billingHistory: BillingRecord[];
  totalSpent: number;
  monthlyLimit: number;
  parsingInterval: {
    days: number;
    hours: number;
    minutes: number;
  };
}

export interface UserData {
  user: User;
  brand: BrandSetup;
  subscription: Subscription;
  isOnboarded: boolean;
}

// Company types for Supabase
export interface Company {
  id: number;
  title: string;
  site_url: string;
}

export interface UserCompany {
  id: number;
  user_id: string;
  company_id: number;
  role_id: number;
}

export interface UserCompanyWithCompany extends UserCompany {
  company: Company;
}

// Company state for Redux
export interface CompanyState {
  companies: Company[];
  userCompanies: UserCompanyWithCompany[];
  currentCompany: Company | null;
  loading: boolean;
  error: string | null;
}