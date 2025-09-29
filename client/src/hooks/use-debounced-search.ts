import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

interface UseDebouncedSearchOptions {
  debounceDelay?: number
}

interface UseDebouncedSearchReturn {
  search: string
  debouncedSearchTerm: string
  setSearch: (value: string) => void
}

/**
 * Simplified debounced search hook
 * 
 * @param options Configuration options for the hook
 * @returns Search state and handlers
 */
export function useDebouncedSearch(
  options: UseDebouncedSearchOptions = {}
): UseDebouncedSearchReturn {
  const { debounceDelay = 300 } = options
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(
    searchParams.get('search') || ''
  )
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(search)
    }, debounceDelay)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [search, debounceDelay])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return {
    search,
    debouncedSearchTerm,
    setSearch
  }
}
