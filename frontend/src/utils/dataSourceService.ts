import supabase from './supabase';
import type { DataSource, DataSourceWithLinks } from '@/types';

export const dataSourceService = {
  // Отримати всі джерела даних компанії
  async getCompanyDataSources(companyId: number): Promise<DataSourceWithLinks[]> {
    try {
      const { data: dataSources, error } = await supabase
        .from('companies_data_sources')
        .select('*')
        .eq('company_id', companyId)
        .order('title');

      if (error) {
        // Якщо таблиця не існує, повертаємо порожній масив
        if (error.code === 'PGRST116' || error.message.includes('relation does not exist')) {
          console.warn('companies_data_sources table does not exist');
          return [];
        }
        throw error;
      }

      // Групуємо джерела за назвою та типом
      const groupedSources = new Map<string, DataSourceWithLinks>();
      
      dataSources.forEach((source: DataSource) => {
        const key = `${source.title}_${source.type_id}`;
        
        if (groupedSources.has(key)) {
          // Додаємо нове посилання до існуючого джерела
          const existingSource = groupedSources.get(key)!;
          existingSource.links.push({
            id: source.id,
            url: source.url,
            interval_type_id: source.interval_type_id,
          });
        } else {
          // Створюємо нове джерело
          groupedSources.set(key, {
            id: source.id,
            company_id: source.company_id,
            type_id: source.type_id,
            title: source.title,
            links: [{
              id: source.id,
              url: source.url,
              interval_type_id: source.interval_type_id,
            }],
          });
        }
      });

      return Array.from(groupedSources.values());
    } catch (error) {
      console.error('Error fetching company data sources:', error);
      return [];
    }
  },

  // Створити нове джерело даних
  async createDataSource(
    companyId: number,
    typeId: number,
    title: string,
    urls: string[],
    intervalTypeId: number = 1
  ): Promise<DataSource[]> {
    try {
      const dataToInsert = urls.map(url => ({
        company_id: companyId,
        type_id: typeId,
        url: url,
        interval_type_id: intervalTypeId,
        title: title,
      }));

      const { data, error } = await supabase
        .from('companies_data_sources')
        .insert(dataToInsert)
        .select();

      if (error) throw error;
      return data as DataSource[];
    } catch (error) {
      console.error('Error creating data source:', error);
      throw error;
    }
  },

  // Оновити джерело даних
  async updateDataSource(
    sourceId: number,
    updates: Partial<Pick<DataSource, 'title' | 'url' | 'interval_type_id'>>
  ): Promise<DataSource> {
    try {
      const { data, error } = await supabase
        .from('companies_data_sources')
        .update(updates)
        .eq('id', sourceId)
        .select()
        .single();

      if (error) throw error;
      return data as DataSource;
    } catch (error) {
      console.error('Error updating data source:', error);
      throw error;
    }
  },

  // Видалити джерело даних
  async deleteDataSource(sourceId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('companies_data_sources')
        .delete()
        .eq('id', sourceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting data source:', error);
      throw error;
    }
  },

  // Видалити всі джерела даних компанії за назвою та типом
  async deleteDataSourceGroup(companyId: number, title: string, typeId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('companies_data_sources')
        .delete()
        .eq('company_id', companyId)
        .eq('title', title)
        .eq('type_id', typeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting data source group:', error);
      throw error;
    }
  },

  // Додати нове посилання до існуючого джерела
  async addLinkToDataSource(
    companyId: number,
    typeId: number,
    title: string,
    url: string,
    intervalTypeId: number = 1
  ): Promise<DataSource> {
    try {
      const { data, error } = await supabase
        .from('companies_data_sources')
        .insert([{
          company_id: companyId,
          type_id: typeId,
          url: url,
          interval_type_id: intervalTypeId,
          title: title,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as DataSource;
    } catch (error) {
      console.error('Error adding link to data source:', error);
      throw error;
    }
  },
};
