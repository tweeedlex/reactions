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
