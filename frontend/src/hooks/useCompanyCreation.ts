import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { createCompany, createUserCompany } from '@/store/slices/companySlice';
import { companyService } from '@/utils/companyService';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const useCompanyCreation = () => {
  const dispatch = useAppDispatch();

  const createCompanyWithUser = useCallback(async (
    user: SupabaseUser,
    companyData: { title: string; site_url: string },
    roleId: number = 1 // За замовчуванням роль адміністратора
  ) => {
    try {
      // Створюємо компанію
      const company = await companyService.createCompany(companyData);
      
      // Створюємо зв'язок користувач-компанія
      const userCompany = await companyService.createUserCompany({
        user_id: user.id,
        company_id: company.id,
        role_id: roleId,
      });

      // Оновлюємо Redux store
      dispatch(createCompany.fulfilled(company, '', company));
      dispatch(createUserCompany.fulfilled(userCompany, '', {
        user_id: user.id,
        company_id: company.id,
        role_id: roleId,
      }));

      return { company, userCompany, companyId: company.id, error: null };
    } catch (error) {
      console.error('Error creating company with user:', error);
      return { 
        company: null, 
        userCompany: null, 
        companyId: null,
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }, [dispatch]);

  return {
    createCompanyWithUser,
  };
};
