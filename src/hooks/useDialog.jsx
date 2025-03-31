import { useCallback, useEffect, useRef, useState } from "react"
import { newID } from "@/services/utils"

function useDialog (setter, getProps) {
  const [promise, setPromise] = useState(null)
  const id = useRef(newID()).current

  const confirm = () => new Promise((resolve) => {
    setPromise({ resolve })
  })

  const closeDialog = useCallback(() => {
    promise?.resolve(false)
    setPromise(null)
    setter(null)
  }, [promise, setter])

  const handleConfirm = useCallback((value = null) => {
    promise?.resolve(value)
    closeDialog()
  }, [promise, closeDialog])

  useEffect(() => {
    const currentProps = typeof getProps === "function" ? getProps() : getProps

    const dialog = {
      id,
      props: currentProps,
      handleConfirm,
      closeDialog
    }

    promise !== null && setter(prev => prev !== dialog ? dialog : prev)
  }, [closeDialog, handleConfirm, promise, getProps, setter, id])

  return confirm
}

export default useDialog