import { create } from 'zustand'

const useAuthStore = create((set) => ({
  admin: JSON.parse(sessionStorage.getItem('admin') || 'null'),
  token: sessionStorage.getItem('authToken') || null,
  isLoading: false,

  setAdmin: (admin, token) => {
    sessionStorage.setItem('admin', JSON.stringify(admin))
    sessionStorage.setItem('authToken', token)
    set({ admin, token })
  },

  logout: () => {
    sessionStorage.removeItem('admin')
    sessionStorage.removeItem('authToken')
    set({ admin: null, token: null })
  },

  setLoading: (isLoading) => set({ isLoading }),
}))

export default useAuthStore
