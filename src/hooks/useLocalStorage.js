import { useCallback } from 'react'

export const useLocalStorage = (key, initialValue) => {
  const getValue = useCallback(() => {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading from sessionStorage:', error)
      return initialValue
    }
  }, [key, initialValue])

  const setValue = useCallback((value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to sessionStorage:', error)
    }
  }, [key])

  return [getValue(), setValue]
}

export default useLocalStorage
