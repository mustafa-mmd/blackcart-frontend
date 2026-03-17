// src/hooks/useDebounce.ts
import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook that debounces a value.
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup on unmount or when value/delay changes
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook that debounces a callback function.
 * Useful for search inputs, resize events, etc.
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (...args: Parameters<T>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}

/**
 * Custom hook that debounces a value with immediate option.
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @param immediate - Whether to call immediately on first render (default: false)
 * @returns The debounced value
 */
export function useDebounceWithImmediate<T>(
  value: T,
  delay: number = 500,
  immediate: boolean = false
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const [isFirst, setIsFirst] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isFirst && immediate) {
      setDebouncedValue(value)
      setIsFirst(false)
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [value, delay, immediate, isFirst])

  return debouncedValue
}

// Default export for backward compatibility
export default useDebounce