import { create } from 'zustand'

const useUIStore = create((set) => ({
  sidebarOpen: true,
  darkMode: false,
  currentPage: 1,
  searchQuery: '',
  filters: {},

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setDarkMode: (darkMode) => set({ darkMode }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilters: (filters) => set({ filters }),
}))

export default useUIStore
