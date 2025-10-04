import type { UserData, SourceLink } from '@/types';

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
  sources: string[],
  sourceLinks?: SourceLink[]
): void => {
  const data = getUserData();
  if (data) {
    data.brand.brandName = brandName;
    data.brand.keywords = keywords;
    data.brand.sources = sources;
    if (sourceLinks) {
      data.brand.sourceLinks = sourceLinks;
    }
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
      sourceLinks: data.brand.sourceLinks || [],
    };
  }
  return null;
};

export const updateSourceLink = (sourceName: string, url: string): void => {
  const data = getUserData();
  if (data) {
    if (!data.brand.sourceLinks) {
      data.brand.sourceLinks = [];
    }
    
    const existingIndex = data.brand.sourceLinks.findIndex(link => link.name === sourceName);
    if (existingIndex >= 0) {
      data.brand.sourceLinks[existingIndex].url = url;
    } else {
      data.brand.sourceLinks.push({ name: sourceName, url });
    }
    
    saveUserData(data);
  }
};

export const removeSourceLink = (sourceName: string): void => {
  const data = getUserData();
  if (data && data.brand.sourceLinks) {
    data.brand.sourceLinks = data.brand.sourceLinks.filter(link => link.name !== sourceName);
    saveUserData(data);
  }
};

export const getSourceLink = (sourceName: string): string | null => {
  const data = getUserData();
  if (data?.brand?.sourceLinks) {
    const link = data.brand.sourceLinks.find(link => link.name === sourceName);
    return link ? link.url : null;
  }
  return null;
};
