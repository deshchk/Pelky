import { useState } from "react"
import { getSortedItems } from "@/data"
import { deleteItem, pinItem } from "@/components/tracker/itemActions"
import { firstUpper } from "@/utils"
import useDialog from "@/hooks/useDialog"
import DaySelector from "@/components/atoms/DaySelector"
import Pin from "@/assets/pin.svg?react"
import Clock from "@/assets/clock.svg?react"
import List from "@/assets/list.svg?react"
import Trash from "@/assets/trash.svg?react"

export default function ItemAction({action, item, setters, assessments}) {
  const {
    setItems,
    setDialogData
  } = setters

  const [selectedDays, setSelectedDays] = useState(item.reminderDays)


  const reminderDialog = useDialog(setDialogData,{
    Icon: Clock,
    title: firstUpper(item.title),
    message: 'On which days would you like to be reminded about this?',
    confirmText: 'Save',
    confirmBg: 'bg-blue-500',
    dataCollector: () => selectedDays,
    Custom: () => <DaySelector selectedDays={selectedDays} setSelectedDays={setSelectedDays} />
  })

  async function setReminder() {
    const promise = await reminderDialog()

    if (promise) {
      setItems(prev => getSortedItems(prev.map(i => i.id === item.id ? {...i, reminderDays: promise} : {...i}), assessments))
    } else {
      setSelectedDays(item.reminderDays)
    }
  }

  const deleteDialog = useDialog(setDialogData,{
    Icon: Trash,
    title: `Deleting "${item.title}"`,
    message: 'This item and it\'s data will be deleted. Delete anyway?'
  })

  function onClick() {
    action === 'pin' ?
        pinItem(item, assessments, setItems)
    : action === 'reminder' ?
        setReminder()
    : action === 'delete' ?
        deleteItem(item, assessments, setItems, deleteDialog)
    : action === 'details' ?
        console.log('details')
    : console.log('unknown action')
  }

  function actionBody() {
    return action === 'pin' ?
        <Pin className="size-7" />
    : action === 'reminder' ?
        <Clock className="size-7" />
    : action === 'delete' ?
        <Trash className="size-7.5" />
    : action === 'details' ?
        <List className="size-7" />
    : <>action</>
  }

  return (
    <button
      className="grid h-full w-14 place-items-center overflow-hidden"
      onClick={onClick}
    >
      {actionBody()}
    </button>
  )
}