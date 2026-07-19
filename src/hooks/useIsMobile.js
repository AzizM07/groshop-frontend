// src/hooks/useIsMobile.js
import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint - 1}px)`
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return isMobile
}