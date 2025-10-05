import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { 
  fetchCompanyTags, 
  createCompanyTag, 
  createMultipleCompanyTags,
  updateCompanyTag, 
  deleteCompanyTag 
} from '@/store/slices/companySlice';
import type { CompanyTag } from '@/types';

export function useCompanyTags(companyId?: number) {
  const dispatch = useDispatch();
  const { companyTags, loading, error } = useSelector((state: RootState) => state.company);

  // Завантажуємо теги при зміні компанії
  useEffect(() => {
    if (companyId) {
      dispatch(fetchCompanyTags(companyId) as any);
    }
  }, [dispatch, companyId]);

  const createTag = async (title: string, attentionRank: number = 1) => {
    if (!companyId) throw new Error('Company ID is required');
    
    return dispatch(createCompanyTag({ 
      companyId, 
      title, 
      attentionRank 
    }) as any);
  };

  const createTags = async (tagTitles: string[], attentionRank: number = 1) => {
    if (!companyId) throw new Error('Company ID is required');
    
    return dispatch(createMultipleCompanyTags({ 
      companyId, 
      tagTitles, 
      attentionRank 
    }) as any);
  };

  const updateTag = async (id: number, updates: Partial<Pick<CompanyTag, 'title' | 'attention_rank'>>) => {
    return dispatch(updateCompanyTag({ id, updates }) as any);
  };

  const deleteTag = async (id: number) => {
    return dispatch(deleteCompanyTag(id) as any);
  };

  const refreshTags = async () => {
    if (companyId) {
      return dispatch(fetchCompanyTags(companyId) as any);
    }
  };

  // Отримуємо теги як масив рядків для сумісності
  const getTagsAsStrings = (): string[] => {
    return companyTags.map(tag => tag.title);
  };

  // Отримуємо теги відсортовані за пріоритетом
  const getTagsSortedByPriority = (): CompanyTag[] => {
    return [...companyTags].sort((a, b) => b.attention_rank - a.attention_rank);
  };

  // Перевіряємо чи існує тег з такою назвою
  const tagExists = (title: string): boolean => {
    return companyTags.some(tag => tag.title.toLowerCase() === title.toLowerCase());
  };

  return {
    tags: companyTags,
    loading,
    error,
    createTag,
    createTags,
    updateTag,
    deleteTag,
    refreshTags,
    getTagsAsStrings,
    getTagsSortedByPriority,
    tagExists
  };
}
