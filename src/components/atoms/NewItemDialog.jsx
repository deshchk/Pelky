import SimpleButton from "@/components/atoms/SimpleButton"
import { useEffect, useRef, useState } from "react"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import Chevron from "@/assets/chevron.svg?react"
import Add from "@/assets/add.svg?react"
import DaySelector from "@/components/atoms/DaySelector"

function NewItemDialog({handleConfirm, closeDialog}) {
  const dialogEl = useRef(null)
  const dialogInput = useRef(null)

  const [inputValue, setInputValue] = useState("")
  const [selectedDays, setSelectedDays] = useState([])

  function onInput(){
    setInputValue(dialogInput.current.value)
  }

  function onKeyDown(e) {
    if (dialogInput.current.value.replaceAll(" ", "")) {
      if (e.key === "Enter") {
        handleConfirm({
          title: dialogInput.current.value,
          selectedDays: selectedDays
        })
      }
    }
  }

  function onCollapse(e) {
    e.target.classList.toggle('collapsed')
  }

  useEffect(() => {
    dialogInput.current.focus()
  }, [])

  useOutsideClick(closeDialog, dialogEl)

  return (
      <div className="px-6 py-8 w-full max-w-md rounded-lg bg-slate-800 border border-slate-700 text-white flex flex-col gap-6" ref={dialogEl}>
        <Add className="size-10"/>
        <div className="text-xl font-semibold text-pretty mt-2">
          Adding new item
        </div>

        <input
          className="dialog-input"
          type="text" placeholder="Item's name"
          name="item-name"
          aria-label="Item's name"
          autoComplete="off"
          onInput={onInput}
          onKeyDown={onKeyDown}
          value={inputValue}
          ref={dialogInput}
        />

        <div>
          <div className="peer group flex items-center text-sm font-semibold px-3 py-2 bg-slate-900/50 rounded touch-manipulation collapsed"
            onClick={onCollapse}
          >
            Set reminders
            <Chevron className="group-[:not(.collapsed)]:scale-y-[-1] ml-auto size-4 stroke-2 pointer-events-none" />
          </div>

          <div className="hide-able grid-rows-[1fr] peer-[.collapsed]:grid-rows-[0fr] peer-[:not(.collapsed)]:mt-6 peer-[:not(.collapsed)]:mb-1">
            <DaySelector
              selectedDays={selectedDays}
              setSelectedDays={setSelectedDays}
            />
          </div>
        </div>

        <div className="flex gap-4 justify-between mt-2">
          <SimpleButton
            onClick={() => handleConfirm({
              title: dialogInput.current.value,
              selectedDays: selectedDays
            })}
            disabled={!inputValue.replaceAll(" ", "")}
            className="dialog-button bg-blue-500 disabled:text-blue-700"
          >
            Add
          </SimpleButton>

          <SimpleButton
            onClick={closeDialog}
            className="dialog-button bg-slate-300 text-black"
          >
            Cancel
          </SimpleButton>
        </div>
      </div>
  )
}

export default NewItemDialog