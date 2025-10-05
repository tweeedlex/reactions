import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { analyzeSupportTickets, sortTicketsBySentiment, filterTicketsBySentiment } from './supportTicketsAnalysis';
import type { SupportTicket } from '@/types';

/**
 * Приклад використання аналізу тікетів підтримки
 * Демонструє як отримати дані з Supabase та проаналізувати їх
 */
export async function fetchAndAnalyzeSupportTickets(companyId: number) {
  try {
    // Отримуємо дані з Supabase (як у вашому запиті)
    const { data: tickets, error } = await supabase
      .from('v_company_support_tickets')
      .select('*')
      .eq('company_id', companyId); // Додаємо фільтр по компанії

    if (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }

    if (!tickets || tickets.length === 0) {
      console.log('No tickets found for company:', companyId);
      return null;
    }

    // Аналізуємо тікети
    const analysis = analyzeSupportTickets(tickets as SupportTicket[]);
    
    // Сортуємо за тональністю (позитивні -> нейтральні -> негативні)
    const sortedTickets = sortTicketsBySentiment(tickets as SupportTicket[]);

    // Фільтруємо тільки негативні тікети
    const negativeTickets = filterTicketsBySentiment(tickets as SupportTicket[], 'negative');

    // Фільтруємо тільки позитивні тікети
    const positiveTickets = filterTicketsBySentiment(tickets as SupportTicket[], 'positive');

    // Фільтруємо тільки нейтральні тікети
    const neutralTickets = filterTicketsBySentiment(tickets as SupportTicket[], 'neutral');

    console.log('=== АНАЛІЗ ТІКЕТІВ ПІДТРИМКИ ===');
    console.log(`Всього тікетів: ${analysis.totalTickets}`);
    console.log('\n--- Статистика тональності ---');
    console.log(`Позитивні: ${analysis.sentimentStats.positive.count} (${analysis.sentimentStats.positive.percentage}%)`);
    console.log(`Негативні: ${analysis.sentimentStats.negative.count} (${analysis.sentimentStats.negative.percentage}%)`);
    console.log(`Нейтральні: ${analysis.sentimentStats.neutral.count} (${analysis.sentimentStats.neutral.percentage}%)`);

    console.log('\n--- Класифікація намірів (ticket_type_title) ---');
    Object.entries(analysis.ticketTypeStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .forEach(([type, stats]) => {
        console.log(`${type}: ${stats.count} (${stats.percentage}%)`);
      });

    console.log('\n--- Джерела згадок (ai_company_answer_data_source_title) ---');
    Object.entries(analysis.dataSourceStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .forEach(([source, stats]) => {
        console.log(`${source}: ${stats.count} (${stats.percentage}%)`);
      });

    console.log('\n--- Теми обговорення (ai_theme) ---');
    Object.entries(analysis.themeStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .forEach(([theme, stats]) => {
        console.log(`${theme}: ${stats.count} (${stats.percentage}%)`);
      });

    console.log('\n--- Відсортовані тікети за тональністю ---');
    console.log(`Позитивних тікетів: ${positiveTickets.length}`);
    console.log(`Нейтральних тікетів: ${neutralTickets.length}`);
    console.log(`Негативних тікетів: ${negativeTickets.length}`);

    return {
      analysis,
      sortedTickets,
      negativeTickets,
      positiveTickets,
      neutralTickets,
      allTickets: tickets as SupportTicket[]
    };

  } catch (error) {
    console.error('Error in fetchAndAnalyzeSupportTickets:', error);
    throw error;
  }
}

/**
 * Приклад використання в React компоненті
 */
export function useSupportTicketsAnalysisExample(companyId: number) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchAndAnalyzeSupportTickets(companyId);
        setAnalysis(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  return { analysis, loading, error };
}

/**
 * Приклад функції для отримання статистики по конкретному полю
 */
export function getFieldStatistics(tickets: SupportTicket[], fieldName: keyof SupportTicket) {
  const stats: Record<string, { count: number; percentage: number }> = {};
  const total = tickets.length;

  tickets.forEach(ticket => {
    const value = ticket[fieldName] as string;
    if (value) {
      stats[value] = stats[value] || { count: 0, percentage: 0 };
      stats[value].count++;
    }
  });

  // Розраховуємо відсотки
  Object.keys(stats).forEach(key => {
    stats[key].percentage = total > 0 ? Math.round((stats[key].count / total) * 100 * 100) / 100 : 0;
  });

  return stats;
}

// Приклад використання:
// const ticketTypeStats = getFieldStatistics(tickets, 'ticket_type_title');
// const themeStats = getFieldStatistics(tickets, 'ai_theme');
// const dataSourceStats = getFieldStatistics(tickets, 'ai_company_answer_data_source_title');
