import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  username: string;
  setUsername: (username: string) => void;
  clearUsername: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      username: '',
      setUsername: (username) => set({ username }),
      clearUsername: () => set({ username: '' }),
    }),
    { name: 'roomtalk-user' },
  ),
);
