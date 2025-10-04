import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import supabase from '@/utils/supabase';
import type { Company, UserCompanyWithCompany, CompanyState, UserRole } from '@/types';
import { companyService } from '@/utils/companyService';

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

const initialState: CompanyState = {
  companies: [],
  userCompanies: [],
  currentCompany: null,
  currentUserRole: null,
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
      });
  },
});

export const { setCurrentCompany, setCurrentUserRole, clearError, clearCompanyData } = companySlice.actions;
export default companySlice.reducer;
