import type { SupportTicket } from '@/types';

// Типи для аналізу тікетів
export interface SentimentClassification {
  positive: SupportTicket[];
  negative: SupportTicket[];
  neutral: SupportTicket[];
}

export interface TicketTypeStats {
  [key: string]: {
    count: number;
    percentage: number;
  };
}

export interface DataSourceStats {
  [key: string]: {
    count: number;
    percentage: number;
  };
}

export interface ThemeStats {
  [key: string]: {
    count: number;
    percentage: number;
  };
}

export interface DailyTicketStats {
  date: string;
  count: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface SupportTicketsAnalysis {
  totalTickets: number;
  sentimentClassification: SentimentClassification;
  sentimentStats: {
    positive: { count: number; percentage: number };
    negative: { count: number; percentage: number };
    neutral: { count: number; percentage: number };
  };
  ticketTypeStats: TicketTypeStats;
  dataSourceStats: DataSourceStats;
  themeStats: ThemeStats;
  dailyStats: DailyTicketStats[];
}

/**
 * Класифікує тікет за тональністю на основі ai_ton_of_voice_value
 * @param toneValue - значення ai_ton_of_voice_value
 * @returns 'positive' | 'negative' | 'neutral'
 */
export function classifySentiment(toneValue: number): 'positive' | 'negative' | 'neutral' {
  if (toneValue > 0) return 'positive';
  if (toneValue < 0) return 'negative';
  return 'neutral';
}

/**
 * Сортує тікети за тональністю
 * @param tickets - масив тікетів
 * @returns об'єкт з розподілом за тональністю
 */
export function classifyTicketsBySentiment(tickets: SupportTicket[]): SentimentClassification {
  const classification: SentimentClassification = {
    positive: [],
    negative: [],
    neutral: []
  };

  tickets.forEach(ticket => {
    const sentiment = classifySentiment(ticket.ai_ton_of_voice_value);
    classification[sentiment].push(ticket);
  });

  return classification;
}

/**
 * Розраховує статистику для категорії
 * @param items - масив значень
 * @param total - загальна кількість
 * @returns об'єкт з підрахунком та відсотками
 */
function calculateCategoryStats(items: string[], total: number): Record<string, { count: number; percentage: number }> {
  const stats: Record<string, { count: number; percentage: number }> = {};
  
  items.forEach(item => {
    if (item) { // Ігноруємо порожні значення
      stats[item] = stats[item] || { count: 0, percentage: 0 };
      stats[item].count++;
    }
  });

  // Розраховуємо відсотки
  Object.keys(stats).forEach(key => {
    stats[key].percentage = total > 0 ? Math.round((stats[key].count / total) * 100 * 100) / 100 : 0;
  });

  return stats;
}

/**
 * Створює статистику по днях за останні 7 днів
 * @param tickets - масив тікетів
 * @returns масив статистики по днях
 */
export function createDailyStats(tickets: SupportTicket[]): DailyTicketStats[] {
  const last7Days = [];
  const today = new Date();
  
  // Створюємо масив дат за останні 7 днів
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]); // Формат YYYY-MM-DD
  }

  // Групуємо тікети по датах
  const dailyStats: DailyTicketStats[] = last7Days.map(date => {
    const dayTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.created_at).toISOString().split('T')[0];
      return ticketDate === date;
    });

    const sentiment = {
      positive: dayTickets.filter(ticket => classifySentiment(ticket.ai_ton_of_voice_value) === 'positive').length,
      negative: dayTickets.filter(ticket => classifySentiment(ticket.ai_ton_of_voice_value) === 'negative').length,
      neutral: dayTickets.filter(ticket => classifySentiment(ticket.ai_ton_of_voice_value) === 'neutral').length,
    };

    return {
      date,
      count: dayTickets.length,
      sentiment
    };
  });

  return dailyStats;
}

/**
 * Повний аналіз тікетів підтримки
 * @param tickets - масив тікетів з v_company_support_tickets
 * @returns детальний аналіз з класифікацією та статистикою
 */
export function analyzeSupportTickets(tickets: SupportTicket[]): SupportTicketsAnalysis {
  const totalTickets = tickets.length;
  
  if (totalTickets === 0) {
    return {
      totalTickets: 0,
      sentimentClassification: { positive: [], negative: [], neutral: [] },
      sentimentStats: {
        positive: { count: 0, percentage: 0 },
        negative: { count: 0, percentage: 0 },
        neutral: { count: 0, percentage: 0 }
      },
      ticketTypeStats: {},
      dataSourceStats: {},
      themeStats: {},
      dailyStats: []
    };
  }

  // Класифікація за тональністю
  const sentimentClassification = classifyTicketsBySentiment(tickets);
  
  // Статистика тональності
  const sentimentStats = {
    positive: {
      count: sentimentClassification.positive.length,
      percentage: Math.round((sentimentClassification.positive.length / totalTickets) * 100 * 100) / 100
    },
    negative: {
      count: sentimentClassification.negative.length,
      percentage: Math.round((sentimentClassification.negative.length / totalTickets) * 100 * 100) / 100
    },
    neutral: {
      count: sentimentClassification.neutral.length,
      percentage: Math.round((sentimentClassification.neutral.length / totalTickets) * 100 * 100) / 100
    }
  };

  // Статистика типів тікетів
  const ticketTypes = tickets.map(ticket => ticket.ticket_type_title);
  const ticketTypeStats = calculateCategoryStats(ticketTypes, totalTickets);

  // Статистика джерел даних
  const dataSources = tickets.map(ticket => ticket.ai_company_answer_data_source_title);
  const dataSourceStats = calculateCategoryStats(dataSources, totalTickets);

  // Статистика тем
  const themes = tickets.map(ticket => ticket.ai_theme);
  const themeStats = calculateCategoryStats(themes, totalTickets);

  // Статистика по днях за останні 7 днів
  const dailyStats = createDailyStats(tickets);

  return {
    totalTickets,
    sentimentClassification,
    sentimentStats,
    ticketTypeStats,
    dataSourceStats,
    themeStats,
    dailyStats
  };
}

/**
 * Сортує тікети за тональністю (позитивні, нейтральні, негативні)
 * @param tickets - масив тікетів
 * @returns відсортований масив тікетів
 */
export function sortTicketsBySentiment(tickets: SupportTicket[]): SupportTicket[] {
  return [...tickets].sort((a, b) => {
    // Сортування: позитивні -> нейтральні -> негативні
    const sentimentA = classifySentiment(a.ai_ton_of_voice_value);
    const sentimentB = classifySentiment(b.ai_ton_of_voice_value);
    
    const order = { positive: 0, neutral: 1, negative: 2 };
    return order[sentimentA] - order[sentimentB];
  });
}

/**
 * Фільтрує тікети за тональністю
 * @param tickets - масив тікетів
 * @param sentiment - тональність для фільтрації
 * @returns відфільтрований масив тікетів
 */
export function filterTicketsBySentiment(
  tickets: SupportTicket[], 
  sentiment: 'positive' | 'negative' | 'neutral'
): SupportTicket[] {
  return tickets.filter(ticket => classifySentiment(ticket.ai_ton_of_voice_value) === sentiment);
}
