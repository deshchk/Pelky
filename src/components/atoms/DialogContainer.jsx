import { DialogContext } from "@/ctxs"
import { useContext, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Shadow from "@/components/atoms/Shadow"
import Dialog from "@/components/atoms/Dialog"

function DialogContainer() {
  const dialog = useContext(DialogContext)
  const d = dialog.data

  const dialogContainer = useRef(null)

  useEffect(() => {
    if (d) {
      setTimeout(() => {
        dialogContainer.current.classList.add("open")
      }, 10)
    }
  }, [d])

  return d && createPortal(
    <>
      <Shadow />

      <div className="dialog-container opacity-0 [&.open]:opacity-100 transition-opacity duration-300" ref={dialogContainer}>
        {d &&
          <Dialog props={d.props} handleConfirm={d.handleConfirm} closeDialog={d.closeDialog} key={d.id} />
        }
      </div>
    </>
  , document.body)
}

export default DialogContainer