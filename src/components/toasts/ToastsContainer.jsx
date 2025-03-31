import { useContext } from "react"
import { createPortal } from "react-dom"
import { ToastContext } from "@/services/ctxs"
import Toast from "@/components/toasts/Toast"
import SmallToast from "@/components/toasts/SmallToast"

function ToastsContainer() {
  const toast = useContext(ToastContext)

  function closeToast(id) {
    toast.push(toasts => toasts.filter(t => t.id !== id))
  }

  return toast.data.length > 0 && createPortal(
    <div className="fixed z-40 inset-4 bottom-24 sm:bottom-28 pointer-events-none">
      <div className="flex flex-col gap-4 justify-start">
        {toast.data.map((t) => (t.size !== 'small' ?
          <Toast handleClose={closeToast} toast={t} key={t.id} />
         :
          <SmallToast handleClose={closeToast} toast={t} key={t.id} />
        ))}
      </div>
    </div>
  , document.body)
}

export default ToastsContainer