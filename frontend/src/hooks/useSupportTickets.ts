import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supportService } from '@/utils/supportService';
import type { SupportTicket, Comment } from '@/types';
import type { RootState } from '@/store';

interface UseSupportTicketsReturn {
  tickets: SupportTicket[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSupportTickets(): UseSupportTicketsReturn {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setTickets(fetchedTickets);
      
      // Конвертуємо tickets в comments для сумісності з існуючими компонентами
      const convertedComments = fetchedTickets.map(ticket => 
        supportService.convertTicketToComment(ticket)
      );
      setComments(convertedComments);
      
    } catch (err) {
      console.error('Error fetching support tickets:', err);
      setError(err instanceof Error ? err.message : 'Помилка завантаження тікетів');
      setTickets([]);
      setComments([]);
    } finally {
      setLoading(false);
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
    refetch: fetchTickets
  };
}
