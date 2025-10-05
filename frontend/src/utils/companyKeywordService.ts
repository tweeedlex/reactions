import supabase from './supabase';
import type { CompanyKeyword } from '@/types';

export const companyKeywordService = {
  // Отримати всі ключові слова для компанії
  async getCompanyKeywords(companyId: number): Promise<CompanyKeyword[]> {
    try {
      const { data, error } = await supabase
        .from('company_tags')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company keywords:', error);
        throw error;
      }

      // Повертаємо в форматі CompanyKeyword
      return (data || []).map(item => ({
        id: item.id,
        company_id: item.company_id,
        keyword: item.title,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error in getCompanyKeywords:', error);
      throw error;
    }
  },

  // Створити нове ключове слово
  async createCompanyKeyword(keyword: Omit<CompanyKeyword, 'id' | 'created_at' | 'updated_at'>): Promise<CompanyKeyword> {
    try {
      const { data, error } = await supabase
        .from('company_tags')
        .insert([{
          company_id: keyword.company_id,
          title: keyword.keyword,
          attention_rank: 1
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating company keyword:', error);
        throw error;
      }

      // Повертаємо в форматі CompanyKeyword
      return {
        id: data.id,
        company_id: data.company_id,
        keyword: data.title,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error in createCompanyKeyword:', error);
      throw error;
    }
  },

  // Оновити ключове слово
  async updateCompanyKeyword(id: number, updates: Partial<Omit<CompanyKeyword, 'id' | 'created_at' | 'updated_at'>>): Promise<CompanyKeyword> {
    try {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (updates.keyword) {
        updateData.title = updates.keyword;
      }

      const { data, error } = await supabase
        .from('company_tags')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company keyword:', error);
        throw error;
      }

      // Повертаємо в форматі CompanyKeyword
      return {
        id: data.id,
        company_id: data.company_id,
        keyword: data.title,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error in updateCompanyKeyword:', error);
      throw error;
    }
  },

  // Видалити ключове слово
  async deleteCompanyKeyword(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('company_tags')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company keyword:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteCompanyKeyword:', error);
      throw error;
    }
  },

  // Створити ключові слова з масиву
  async createMultipleKeywords(companyId: number, keywords: string[]): Promise<CompanyKeyword[]> {
    try {
      const keywordObjects = keywords.map(keyword => ({
        company_id: companyId,
        title: keyword.trim(),
        attention_rank: 1
      }));

      // Фільтруємо порожні ключові слова
      const validKeywords = keywordObjects.filter(k => k.title.length > 0);

      if (validKeywords.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('company_tags')
        .insert(validKeywords)
        .select();

      if (error) {
        console.error('Error creating multiple company keywords:', error);
        throw error;
      }

      // Повертаємо в форматі CompanyKeyword
      return (data || []).map(item => ({
        id: item.id,
        company_id: item.company_id,
        keyword: item.title,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error in createMultipleKeywords:', error);
      throw error;
    }
  },

  // Перевірити чи існує ключове слово
  async keywordExists(companyId: number, keyword: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('company_tags')
        .select('id')
        .eq('company_id', companyId)
        .eq('title', keyword.trim())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking keyword existence:', error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error in keywordExists:', error);
      throw error;
    }
  },

  // Отримати ключові слова як масив рядків
  async getCompanyKeywordsAsStrings(companyId: number): Promise<string[]> {
    try {
      const keywords = await this.getCompanyKeywords(companyId);
      return keywords.map(k => k.keyword);
    } catch (error) {
      console.error('Error in getCompanyKeywordsAsStrings:', error);
      throw error;
    }
  }
};
