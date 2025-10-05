import supabase from './supabase';
import type { CompanyTag } from '@/types';

export const companyTagService = {
  // Отримати всі теги для компанії
  async getCompanyTags(companyId: number): Promise<CompanyTag[]> {
    try {
      const { data, error } = await supabase
        .from('company_tags')
        .select('*')
        .eq('company_id', companyId)
        .order('attention_rank', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company tags:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCompanyTags:', error);
      throw error;
    }
  },

  // Створити новий тег
  async createCompanyTag(tag: Omit<CompanyTag, 'id' | 'created_at' | 'updated_at'>): Promise<CompanyTag> {
    try {
      const { data, error } = await supabase
        .from('company_tags')
        .insert([tag])
        .select()
        .single();

      if (error) {
        console.error('Error creating company tag:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createCompanyTag:', error);
      throw error;
    }
  },

  // Оновити тег
  async updateCompanyTag(id: number, updates: Partial<Omit<CompanyTag, 'id' | 'created_at' | 'updated_at'>>): Promise<CompanyTag> {
    try {
      const { data, error } = await supabase
        .from('company_tags')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company tag:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCompanyTag:', error);
      throw error;
    }
  },

  // Видалити тег
  async deleteCompanyTag(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('company_tags')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company tag:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteCompanyTag:', error);
      throw error;
    }
  },

  // Створити теги з масиву назв
  async createMultipleTags(companyId: number, tagTitles: string[], attentionRank: number = 1): Promise<CompanyTag[]> {
    try {
      const tags = tagTitles.map(title => ({
        company_id: companyId,
        title: title.trim(),
        attention_rank: attentionRank
      }));

      // Фільтруємо порожні назви
      const validTags = tags.filter(tag => tag.title.length > 0);

      if (validTags.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('company_tags')
        .insert(validTags)
        .select();

      if (error) {
        console.error('Error creating multiple company tags:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in createMultipleTags:', error);
      throw error;
    }
  },

  // Перевірити чи існує тег з такою назвою
  async tagExists(companyId: number, title: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('company_tags')
        .select('id')
        .eq('company_id', companyId)
        .eq('title', title.trim())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking tag existence:', error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error in tagExists:', error);
      throw error;
    }
  },

  // Отримати теги як масив рядків (для сумісності з існуючим кодом)
  async getCompanyTagsAsStrings(companyId: number): Promise<string[]> {
    try {
      const tags = await this.getCompanyTags(companyId);
      return tags.map(tag => tag.title);
    } catch (error) {
      console.error('Error in getCompanyTagsAsStrings:', error);
      throw error;
    }
  }
};
