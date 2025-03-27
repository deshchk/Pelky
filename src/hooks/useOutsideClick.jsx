import { useEffect } from "react"

export function useOutsideClick(callback, ref, deps = null, parent = false) {
  useEffect(() => {
    function handleClickOutside(event) {
      const el = parent ? ref.current.parentElement : ref.current
      if (el && !el.contains(event.target)) {
        callback(event, {...deps, ref})
      }
    }

    const ac = new AbortController()

    document.addEventListener("mousedown", handleClickOutside, { capture: true, signal: ac.signal })
    document.addEventListener("touchstart", handleClickOutside, { capture: true, signal: ac.signal })
    return () => ac.abort()
  }, [callback, ref, deps, parent])
}