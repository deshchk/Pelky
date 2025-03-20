import { useEffect } from "react"

export function useOutsideClick(callback, ref, deps = null) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(event, {...deps, ref})
      }
    }

    document.addEventListener("mousedown", handleClickOutside, true)
    return () => document.removeEventListener("mousedown", handleClickOutside, true)
  }, [callback, ref, deps])
}