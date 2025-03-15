import SimpleButton from "./atoms/SimpleButton"
import useDialog from "@/hooks/useDialog"
import Add from "@/assets/add.svg?react"
import { newID } from "@/utils"
import { memo } from "react"

function Nav({items, setItems, setToastData, setDialogData}) {

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

  const confirmAdd = useDialog(setDialogData, {
    id: newID(),
    Icon: Add,
    title: `Adding new item`,
    confirmText: 'Add',
    confirmBg: 'bg-blue-500',
    confirmColor: 'disabled:text-blue-700',
    input: {
      name: 'item-name',
      placeholder: 'Item\'s name'
    },
    items
  })

  async function addItem(){
    const promise = await confirmAdd()

    if (promise) {
      if (!items.some(item => item.title.replace(/\s/g, "").toLowerCase() === promise.replace(/\s/g, "").toLowerCase())) {
        setItems(prev => {
          return prev.concat([{
            id: newID(),
            title: promise,
            priority: 'mid'
          }])
        })
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