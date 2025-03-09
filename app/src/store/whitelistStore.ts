import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LucideIcon } from "lucide-react";

export interface WhitelistMemberItem {
  title: string; // Member1, Member2 등
  subTitle: string; // 지갑 주소
  url: string; // 링크 경로
}
export interface WhitelistItem {
  title: string; // Whitelist1, Whitelist2 등
  url: string; // PDA 주소
  iconName: string; // 아이콘 컴포넌트
  isActive: boolean; // 활성화 상태
  items: WhitelistMemberItem[]; // 멤버 목록
}

interface WhitelistState {
  // 전체 화이트리스트 목록
  whitelists: WhitelistItem[];
  // 현재 선택된 화이트리스트
  selectedWhitelist: WhitelistItem | null;

  hydrated: boolean;

  // 액션
  setWhitelists: (whitelists: WhitelistItem[]) => void;
  addWhitelist: (whitelist: WhitelistItem) => void;
  selectWhitelist: (title: string | null) => void;

  // API 연동 (필요시)
  fetchWhitelists: () => Promise<void>;
}

export const useWhitelistStore = create(
  persist<WhitelistState>(
    (set, get) => ({
      whitelists: [],
      selectedWhitelist: null,
      hydrated: false,

      setWhitelists: (whitelists) => set({ whitelists }),

      addWhitelist: (whitelist) =>
        set((state) => {
          console.log("현재 화이트리스트:", state.whitelists);
          console.log("추가할 화이트리스트:", whitelist);
          return { whitelists: [...state.whitelists, whitelist] };
        }),

      selectWhitelist: (title) =>
        set((state) => ({
          selectedWhitelist:
            title === null
              ? null
              : state.whitelists.find((item) => item.title === title) || null,
        })),

      fetchWhitelists: async () => {
        try {
          if (get().hydrated && get().whitelists.length > 0) {
            console.log("이미 데이터가 로드되어 있습니다:", get().whitelists);
            return;
          }

          const dummyData: WhitelistItem[] = [];
          set({ whitelists: dummyData, hydrated: true });
          console.log("데이터 로드 완료:", dummyData);
        } catch (error) {
          console.error("화이트리스트를 가져오는 중 오류 발생:", error);
        }
      },
    }),
    {
      name: "whitelist-storage", // localStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // localStorage 사용
      onRehydrateStorage: (state) => {
        // 복원 시작 시 로그
        console.log("화이트리스트 스토어 복원 시작...");

        return (restoredState, error) => {
          if (error) {
            console.error("화이트리스트 복원 오류:", error);
          } else {
            console.log("화이트리스트 복원 완료:", restoredState);
            // 복원 완료 후 hydrated 플래그 설정
            useWhitelistStore.setState({ hydrated: true });
          }
        };
      },
    }
  )
);
