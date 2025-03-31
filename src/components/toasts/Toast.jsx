import { useEffect, useRef } from "react"
import Error from "@/assets/error.svg?react"

function Toast({handleClose, toast}) {

  const progressBar = useRef(null)
  const toastEl = useRef(null)

  useEffect(() => {
    if (toast.message) {
      setTimeout(() => {
        toastEl.current.classList.add("open")
        progressBar.current.classList.add("timeout")
      }, 10)
    }
  }, [toast.message])

  return (toast.message &&
    <div className={`toast ${toast.type} opacity-0 [&.open]:opacity-100 transition-opacity duration-300 pointer-events-auto`} onClick={() => handleClose(toast.id)} ref={toastEl}>
      <div className="flex gap-3">
        <Error className="size-6" />
        {toast.message}
      </div>
      <div className="toast-progress-container">
        <div className={`toast-progress-bar`.trim()} style={{transition: `translate ${toast.time/1000}s linear`}} ref={progressBar}></div>
      </div>
    </div>
  )
}

export default Toast