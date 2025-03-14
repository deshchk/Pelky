import Toast from "@/components/atoms/Toast"
import SmallToast from "@/components/atoms/SmallToast"
import { ToastContext } from "@/ctxs"
import { useContext } from "react"

function ToastsContainer() {
  const toast = useContext(ToastContext)

  function closeToast() {
    toast.push(toasts => toasts.splice(toasts.indexOf(toast), 1))
  }

  return (
    <div className="fixed z-40 inset-4 bottom-24 sm:bottom-28 pointer-events-none">
      <div className="flex flex-col gap-4 justify-start">
        {toast.data &&
          toast.data.map((toast) => (toast.size !== 'small' ?
            <Toast handleClose={closeToast} message={toast.message} time={toast.time} type={toast.type} key={toast.id} />
           :
            <SmallToast handleClose={closeToast} message={toast.message} type={toast.type} key={toast.id} />
          ))
        }
      </div>
    </div>
  )
}

export default ToastsContainer