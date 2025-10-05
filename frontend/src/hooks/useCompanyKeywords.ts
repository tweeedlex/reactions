import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { 
  fetchCompanyKeywords, 
  createCompanyKeyword, 
  createMultipleCompanyKeywords,
  updateCompanyKeyword, 
  deleteCompanyKeyword 
} from '@/store/slices/companySlice';
import type { CompanyKeyword } from '@/types';

export function useCompanyKeywords(companyId?: number) {
  const dispatch = useDispatch();
  const { companyKeywords, loading, error } = useSelector((state: RootState) => state.company);

  // Завантажуємо ключові слова при зміні компанії
  useEffect(() => {
    if (companyId) {
      dispatch(fetchCompanyKeywords(companyId) as any);
    }
  }, [dispatch, companyId]);

  const createKeyword = async (keyword: string) => {
    if (!companyId) throw new Error('Company ID is required');
    
    return dispatch(createCompanyKeyword({ 
      companyId, 
      keyword 
    }) as any);
  };

  const createKeywords = async (keywords: string[]) => {
    if (!companyId) throw new Error('Company ID is required');
    
    return dispatch(createMultipleCompanyKeywords({ 
      companyId, 
      keywords 
    }) as any);
  };

  const updateKeyword = async (id: number, updates: Partial<Pick<CompanyKeyword, 'keyword'>>) => {
    return dispatch(updateCompanyKeyword({ id, updates }) as any);
  };

  const deleteKeyword = async (id: number) => {
    return dispatch(deleteCompanyKeyword(id) as any);
  };

  const refreshKeywords = async () => {
    if (companyId) {
      return dispatch(fetchCompanyKeywords(companyId) as any);
    }
  };

  // Отримуємо ключові слова як масив рядків
  const getKeywordsAsStrings = (): string[] => {
    return companyKeywords.map(k => k.keyword);
  };

  // Перевіряємо чи існує ключове слово
  const keywordExists = (keyword: string): boolean => {
    return companyKeywords.some(k => k.keyword.toLowerCase() === keyword.toLowerCase());
  };

  return {
    keywords: companyKeywords,
    loading,
    error,
    createKeyword,
    createKeywords,
    updateKeyword,
    deleteKeyword,
    refreshKeywords,
    getKeywordsAsStrings,
    keywordExists
  };
}
