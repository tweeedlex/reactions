import supabase from './supabase';
import type { Company, UserCompanyWithCompany, UserRole } from '@/types';

export const companyService = {
  // Отримати компанії користувача з джойном
  async getUserCompanies(userId: string): Promise<UserCompanyWithCompany[]> {
    try {
      const { data: userCompanies, error } = await supabase
        .from('user_companies')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user companies:', error);
        // Якщо таблиця не існує, повертаємо порожній масив
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          return [];
        }
        throw error;
      }

      return (userCompanies || []) as UserCompanyWithCompany[];
    } catch (error) {
      console.error('Error in getUserCompanies:', error);
      // Повертаємо порожній масив замість кидання помилки
      return [];
    }
  },

  // Отримати всі компанії
  async getAllCompanies(): Promise<Company[]> {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*');

    if (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }

    return companies as Company[];
  },

  // Створити нову компанію
  async createCompany(companyData: { title: string; site_url: string }): Promise<Company> {
    const { data: company, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      throw error;
    }

    return company as Company;
  },

  // Створити зв'язок користувач-компанія
  async createUserCompany(userCompanyData: {
    user_id: string;
    company_id: number;
    role_id: number;
  }): Promise<UserCompanyWithCompany> {
    const { data: userCompany, error } = await supabase
      .from('user_companies')
      .insert([userCompanyData])
      .select(`
        *,
        company:companies(*)
      `)
      .single();

    if (error) {
      console.error('Error creating user company:', error);
      throw error;
    }

    return userCompany as UserCompanyWithCompany;
  },

  // Перевірити чи є у користувача компанії
  async hasUserCompanies(userId: string): Promise<boolean> {
    try {
      const userCompanies = await this.getUserCompanies(userId);
      return userCompanies.length > 0;
    } catch (error) {
      console.error('Error checking user companies:', error);
      // Якщо таблиці не існують або є інша помилка, повертаємо false
      return false;
    }
  },

  // Отримати першу компанію користувача
  async getFirstUserCompany(userId: string): Promise<UserCompanyWithCompany | null> {
    try {
      const userCompanies = await this.getUserCompanies(userId);
      return userCompanies.length > 0 ? userCompanies[0] : null;
    } catch (error) {
      console.error('Error getting first user company:', error);
      return null;
    }
  },

  // Отримати роль користувача
  getUserRole(roleId: number): UserRole {
    return roleId === 1 ? 'admin' : 'support';
  },

  // Перевірити чи користувач адміністратор
  isAdmin(roleId: number): boolean {
    return roleId === 1;
  },

  // Отримати роль поточної компанії користувача
  async getUserRoleForCompany(userId: string): Promise<UserRole | null> {
    try {
      const userCompanies = await this.getUserCompanies(userId);
      if (userCompanies.length > 0) {
        return this.getUserRole(userCompanies[0].role_id);
      }
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },
};
