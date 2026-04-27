import { useEffect } from 'react'

export function useKeyboard(handlers) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't fire shortcuts when typing in inputs
      const tag = document.activeElement?.tagName?.toLowerCase()
      const isTyping = tag === 'input' || 
                       tag === 'textarea' || 
                       tag === 'select'

      if (handlers.onEscape && e.key === 'Escape') {
        handlers.onEscape()
      }

      if (!isTyping) {
        if (handlers.onSlash && e.key === '/') {
          e.preventDefault()
          handlers.onSlash()
        }
        if (handlers.onArrowLeft && e.key === 'ArrowLeft') {
          e.preventDefault()
          handlers.onArrowLeft()
        }
        if (handlers.onArrowRight && e.key === 'ArrowRight') {
          e.preventDefault()
          handlers.onArrowRight()
        }
        if (handlers.onArrowUp && e.key === 'ArrowUp') {
          e.preventDefault()
          handlers.onArrowUp()
        }
        if (handlers.onArrowDown && e.key === 'ArrowDown') {
          e.preventDefault()
          handlers.onArrowDown()
        }
        if (handlers.onN && e.key === 'n') {
          handlers.onN()
        }
        if (handlers.onH && e.key === 'h') {
          handlers.onH()
        }
        if (handlers.onD && e.key === 'd') {
          handlers.onD()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}