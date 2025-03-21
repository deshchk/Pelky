import { useEffect, useRef } from "react"
import Error from "@/assets/error.svg?react"
import Success from "@/assets/success.svg?react"

function Toast({handleClose, message, type}) {
  const toastEl = useRef(null)

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        toastEl.current.classList.add("open")
      }, 10)
    }
  }, [message])

  return (message &&
    <div className={`small-toast ${type} -translate-y-[200%] [&.open]:translate-y-9 transition-transform duration-300 pointer-events-auto`}
      onClick={handleClose} ref={toastEl}
    >
      {
        type === 'success' ? <Success className="size-4"/>
          : <Error className="size-4"/>
      }
      <span className="text-sm">{message}</span>
    </div>
  )
}

export default Toast