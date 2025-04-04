import { useEffect, useRef } from "react"
import Error from "@/assets/error.svg?react"
import Success from "@/assets/success.svg?react"

function Toast({handleClose, toast}) {
  const toastEl = useRef(null)

  useEffect(() => {
    if (toast.message) {
      setTimeout(() => {
        toastEl.current.classList.add("open")
      }, 10)
    }
  }, [toast.message])

  return (toast.message &&
    <div className={`small-toast ${toast.type} -translate-y-[200%] [&.open]:translate-y-0 transition-transform duration-300 pointer-events-auto`}
      onClick={() => handleClose(toast.id)} ref={toastEl}
    >
      {
        toast.type === 'success' ? <Success className="size-4"/>
          : <Error className="size-4"/>
      }
      <span className="text-sm">{toast.message}</span>
    </div>
  )
}

export default Toast