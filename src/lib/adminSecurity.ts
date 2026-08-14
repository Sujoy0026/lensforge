'use client';

// ADMIN SECURITY CONFIGURATION
const ADMIN_PASS_STORAGE_KEY = 'lensforge_admin_secret_pass_v1';
const ADMIN_SESSION_TOKEN_KEY = 'lensforge_admin_unlocked_session_v1';

// Default initial master secret passcode
const DEFAULT_MASTER_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'lensforge2026';

export const getStoredAdminPasscode = (): string => {
  if (typeof window === 'undefined') return DEFAULT_MASTER_SECRET;
  return localStorage.getItem(ADMIN_PASS_STORAGE_KEY) || DEFAULT_MASTER_SECRET;
};

export const verifyAdminPasscode = (inputPasscode: string): { success: boolean; error?: string } => {
  if (!inputPasscode || inputPasscode.trim().length === 0) {
    return { success: false, error: 'Please enter the Admin Secret Passcode.' };
  }

  const validPasscode = getStoredAdminPasscode();
  if (inputPasscode.trim() === validPasscode) {
    if (typeof window !== 'undefined') {
      const token = `admin_auth_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem(ADMIN_SESSION_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_SESSION_TOKEN_KEY, token);
    }
    return { success: true };
  }

  return { success: false, error: 'Access Denied: Incorrect Secret Passcode. Unauthorized access is monitored.' };
};

export const isAdminSessionUnlocked = (): boolean => {
  if (typeof window === 'undefined') return false;
  const sessionToken = sessionStorage.getItem(ADMIN_SESSION_TOKEN_KEY) || localStorage.getItem(ADMIN_SESSION_TOKEN_KEY);
  return Boolean(sessionToken && sessionToken.startsWith('admin_auth_'));
};

export const lockAdminSession = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_SESSION_TOKEN_KEY);
    localStorage.removeItem(ADMIN_SESSION_TOKEN_KEY);
  }
};

export const updateAdminPasscode = (currentPass: string, newPass: string): { success: boolean; error?: string } => {
  const validPasscode = getStoredAdminPasscode();
  if (currentPass !== validPasscode) {
    return { success: false, error: 'Current Secret Passcode does not match.' };
  }

  if (!newPass || newPass.trim().length < 6) {
    return { success: false, error: 'New Secret Passcode must be at least 6 characters long.' };
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_PASS_STORAGE_KEY, newPass.trim());
  }
  return { success: true };
};
