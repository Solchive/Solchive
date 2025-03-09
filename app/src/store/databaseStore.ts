import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 데이터베이스 아이템 타입
export interface DatabaseItem {
  title: string; // Data1, Data2 등
  url: string; // 링크 경로
}

// 데이터베이스 타입
export interface DatabaseGroup {
  title: string; // Whitelist1 등
  url: string; // 기본 URL
  iconName: string; // 아이콘 컴포넌트
  isActive: boolean; // 활성화 상태
  items: DatabaseItem[]; // 데이터 아이템 목록
}

interface DatabaseState {
  // 전체 데이터베이스 그룹 목록
  databases: DatabaseGroup[];
  // 현재 선택된 데이터베이스 그룹
  selectedDatabase: DatabaseGroup | null;
  // 현재 선택된 데이터베이스 아이템
  selectedItem: DatabaseItem | null;

  hydrated: boolean;

  // 액션
  setDatabases: (databases: DatabaseGroup[]) => void;
  addDatabase: (database: DatabaseGroup) => void;
  addDatabaseItem: (databaseTitle: string, item: DatabaseItem) => void;

  removeDatabase: (title: string) => void;
  removeDatabaseItem: (databaseTitle: string, itemTitle: string) => void;

  selectDatabase: (title: string | null) => void;
  selectItem: (databaseTitle: string, itemTitle: string | null) => void;

  // API 연동
  fetchDatabases: () => Promise<void>;
}

export const useDatabaseStore = create<DatabaseState>()(
  persist<DatabaseState>(
    (set, get) => ({
      databases: [],
      selectedDatabase: null,
      selectedItem: null,
      hydrated: false,

      setDatabases: (databases) => set({ databases }),

      addDatabase: (database) =>
        set((state) => {
          console.log("현재 화이트리스트:", state.databases);
          console.log("추가할 화이트리스트:", database);
          return { databases: [...state.databases, database] };
        }),

      addDatabaseItem: (databaseTitle, item) =>
        set((state) => {
          const updatedDatabases = state.databases.map((database) => {
            if (database.title === databaseTitle) {
              return {
                ...database,
                items: [...database.items, item],
              };
            }
            return database;
          });

          console.log(`${databaseTitle}에 새 아이템 추가:`, item);
          return { databases: updatedDatabases };
        }),

      removeDatabase: (title) =>
        set((state) => ({
          databases: state.databases.filter((item) => item.title !== title),
          // 선택된 항목이 제거되면 선택 해제
          selectedDatabase:
            state.selectedDatabase?.title === title
              ? null
              : state.selectedDatabase,
          // 관련 아이템도 선택 해제
          selectedItem:
            state.selectedDatabase?.title === title ? null : state.selectedItem,
        })),

      removeDatabaseItem: (databaseTitle, itemTitle) =>
        set((state) => {
          const updatedDatabases = state.databases.map((database) => {
            if (database.title === databaseTitle) {
              return {
                ...database,
                items: database.items.filter(
                  (item) => item.title !== itemTitle
                ),
              };
            }
            return database;
          });

          // 삭제된 아이템이 현재 선택된 아이템인 경우 선택 해제
          const shouldResetSelectedItem =
            state.selectedDatabase?.title === databaseTitle &&
            state.selectedItem?.title === itemTitle;

          console.log(`${databaseTitle}에서 아이템 삭제:`, itemTitle);

          return {
            databases: updatedDatabases,
            selectedItem: shouldResetSelectedItem ? null : state.selectedItem,
          };
        }),

      selectDatabase: (title) =>
        set((state) => ({
          selectedDatabase:
            title === null
              ? null
              : state.databases.find((item) => item.title === title) || null,
          // 데이터베이스가 변경되면 아이템 선택 해제
          selectedItem: null,
        })),

      selectItem: (databaseTitle, itemTitle) =>
        set((state) => {
          const database = state.databases.find(
            (db) => db.title === databaseTitle
          );
          if (!database) return { selectedItem: null };

          if (itemTitle === null) return { selectedItem: null };

          const item = database.items.find((item) => item.title === itemTitle);
          return { selectedItem: item || null };
        }),

      fetchDatabases: async () => {
        try {
          if (get().hydrated && get().databases.length > 0) {
            console.log("이미 데이터가 로드되어 있습니다:", get().databases);
            return;
          }

          const dummyData: DatabaseGroup[] = [];
          set({ databases: dummyData, hydrated: true });
          console.log("데이터 로드 완료:", dummyData);
        } catch (error) {
          console.error("화이트리스트를 가져오는 중 오류 발생:", error);
        }
      },
    }),
    {
      name: "database-storage", // 로컬 스토리지 키 이름
      storage: createJSONStorage(() => localStorage), // 스토리지 타입 지정
      onRehydrateStorage: (state) => {
        // 복원 시작 시 로그
        console.log("데이터베이스 스토어 복원 시작...");

        return (restoredState, error) => {
          if (error) {
            console.error("데이터베이스 복원 오류:", error);
          } else {
            console.log("데이터베이스 복원 완료:", restoredState);
            // 복원 완료 후 hydrated 플래그 설정
            useDatabaseStore.setState({ hydrated: true });
          }
        };
      },
    }
  )
);
