import { create } from "zustand";

interface PoolState {
  poolAmount: number;
  setPoolAmount: (amount: number) => void;
  fetchPoolAmount: () => Promise<void>;
}

export const usePoolStore = create<PoolState>((set) => ({
  poolAmount: Number(localStorage.getItem("poolAmount")) || 0.0,
  setPoolAmount: (amount) => {
    localStorage.setItem("poolAmount", amount.toString());
    set({ poolAmount: amount });
  },
  fetchPoolAmount: async () => {
    try {
      const storedAmount = Number(localStorage.getItem("poolAmount")) || 0.0;
      set({ poolAmount: storedAmount });
    } catch (error) {
      console.error("풀 데이터를 가져오는 중 오류 발생:", error);
    }
  },
}));
