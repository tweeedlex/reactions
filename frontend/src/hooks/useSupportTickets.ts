import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supportService } from '@/utils/supportService';
import { analyzeSupportTickets, filterTicketsBySentiment, sortTicketsBySentiment } from '@/utils/supportTicketsAnalysis';
import type { SupportTicket, Comment } from '@/types';
import type { RootState } from '@/store';
import type { SupportTicketsAnalysis } from '@/utils/supportTicketsAnalysis';

export type TicketStatusFilter = 'all' | 'open' | 'closed';
export type SentimentFilter = 'all' | 'positive' | 'negative' | 'neutral';

interface UseSupportTicketsReturn {
  tickets: SupportTicket[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  statusFilter: TicketStatusFilter;
  setStatusFilter: (filter: TicketStatusFilter) => void;
  sentimentFilter: SentimentFilter;
  setSentimentFilter: (filter: SentimentFilter) => void;
  closeTicket: (ticketId: number) => Promise<void>;
  reopenTicket: (ticketId: number) => Promise<void>;
  analysis: SupportTicketsAnalysis | null;
  sortedTickets: SupportTicket[];
}

export function useSupportTickets(): UseSupportTicketsReturn {
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatusFilter>('all');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [analysis, setAnalysis] = useState<SupportTicketsAnalysis | null>(null);

  // Отримуємо поточну компанію з Redux store
  const currentCompany = useSelector((state: RootState) => state.company.currentCompany);

  const fetchTickets = async () => {
    if (!currentCompany?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const fetchedTickets = await supportService.getCompanySupportTickets(currentCompany.id);
      setAllTickets(fetchedTickets);
      
      // Створюємо аналіз всіх тікетів
      const ticketsAnalysis = analyzeSupportTickets(fetchedTickets);
      setAnalysis(ticketsAnalysis);
      
      // Фільтруємо тікети за статусом
      const statusFilteredTickets = filterTicketsByStatus(fetchedTickets, statusFilter);
      
      // Фільтруємо тікети за тональністю
      const sentimentFilteredTickets = sentimentFilter === 'all' 
        ? statusFilteredTickets 
        : filterTicketsBySentiment(statusFilteredTickets, sentimentFilter);
      
      setTickets(sentimentFilteredTickets);
      
      // Конвертуємо tickets в comments для сумісності з існуючими компонентами
      const convertedComments = sentimentFilteredTickets.map(ticket => 
        supportService.convertTicketToComment(ticket)
      );
      setComments(convertedComments);
      
    } catch (err) {
      console.error('Error fetching support tickets:', err);
      setError(err instanceof Error ? err.message : 'Помилка завантаження тікетів');
      setAllTickets([]);
      setTickets([]);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Функція фільтрації тікетів за статусом (використовуємо локальний статус)
  const filterTicketsByStatus = (ticketsList: SupportTicket[], filter: TicketStatusFilter): SupportTicket[] => {
    switch (filter) {
      case 'open':
        return ticketsList.filter(ticket => {
          const localStatus = supportService.getLocalTicketStatus(ticket.id);
          // Якщо є локальний статус, використовуємо його, інакше вважаємо відкритим
          return localStatus === null || localStatus === 'open';
        });
      case 'closed':
        return ticketsList.filter(ticket => {
          const localStatus = supportService.getLocalTicketStatus(ticket.id);
          return localStatus === 'closed';
        });
      case 'all':
      default:
        return ticketsList;
    }
  };

  // Функція для зміни фільтру статусу
  const handleStatusFilterChange = (filter: TicketStatusFilter) => {
    setStatusFilter(filter);
    applyFilters(filter, sentimentFilter);
  };

  // Функція для зміни фільтру тональності
  const handleSentimentFilterChange = (filter: SentimentFilter) => {
    setSentimentFilter(filter);
    applyFilters(statusFilter, filter);
  };

  // Функція для застосування фільтрів
  const applyFilters = (statusFilter: TicketStatusFilter, sentimentFilter: SentimentFilter) => {
    // Фільтруємо за статусом
    const statusFilteredTickets = filterTicketsByStatus(allTickets, statusFilter);
    
    // Фільтруємо за тональністю
    const sentimentFilteredTickets = sentimentFilter === 'all' 
      ? statusFilteredTickets 
      : filterTicketsBySentiment(statusFilteredTickets, sentimentFilter);
    
    setTickets(sentimentFilteredTickets);
    
    // Конвертуємо в comments
    const convertedComments = sentimentFilteredTickets.map(ticket => 
      supportService.convertTicketToComment(ticket)
    );
    setComments(convertedComments);
  };

  // Функція для закриття тікета (локально)
  const closeTicket = async (ticketId: number) => {
    try {
      await supportService.closeTicket(ticketId);
      // Оновлюємо фільтровані тікети
      applyFilters(statusFilter, sentimentFilter);
      
    } catch (err) {
      console.error('Error closing ticket:', err);
      setError(err instanceof Error ? err.message : 'Помилка закриття тікета');
    }
  };

  // Функція для повторного відкриття тікета (локально)
  const reopenTicket = async (ticketId: number) => {
    try {
      await supportService.reopenTicket(ticketId);
      // Оновлюємо фільтровані тікети
      applyFilters(statusFilter, sentimentFilter);
      
    } catch (err) {
      console.error('Error reopening ticket:', err);
      setError(err instanceof Error ? err.message : 'Помилка відкриття тікета');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentCompany?.id]);

  // Створюємо відсортовані тікети за тональністю
  const sortedTickets = sortTicketsBySentiment(allTickets);

  return {
    tickets,
    comments,
    loading,
    error,
    refetch: fetchTickets,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    sentimentFilter,
    setSentimentFilter: handleSentimentFilterChange,
    closeTicket,
    reopenTicket,
    analysis,
    sortedTickets
  };
}
