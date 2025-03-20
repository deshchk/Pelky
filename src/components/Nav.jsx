import SimpleButton from "./atoms/SimpleButton"
import useDialog from "@/hooks/useDialog"
import {handleBigToast, newID} from "@/utils"
import { memo } from "react"
import { getSortedItems, saveItems } from "@/data"
import Stars from "@/assets/stars.svg?react"

function Nav({items, setItems, setToastData, setDialogData, assessments}) {

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
        handleBigToast('error', 1, setToastData)
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
          <li className="relative">
            <SimpleButton blue onClick={addItem}>New item</SimpleButton>
            {items.length === 0 && <Stars className="absolute -top-3.5 -left-5 size-8 scale-x-[-1] text-yellow-500" />}
          </li>
        </ul>
      </nav>
    </>
  )
}

export default memo(Nav)