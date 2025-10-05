import type { UserData, SourceLink, Subscription, BillingRecord } from '@/types';
import { mockBillingHistory } from './mockData';

const USER_DATA_KEY = 'branddefender_user_data';

export const saveUserData = (data: UserData): void => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
};

export const getUserData = (): UserData | null => {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearUserData = (): void => {
  localStorage.removeItem(USER_DATA_KEY);
};

export const isUserOnboarded = (): boolean => {
  const data = getUserData();
  return data?.isOnboarded ?? false;
};

export const updateSaasPoints = (points: number): void => {
  const data = getUserData();
  if (data) {
    data.brand.saasPoints = points;
    saveUserData(data);
  }
};

export const updateBrandFilters = (
  brandName: string,
  keywords: string[],
  sources: string[],
  sourceLinks?: SourceLink[]
): void => {
  const data = getUserData();
  if (data) {
    data.brand.brandName = brandName;
    data.brand.keywords = keywords;
    data.brand.sources = sources;
    if (sourceLinks) {
      data.brand.sourceLinks = sourceLinks;
    }
    saveUserData(data);
  }
};

export const updateUserProfile = (userId: string, name: string, email: string): void => {
  const data = getUserData();
  if (data) {
    data.user = {
      id: userId,
      name,
      email,
    };
    saveUserData(data);
  }
};

export const getBrandFilters = () => {
  const data = getUserData();
  if (data?.brand) {
    return {
      brandName: data.brand.brandName,
      keywords: data.brand.keywords,
      sources: data.brand.sources,
      sourceLinks: data.brand.sourceLinks || [],
    };
  }
  return null;
};

export const updateSourceLink = (sourceName: string, url: string, title?: string): void => {
  const data = getUserData();
  if (data) {
    if (!data.brand.sourceLinks) {
      data.brand.sourceLinks = [];
    }
    
    const existingIndex = data.brand.sourceLinks.findIndex(link => link.source === sourceName);
    if (existingIndex >= 0) {
      data.brand.sourceLinks[existingIndex].url = url;
      if (title) {
        data.brand.sourceLinks[existingIndex].title = title;
      }
    } else {
      data.brand.sourceLinks.push({ source: sourceName, url, title });
    }
    
    saveUserData(data);
  }
};

export const removeSourceLink = (sourceName: string): void => {
  const data = getUserData();
  if (data && data.brand.sourceLinks) {
    data.brand.sourceLinks = data.brand.sourceLinks.filter(link => link.source !== sourceName);
    saveUserData(data);
  }
};

export const getSourceLink = (sourceName: string): string | null => {
  const data = getUserData();
  if (data?.brand?.sourceLinks) {
    const link = data.brand.sourceLinks.find(link => link.source === sourceName);
    return link ? link.url : null;
  }
  return null;
};

export const getSubscription = (): Subscription | null => {
  const data = getUserData();
  if (data?.subscription) {
    // Ensure parsingInterval exists for backward compatibility
    if (!data.subscription.parsingInterval) {
      data.subscription.parsingInterval = { days: 0, hours: 4, minutes: 0 };
    }
    return data.subscription;
  }
  
  // Якщо підписки немає, створюємо базову
  const defaultSubscription: Subscription = {
    isActive: true,
    plan: 'basic',
    parsingEnabled: true,
    maxSources: 5,
    usedSources: 0,
    autoRenew: true,
    billingHistory: mockBillingHistory,
    totalSpent: mockBillingHistory.reduce((sum, record) => sum + record.cost, 0),
    monthlyLimit: 100,
    parsingInterval: { days: 0, hours: 4, minutes: 0 }, // Default: 4 hours
  };
  
  // Зберігаємо базову підписку
  if (data) {
    data.subscription = defaultSubscription;
    saveUserData(data);
  }
  
  return defaultSubscription;
};

export const updateSubscription = (subscription: Partial<Subscription>): void => {
  const data = getUserData();
  if (data) {
    data.subscription = {
      ...data.subscription,
      ...subscription,
    };
    saveUserData(data);
  }
};

export const toggleParsing = (): boolean => {
  const data = getUserData();
  if (data) {
    const newParsingState = !data.subscription.parsingEnabled;
    data.subscription.parsingEnabled = newParsingState;
    saveUserData(data);
    return newParsingState;
  }
  return false;
};

export const getSubscriptionStatus = () => {
  const subscription = getSubscription();
  if (!subscription) return null;
  
  return {
    isActive: subscription.isActive,
    plan: subscription.plan,
    parsingEnabled: subscription.parsingEnabled,
    maxSources: subscription.maxSources,
    usedSources: subscription.usedSources,
    expiresAt: subscription.expiresAt,
    autoRenew: subscription.autoRenew,
    billingHistory: subscription.billingHistory,
    totalSpent: subscription.totalSpent,
    monthlyLimit: subscription.monthlyLimit,
    parsingInterval: subscription.parsingInterval,
  };
};

export const getBillingHistory = (): BillingRecord[] => {
  const subscription = getSubscription();
  if (subscription?.billingHistory && subscription.billingHistory.length > 0) {
    return subscription.billingHistory;
  }
  
  // Якщо історії немає, повертаємо мок-дані
  return mockBillingHistory;
};

export const updateParsingInterval = (interval: { days: number; hours: number; minutes: number }): void => {
  const data = getUserData();
  if (data?.subscription) {
    data.subscription.parsingInterval = interval;
    saveUserData(data);
  }
};

export const addBillingRecord = (record: Omit<BillingRecord, 'id'>): void => {
  const data = getUserData();
  if (data?.subscription) {
    const newRecord: BillingRecord = {
      ...record,
      id: Date.now().toString(),
    };
    
    data.subscription.billingHistory.unshift(newRecord);
    data.subscription.totalSpent += record.cost;
    saveUserData(data);
  }
};

export const getMonthlyStats = () => {
  const history = getBillingHistory();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const monthlyRecords = history.filter(record => 
    record.date.startsWith(currentMonth)
  );
  
  const totalRequests = monthlyRecords.reduce((sum, record) => sum + record.requests, 0);
  const totalCost = monthlyRecords.reduce((sum, record) => sum + record.cost, 0);
  
  return {
    totalRequests,
    totalCost,
    recordCount: monthlyRecords.length,
    records: monthlyRecords,
  };
};

// Функції для роботи зі станом компанії
const COMPANY_STATUS_KEY = 'brand_defender_company_status';

export const saveCompanyStatus = (hasCompany: boolean): void => {
  localStorage.setItem(COMPANY_STATUS_KEY, JSON.stringify(hasCompany));
};

export const getCompanyStatus = (): boolean | null => {
  try {
    const status = localStorage.getItem(COMPANY_STATUS_KEY);
    return status ? JSON.parse(status) : null;
  } catch {
    return null;
  }
};

export const clearCompanyStatus = (): void => {
  localStorage.removeItem(COMPANY_STATUS_KEY);
};

// Функції для роботи з локальним статусом тікетів
const TICKET_STATUS_KEY = 'brand_defender_ticket_statuses';

export interface TicketStatus {
  ticketId: number;
  status: 'open' | 'closed';
  updatedAt: string;
}

export const saveTicketStatus = (ticketId: number, status: 'open' | 'closed'): void => {
  try {
    const statuses = getTicketStatuses();
    const ticketStatus: TicketStatus = {
      ticketId,
      status,
      updatedAt: new Date().toISOString()
    };
    
    // Знаходимо існуючий статус або додаємо новий
    const existingIndex = statuses.findIndex(ts => ts.ticketId === ticketId);
    if (existingIndex >= 0) {
      statuses[existingIndex] = ticketStatus;
    } else {
      statuses.push(ticketStatus);
    }
    
    localStorage.setItem(TICKET_STATUS_KEY, JSON.stringify(statuses));
  } catch (error) {
    console.error('Error saving ticket status:', error);
  }
};

export const getTicketStatuses = (): TicketStatus[] => {
  try {
    const data = localStorage.getItem(TICKET_STATUS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting ticket statuses:', error);
    return [];
  }
};

export const getTicketStatus = (ticketId: number): 'open' | 'closed' | null => {
  try {
    const statuses = getTicketStatuses();
    const ticketStatus = statuses.find(ts => ts.ticketId === ticketId);
    return ticketStatus ? ticketStatus.status : null;
  } catch (error) {
    console.error('Error getting ticket status:', error);
    return null;
  }
};

export const clearTicketStatuses = (): void => {
  try {
    localStorage.removeItem(TICKET_STATUS_KEY);
  } catch (error) {
    console.error('Error clearing ticket statuses:', error);
  }
};