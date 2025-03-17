import SimpleButton from "./atoms/SimpleButton"
import useDialog from "@/hooks/useDialog"
import { newID } from "@/utils"
import { memo } from "react"
import { getSortedItems, saveItems } from "@/data"

function Nav({items, setItems, setToastData, setDialogData, assessments}) {

  const errorCodes = {
    1: 'Item with this name already exists.'
  }

  function handleError(errorCode) {
    const toastID = newID()
    const toast = {
      id: toastID,
      message: errorCodes[errorCode],
      time: 5000,
      type: 'error',
    }

    setToastData(toasts => toasts.concat([toast]))

    setTimeout(() => {
      setToastData(toasts => toasts.toSpliced(toasts.indexOf(toast), 1))
    }, toast.time)
  }

  const addDialog = useDialog(setDialogData, {
    id: newID(),
    type: 'new-item-dialog',
    items
  })

  async function addItem(){
    const promise = await addDialog()

    if (promise) {
      if (!items.some(item => item.title.replace(/\s/g, "").toLowerCase() === promise.title.replace(/\s/g, "").toLowerCase())) {
        const newItem = {
          id: newID(),
          title: promise.title,
          pinned: false,
          group: null,
          reminderDays: promise.selectedDays,
          status: {
            lastAssessed: false,
            settingReminder: false,
          },
        }

        setItems(prev => getSortedItems(prev.concat([newItem]), assessments))
        saveItems([newItem])
      } else {
        handleError(1)
      }
    }
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-slate-800/80 backdrop-blur z-20">
        <ul className="py-4 px-4 sm:px-8 flex gap-4 justify-between">
          <li>
            <SimpleButton disabled={true}>Filter</SimpleButton>
          </li>
          <li>
            <SimpleButton onClick={addItem}>New item</SimpleButton>
          </li>
        </ul>
      </nav>
    </>
  )
}

export default memo(Nav)