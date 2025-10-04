import type { UserData } from '@/types';

const USER_DATA_KEY = 'branddefender_user_data';

export const saveUserData = (data: UserData): void => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
};

export const getUserData = (): UserData | null => {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearUserData = (): void => {
  localStorage.removeItem(USER_DATA_KEY);
};

export const isUserOnboarded = (): boolean => {
  const data = getUserData();
  return data?.isOnboarded ?? false;
};

export const updateSaasPoints = (points: number): void => {
  const data = getUserData();
  if (data) {
    data.brand.saasPoints = points;
    saveUserData(data);
  }
};

export const updateBrandFilters = (
  brandName: string,
  keywords: string[],
  sources: string[]
): void => {
  const data = getUserData();
  if (data) {
    data.brand.brandName = brandName;
    data.brand.keywords = keywords;
    data.brand.sources = sources;
    saveUserData(data);
  }
};

export const updateUserProfile = (userId: string, name: string, email: string): void => {
  const data = getUserData();
  if (data) {
    data.user = {
      id: userId,
      name,
      email,
    };
    saveUserData(data);
  }
};

export const getBrandFilters = () => {
  const data = getUserData();
  if (data?.brand) {
    return {
      brandName: data.brand.brandName,
      keywords: data.brand.keywords,
      sources: data.brand.sources,
    };
  }
  return null;
};
