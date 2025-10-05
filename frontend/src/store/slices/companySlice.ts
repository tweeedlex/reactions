import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import supabase from '@/utils/supabase';
import type { Company, UserCompanyWithCompany, CompanyState, UserRole, DataSourceWithLinks } from '@/types';
import { companyService } from '@/utils/companyService';
import { dataSourceService } from '@/utils/dataSourceService';

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

const initialState: CompanyState = {
  companies: [],
  userCompanies: [],
  currentCompany: null,
  currentUserRole: null,
  dataSources: [],
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
      });
  },
});

export const { setCurrentCompany, setCurrentUserRole, clearError, clearCompanyData } = companySlice.actions;
export default companySlice.reducer;
