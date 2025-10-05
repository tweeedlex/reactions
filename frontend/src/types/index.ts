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
  localStatus?: 'open' | 'closed';
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
  source: string;
  url: string;
  title?: string;
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

// Ролі користувачів
export type UserRole = 'admin' | 'support';

export const USER_ROLES = {
  ADMIN: 1,
  SUPPORT: 2,
} as const;

export interface UserCompanyWithCompany extends UserCompany {
  company: Company;
}

// Додаємо роль до інтерфейсу
export interface UserCompanyWithRole extends UserCompanyWithCompany {
  role: UserRole;
}

// Data Source Types
export interface DataSource {
  id: number;
  company_id: number;
  type_id: number;
  url: string;
  interval_type_id: number;
  title: string;
}

export interface DataSourceWithLinks {
  id: number;
  company_id: number;
  type_id: number;
  title: string;
  links: Array<{
    id: number;
    url: string;
    interval_type_id: number;
  }>;
}

// Support Ticket types from v_company_support_tickets view
export interface SupportTicket {
  id: number;
  number: string;
  status_title: string;
  ticket_type_title: string;
  ai_theme: string;
  user_message: string;
  ai_ton_of_voice_value: number;
  ai_ton_of_voice_title: string;
  tags_array: string[];
  ai_suggested_answer_text: string;
  ai_company_answer_data_source_title: string;
  ai_company_answer_data_source_url: string;
  company_name: string;
  created_at: string;
  updated_at: string;
  updated_user_id: string;
  company_id: number;
}

// Company state for Redux
export interface CompanyState {
  companies: Company[];
  userCompanies: UserCompanyWithCompany[];
  currentCompany: Company | null;
  currentUserRole: UserRole | null;
  dataSources: DataSourceWithLinks[];
  loading: boolean;
  error: string | null;
}