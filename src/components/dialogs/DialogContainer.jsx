import { useContext, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { DialogContext } from "@/services/ctxs"
import Shadow from "@/components/layouts/Shadow"
import Dialog from "@/components/dialogs/Dialog"
import NewItemDialog from "@/components/dialogs/NewItemDialog"
import AddNoteDialog from "@/components/dialogs/AddNoteDialog"

function DialogContainer() {
  const dialog = useContext(DialogContext)
  const d = dialog.data

  const dialogContainer = useRef(null)

  useEffect(() => {
    if (d) {
      setTimeout(() => {
        dialogContainer.current && dialogContainer.current.classList.add("open")
      }, 10)
    }
  }, [d])

  return d && createPortal(
    <>
      <Shadow />

      <div className="dialog-container w-screen opacity-0 [&.open]:opacity-100 transition-opacity duration-300" ref={dialogContainer}>
        {d && d.props.type === 'new-item-dialog' ?
          <NewItemDialog props={d.props} handleConfirm={d.handleConfirm} closeDialog={d.closeDialog} key={d.id} />
          : d.props.type === 'add-note-dialog' ?
            <AddNoteDialog props={d.props} handleConfirm={d.handleConfirm} closeDialog={d.closeDialog} key={d.id} />
          : d && <Dialog props={d.props} handleConfirm={d.handleConfirm} closeDialog={d.closeDialog} key={d.id} />
        }
      </div>
    </>
  , document.body)
}

export default DialogContainer