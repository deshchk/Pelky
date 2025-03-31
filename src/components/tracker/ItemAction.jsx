import Pin from "@/assets/pin.svg?react"
import Clock from "@/assets/clock.svg?react"
import List from "@/assets/list.svg?react"
import Trash from "@/assets/trash.svg?react"
import Pen from "@/assets/pen.svg?react"

export default function ItemAction({type, action}) {

  function actionBody() {
    return type === 'pin' ?
        <Pin className="size-7" />
    : type === 'reminder' ?
        <Clock className="size-7" />
    : type === 'delete' ?
        <Trash className="size-7.5" />
    : type === 'details' ?
        <List className="size-7" />
    : type === 'edit' ?
        <Pen className="size-6" />
    : <>action</>
  }

  return (
    <button
      className="grid h-full w-18 place-items-center overflow-hidden"
      onClick={action ? action : () => console.log(type)}
    >
      {actionBody()}
    </button>
  )
}