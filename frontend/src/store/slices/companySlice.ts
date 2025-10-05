import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import supabase from '@/utils/supabase';
import type { Company, UserCompanyWithCompany, CompanyState, UserRole, DataSourceWithLinks, CompanyTag, CompanyKeyword } from '@/types';
import { companyService } from '@/utils/companyService';
import { dataSourceService } from '@/utils/dataSourceService';
import { companyTagService } from '@/utils/companyTagService';
import { companyKeywordService } from '@/utils/companyKeywordService';

// Async thunks
export const fetchUserCompanies = createAsyncThunk(
  'company/fetchUserCompanies',
  async (userId: string) => {
    const { data: userCompanies, error } = await supabase
      .from('user_companies')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return userCompanies as UserCompanyWithCompany[];
  }
);

export const fetchCompanies = createAsyncThunk(
  'company/fetchCompanies',
  async () => {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*');

    if (error) throw error;
    return companies as Company[];
  }
);

export const createCompany = createAsyncThunk(
  'company/createCompany',
  async (companyData: { title: string; site_url: string }) => {
    const { data: company, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single();

    if (error) throw error;
    return company as Company;
  }
);

export const createUserCompany = createAsyncThunk(
  'company/createUserCompany',
  async (userCompanyData: { user_id: string; company_id: number; role_id: number }) => {
    const { data: userCompany, error } = await supabase
      .from('user_companies')
      .insert([userCompanyData])
      .select(`
        *,
        company:companies(*)
      `)
      .single();

    if (error) throw error;
    return userCompany as UserCompanyWithCompany;
  }
);

// Data Sources thunks
export const fetchCompanyDataSources = createAsyncThunk(
  'company/fetchCompanyDataSources',
  async (companyId: number) => {
    return await dataSourceService.getCompanyDataSources(companyId);
  }
);

export const createDataSource = createAsyncThunk(
  'company/createDataSource',
  async (data: { companyId: number; typeId: number; title: string; urls: string[]; intervalTypeId?: number }) => {
    return await dataSourceService.createDataSource(
      data.companyId,
      data.typeId,
      data.title,
      data.urls,
      data.intervalTypeId
    );
  }
);

export const updateDataSource = createAsyncThunk(
  'company/updateDataSource',
  async (data: { sourceId: number; updates: Partial<Pick<DataSourceWithLinks, 'title'>> }) => {
    return await dataSourceService.updateDataSource(data.sourceId, data.updates);
  }
);

export const deleteDataSource = createAsyncThunk(
  'company/deleteDataSource',
  async (sourceId: number) => {
    await dataSourceService.deleteDataSource(sourceId);
    return sourceId;
  }
);

export const deleteDataSourceGroup = createAsyncThunk(
  'company/deleteDataSourceGroup',
  async (data: { companyId: number; title: string; typeId: number }) => {
    await dataSourceService.deleteDataSourceGroup(data.companyId, data.title, data.typeId);
    return { companyId: data.companyId, title: data.title, typeId: data.typeId };
  }
);

// Company Tags thunks
export const fetchCompanyTags = createAsyncThunk(
  'company/fetchCompanyTags',
  async (companyId: number) => {
    return await companyTagService.getCompanyTags(companyId);
  }
);

export const createCompanyTag = createAsyncThunk(
  'company/createCompanyTag',
  async (tagData: { companyId: number; title: string; attentionRank?: number }) => {
    return await companyTagService.createCompanyTag({
      company_id: tagData.companyId,
      title: tagData.title,
      attention_rank: tagData.attentionRank || 1
    });
  }
);

export const createMultipleCompanyTags = createAsyncThunk(
  'company/createMultipleCompanyTags',
  async (data: { companyId: number; tagTitles: string[]; attentionRank?: number }) => {
    return await companyTagService.createMultipleTags(
      data.companyId, 
      data.tagTitles, 
      data.attentionRank || 1
    );
  }
);

export const updateCompanyTag = createAsyncThunk(
  'company/updateCompanyTag',
  async (data: { id: number; updates: Partial<Pick<CompanyTag, 'title' | 'attention_rank'>> }) => {
    return await companyTagService.updateCompanyTag(data.id, data.updates);
  }
);

export const deleteCompanyTag = createAsyncThunk(
  'company/deleteCompanyTag',
  async (id: number) => {
    await companyTagService.deleteCompanyTag(id);
    return id;
  }
);

// Company Keywords thunks
export const fetchCompanyKeywords = createAsyncThunk(
  'company/fetchCompanyKeywords',
  async (companyId: number) => {
    return await companyKeywordService.getCompanyKeywords(companyId);
  }
);

export const createCompanyKeyword = createAsyncThunk(
  'company/createCompanyKeyword',
  async (data: { companyId: number; keyword: string }) => {
    return await companyKeywordService.createCompanyKeyword({
      company_id: data.companyId,
      keyword: data.keyword
    });
  }
);

export const createMultipleCompanyKeywords = createAsyncThunk(
  'company/createMultipleCompanyKeywords',
  async (data: { companyId: number; keywords: string[] }) => {
    return await companyKeywordService.createMultipleKeywords(data.companyId, data.keywords);
  }
);

export const updateCompanyKeyword = createAsyncThunk(
  'company/updateCompanyKeyword',
  async (data: { id: number; updates: Partial<Pick<CompanyKeyword, 'keyword'>> }) => {
    return await companyKeywordService.updateCompanyKeyword(data.id, data.updates);
  }
);

export const deleteCompanyKeyword = createAsyncThunk(
  'company/deleteCompanyKeyword',
  async (id: number) => {
    await companyKeywordService.deleteCompanyKeyword(id);
    return id;
  }
);

// Update company thunk
export const updateCompany = createAsyncThunk(
  'company/updateCompany',
  async (data: { id: number; updates: Partial<Pick<Company, 'title' | 'site_url'>> }) => {
    return await companyService.updateCompany(data.id, data.updates);
  }
);

const initialState: CompanyState = {
  companies: [],
  userCompanies: [],
  currentCompany: null,
  currentUserRole: null,
  dataSources: [],
  companyTags: [],
  companyKeywords: [],
  loading: false,
  error: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCurrentCompany: (state, action: PayloadAction<Company | null>) => {
      state.currentCompany = action.payload;
    },
    setCurrentUserRole: (state, action: PayloadAction<UserRole | null>) => {
      state.currentUserRole = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCompanyData: (state) => {
      state.companies = [];
      state.userCompanies = [];
      state.currentCompany = null;
      state.currentUserRole = null;
      state.dataSources = [];
      state.companyTags = [];
      state.companyKeywords = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user companies
      .addCase(fetchUserCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.userCompanies = action.payload;
        // Set first company as current if exists
        if (action.payload.length > 0 && !state.currentCompany) {
          state.currentCompany = action.payload[0].company;
          // Set user role
          state.currentUserRole = companyService.getUserRole(action.payload[0].role_id);
        }
      })
      .addCase(fetchUserCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user companies';
      })
      // Fetch companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch companies';
      })
      // Create company
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies.push(action.payload);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create company';
      })
      // Create user company
      .addCase(createUserCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.userCompanies.push(action.payload);
        state.currentCompany = action.payload.company;
      })
      .addCase(createUserCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create user company';
      })
      // Fetch company data sources
      .addCase(fetchCompanyDataSources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyDataSources.fulfilled, (state, action) => {
        state.loading = false;
        state.dataSources = action.payload;
      })
      .addCase(fetchCompanyDataSources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch data sources';
      })
      // Create data source
      .addCase(createDataSource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDataSource.fulfilled, (state) => {
        state.loading = false;
        // Перезавантажуємо джерела даних після створення
        // Це буде зроблено в компоненті
      })
      .addCase(createDataSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create data source';
      })
      // Delete data source
      .addCase(deleteDataSource.fulfilled, (state, action) => {
        state.dataSources = state.dataSources.map(source => ({
          ...source,
          links: source.links.filter(link => link.id !== action.payload)
        })).filter(source => source.links.length > 0);
      })
      .addCase(deleteDataSource.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete data source';
      })
      // Delete data source group
      .addCase(deleteDataSourceGroup.fulfilled, (state, action) => {
        state.dataSources = state.dataSources.filter(source => 
          !(source.company_id === action.payload.companyId && 
            source.title === action.payload.title && 
            source.type_id === action.payload.typeId)
        );
      })
      .addCase(deleteDataSourceGroup.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete data source group';
      })
      // Fetch company tags
      .addCase(fetchCompanyTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyTags.fulfilled, (state, action) => {
        state.loading = false;
        state.companyTags = action.payload;
      })
      .addCase(fetchCompanyTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch company tags';
      })
      // Create company tag
      .addCase(createCompanyTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompanyTag.fulfilled, (state, action) => {
        state.loading = false;
        state.companyTags.push(action.payload);
      })
      .addCase(createCompanyTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create company tag';
      })
      // Create multiple company tags
      .addCase(createMultipleCompanyTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMultipleCompanyTags.fulfilled, (state, action) => {
        state.loading = false;
        state.companyTags.push(...action.payload);
      })
      .addCase(createMultipleCompanyTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create multiple company tags';
      })
      // Update company tag
      .addCase(updateCompanyTag.fulfilled, (state, action) => {
        const index = state.companyTags.findIndex(tag => tag.id === action.payload.id);
        if (index !== -1) {
          state.companyTags[index] = action.payload;
        }
      })
      .addCase(updateCompanyTag.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update company tag';
      })
      // Delete company tag
      .addCase(deleteCompanyTag.fulfilled, (state, action) => {
        state.companyTags = state.companyTags.filter(tag => tag.id !== action.payload);
      })
      .addCase(deleteCompanyTag.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete company tag';
      })
      // Fetch company keywords
      .addCase(fetchCompanyKeywords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyKeywords.fulfilled, (state, action) => {
        state.loading = false;
        state.companyKeywords = action.payload;
      })
      .addCase(fetchCompanyKeywords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch company keywords';
      })
      // Create company keyword
      .addCase(createCompanyKeyword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompanyKeyword.fulfilled, (state, action) => {
        state.loading = false;
        state.companyKeywords.push(action.payload);
      })
      .addCase(createCompanyKeyword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create company keyword';
      })
      // Create multiple company keywords
      .addCase(createMultipleCompanyKeywords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMultipleCompanyKeywords.fulfilled, (state, action) => {
        state.loading = false;
        state.companyKeywords.push(...action.payload);
      })
      .addCase(createMultipleCompanyKeywords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create multiple company keywords';
      })
      // Update company keyword
      .addCase(updateCompanyKeyword.fulfilled, (state, action) => {
        const index = state.companyKeywords.findIndex(k => k.id === action.payload.id);
        if (index !== -1) {
          state.companyKeywords[index] = action.payload;
        }
      })
      .addCase(updateCompanyKeyword.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update company keyword';
      })
      // Delete company keyword
      .addCase(deleteCompanyKeyword.fulfilled, (state, action) => {
        state.companyKeywords = state.companyKeywords.filter(k => k.id !== action.payload);
      })
      .addCase(deleteCompanyKeyword.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete company keyword';
      })
      // Update company
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
        // Оновлюємо поточну компанію якщо це вона
        if (state.currentCompany?.id === action.payload.id) {
          state.currentCompany = action.payload;
        }
        // Оновлюємо в userCompanies
        state.userCompanies = state.userCompanies.map(uc => 
          uc.company.id === action.payload.id 
            ? { ...uc, company: action.payload }
            : uc
        );
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update company';
      });
  },
});

export const { setCurrentCompany, setCurrentUserRole, clearError, clearCompanyData } = companySlice.actions;
export default companySlice.reducer;
