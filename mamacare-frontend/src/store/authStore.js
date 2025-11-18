import { create } from 'zustand';

const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'mamacare_user';

const readInitialToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

const readInitialUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialToken = readInitialToken();
const initialUser = readInitialUser();

const useAuthStore = create((set, get) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  setUser: (userData, authToken) => {
    const tokenToPersist = authToken ?? get().token ?? null;

    if (typeof window !== 'undefined') {
      if (tokenToPersist) {
        localStorage.setItem(TOKEN_STORAGE_KEY, tokenToPersist);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }

      if (userData) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    set({
      user: userData ?? null,
      token: tokenToPersist,
      isAuthenticated: Boolean(tokenToPersist),
    });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
