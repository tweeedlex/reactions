import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supportService } from '@/utils/supportService';
import type { SupportTicket, Comment } from '@/types';
import type { RootState } from '@/store';

export type TicketStatusFilter = 'all' | 'open' | 'closed';

interface UseSupportTicketsReturn {
  tickets: SupportTicket[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  statusFilter: TicketStatusFilter;
  setStatusFilter: (filter: TicketStatusFilter) => void;
  closeTicket: (ticketId: number) => Promise<void>;
  reopenTicket: (ticketId: number) => Promise<void>;
}

export function useSupportTickets(): UseSupportTicketsReturn {
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatusFilter>('all');

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
      
      // Фільтруємо тікети за статусом
      const filteredTickets = filterTicketsByStatus(fetchedTickets, statusFilter);
      setTickets(filteredTickets);
      
      // Конвертуємо tickets в comments для сумісності з існуючими компонентами
      const convertedComments = filteredTickets.map(ticket => 
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

  // Функція для зміни фільтру
  const handleStatusFilterChange = (filter: TicketStatusFilter) => {
    setStatusFilter(filter);
    
    // Фільтруємо існуючі тікети
    const filteredTickets = filterTicketsByStatus(allTickets, filter);
    setTickets(filteredTickets);
    
    // Конвертуємо в comments
    const convertedComments = filteredTickets.map(ticket => 
      supportService.convertTicketToComment(ticket)
    );
    setComments(convertedComments);
  };

  // Функція для закриття тікета (локально)
  const closeTicket = async (ticketId: number) => {
    try {
      await supportService.closeTicket(ticketId);
      // Оновлюємо фільтровані тікети
      const filteredTickets = filterTicketsByStatus(allTickets, statusFilter);
      setTickets(filteredTickets);
      
      const convertedComments = filteredTickets.map(ticket => 
        supportService.convertTicketToComment(ticket)
      );
      setComments(convertedComments);
      
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
      const filteredTickets = filterTicketsByStatus(allTickets, statusFilter);
      setTickets(filteredTickets);
      
      const convertedComments = filteredTickets.map(ticket => 
        supportService.convertTicketToComment(ticket)
      );
      setComments(convertedComments);
      
    } catch (err) {
      console.error('Error reopening ticket:', err);
      setError(err instanceof Error ? err.message : 'Помилка відкриття тікета');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentCompany?.id]);

  return {
    tickets,
    comments,
    loading,
    error,
    refetch: fetchTickets,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    closeTicket,
    reopenTicket
  };
}
