import { useEffect } from "react"

export function useIntersectionObserver(callback, ref, deps = null) {
  useEffect(() => {
    const el = ref.current

    const intersectionObserver = new IntersectionObserver((entries) => {
      callback(entries[0], {...deps, ref})
    })
    intersectionObserver.observe(el)

    return () => intersectionObserver.unobserve(el)
  }, [callback, ref, deps])
}