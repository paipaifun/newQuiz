import { useEffect, useRef, useState } from 'react'

interface Props {
  onVisible?: () => void
  onHide?: () => void
  once?: boolean
}

export const useIntersectionObserver = ({ onVisible, onHide, once = false }: Props = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const observerRef = useRef(null)
  const observerInstance = useRef<IntersectionObserver | null>(null)
  const hasIntersected = useRef(false)
  const cancel = () => {
    if (observerRef.current && observerInstance.current) {
      observerInstance.current.unobserve(observerRef.current)
    }
  }

  useEffect(() => {
    observerInstance.current = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    })

    if (observerRef.current) {
      observerInstance.current.observe(observerRef.current)
    }

    return () => {
      cancel()
    }
  }, [])

  useEffect(() => {
    if (isIntersecting) {
      if (once && hasIntersected.current) {
        cancel()
        return
      }
      onVisible?.()
      hasIntersected.current = true
    } else {
      onHide?.()
    }
  })

  return [observerRef, isIntersecting]
}
