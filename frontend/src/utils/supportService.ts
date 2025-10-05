import supabase from './supabase';
import type { SupportTicket } from '@/types';
import { saveTicketStatus, getTicketStatus } from './localStorage';

export class SupportService {
  /**
   * Отримати всі support tickets для компанії
   */
  static async getCompanySupportTickets(companyId: number): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('v_company_support_tickets')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching support tickets:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Отримати support ticket за ID
   */
  static async getSupportTicket(ticketId: number): Promise<SupportTicket | null> {
    const { data, error } = await supabase
      .from('v_company_support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error) {
      console.error('Error fetching support ticket:', error);
      throw error;
    }

    return data;
  }

  /**
   * Оновити support ticket
   */
  static async updateSupportTicket(
    ticketId: number, 
    updates: Partial<Pick<SupportTicket, 'status_title' | 'ai_ton_of_voice_value' | 'ai_suggested_answer_text'>>
  ): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('v_company_support_tickets') // Використовуємо основну таблицю для оновлення
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      console.error('Error updating support ticket:', error);
      throw error;
    }

    return data;
  }

  /**
   * Оновити статус тікета через основну таблицю
   */
  static async updateTicketStatus(
    ticketId: number, 
    statusTitle: string
  ): Promise<void> {
    const { error } = await supabase
      .from('v_company_support_tickets')
      .update({ status_title: statusTitle })
      .eq('id', ticketId);

    if (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  /**
   * Закрити тікет (локально)
   */
  static async closeTicket(ticketId: number): Promise<void> {
    saveTicketStatus(ticketId, 'closed');
  }

  /**
   * Відкрити тікет (локально)
   */
  static async reopenTicket(ticketId: number): Promise<void> {
    saveTicketStatus(ticketId, 'open');
  }

  /**
   * Отримати локальний статус тікета
   */
  static getLocalTicketStatus(ticketId: number): 'open' | 'closed' | null {
    return getTicketStatus(ticketId);
  }

  /**
   * Конвертувати SupportTicket в Comment для сумісності з існуючими компонентами
   */
  static convertTicketToComment(ticket: SupportTicket): import('@/types').Comment {
    // Визначаємо платформу на основі джерела даних або типу тікета
    const platform = this.getPlatformFromTicketType(ticket.ticket_type_title, ticket.ai_company_answer_data_source_title);
    
    // Визначаємо sentiment на основі тональності
    const sentiment = this.getSentimentFromTone(ticket.ai_ton_of_voice_value);
    
    // Визначаємо пріоритет на основі статусу
    const priority = this.getPriorityFromStatus(ticket.status_title);
    
    // Генеруємо username на основі ID
    const username = `Користувач #${ticket.id}`;
    
    // Визначаємо avatar на основі типу
    const avatar = this.getAvatarFromTicketType(ticket.ticket_type_title);

    return {
      id: ticket.id,
      platform,
      username,
      avatar,
      text: ticket.user_message,
      timestamp: this.formatTimestamp(ticket.created_at),
      sentiment,
      priority,
      likes: 0, // Не маємо даних про лайки
      replies: 0, // Не маємо даних про відповіді
      url: ticket.ai_company_answer_data_source_url || '#',
      highlightedKeywords: ticket.tags_array || [],
      localStatus: this.getLocalTicketStatus(ticket.id) || 'open' // Додаємо локальний статус
    };
  }

  /**
   * Визначити платформу на основі типу тікета або джерела даних
   */
  private static getPlatformFromTicketType(ticketType: string, dataSourceTitle?: string): string {
    // Якщо є назва джерела даних, використовуємо її
    if (dataSourceTitle && dataSourceTitle.trim()) {
      return dataSourceTitle.trim();
    }

    // Інакше використовуємо мапінг типів
    const platformMap: Record<string, string> = {
      'Facebook': 'Facebook',
      'Instagram': 'Instagram',
      'Twitter': 'Twitter',
      'Reddit': 'Reddit',
      'TrustPilot': 'TrustPilot',
      'App Store': 'App Store',
      'Google Play': 'Google Play',
      'YouTube': 'YouTube',
      'TikTok': 'TikTok',
      'LinkedIn': 'LinkedIn'
    };

    return platformMap[ticketType] || 'Соціальна мережа';
  }

  /**
   * Визначити sentiment на основі тональності
   */
  private static getSentimentFromTone(toneValue: number): 'positive' | 'negative' | 'neutral' {
    if (toneValue >= 0.6) return 'positive';
    if (toneValue <= 0.4) return 'negative';
    return 'neutral';
  }

  /**
   * Визначити пріоритет на основі статусу
   */
  private static getPriorityFromStatus(status: string): 'high' | 'medium' | 'low' {
    const highPriorityStatuses = ['Критичний', 'Високий', 'Терміново'];
    const mediumPriorityStatuses = ['Середній', 'В обробці', 'Новий'];
    
    if (highPriorityStatuses.some(s => status.includes(s))) return 'high';
    if (mediumPriorityStatuses.some(s => status.includes(s))) return 'medium';
    return 'low';
  }

  /**
   * Визначити avatar на основі типу тікета
   */
  private static getAvatarFromTicketType(ticketType: string): string {
    const avatarMap: Record<string, string> = {
      'Facebook': '👥',
      'Instagram': '📸',
      'Twitter': '🐦',
      'Reddit': '🤖',
      'TrustPilot': '⭐',
      'App Store': '📱',
      'Google Play': '🤖',
      'YouTube': '📺',
      'TikTok': '🎵',
      'LinkedIn': '💼'
    };

    return avatarMap[ticketType] || '💬';
  }

  /**
   * Форматувати timestamp
   */
  private static formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return 'Щойно';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} хв тому`;
    } else if (diffHours < 24) {
      return `${diffHours} год тому`;
    } else if (diffDays < 7) {
      return `${diffDays} дн тому`;
    } else {
      return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}

export const supportService = SupportService;
