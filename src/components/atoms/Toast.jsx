import { useEffect, useRef } from "react"
import Error from "@/assets/error.svg?react"

function Toast({handleClose, message, time, type}) {
  const progressBar = useRef(null)
  const toastEl = useRef(null)

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        toastEl.current.classList.add("open")
        progressBar.current.classList.add("timeout")
      }, 10)
    }
  }, [message])

  return (message &&
    <div className={`toast ${type} opacity-0 [&.open]:opacity-100 transition-opacity duration-300 pointer-events-auto`} onClick={handleClose} ref={toastEl}>
      <div className="flex gap-3">
        <Error className="size-6" />
        {message}
      </div>
      <div className="toast-progress-container">
        <div className={`toast-progress-bar`.trim()} style={{transition: `translate ${time/1000}s linear`}} ref={progressBar}></div>
      </div>
    </div>
  )
}

export default Toast