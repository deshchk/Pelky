import { useEffect, useRef, useState } from "react"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import SimpleButton from "@/components/atoms/SimpleButton"
import DaySelector from "@/components/dialogs/insides/DaySelector"
import Chevron from "@/assets/chevron.svg?react"
import Add from "@/assets/add.svg?react"


function NewItemDialog({handleConfirm, closeDialog}) {
  const dialogEl = useRef(null)
  const dialogInput = useRef(null)
  const [scaleMaxValue, setScaleMaxValue] = useState(5)
  const [scaleType, setScaleType] = useState('both')

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
          selectedDays: selectedDays,
          scaleMax: scaleMaxValue,
          scaleType: scaleType
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

  useOutsideClick(closeDialog, dialogEl, null, true)

  return (
      <div className="px-6 py-8 w-full max-w-md rounded-lg bg-slate-800 border border-slate-700 text-white flex flex-col gap-6" ref={dialogEl}>
        <div className="flex items-center gap-4 text-xl font-semibold text-pretty mt-2">
          <Add className="size-10"/>
          Adding new item
        </div>

        <div className="flex flex-col">
          <div className="relative flex items-center gap-2 font-semibold px-3 py-3 bg-slate-900/40 rounded-t touch-manipulation collapsed">
            <div className="flex items-center gap-1 basis-3/11 bg-slate-900 px-1.5 py-0.5 rounded-sm border border-transparent has-focus:border-slate-700">
              <span className="text-sm shrink-0">Max:</span>
              <input
                type="number"
                min="1" max="10"
                value={String(scaleMaxValue)}
                onBeforeInput={e => e.target.value.length === 2 && e.preventDefault()}
                onChange={e => setScaleMaxValue(Number(e.target.value))}
                inputMode="numeric"
                pattern="\d*"
                className="!appearance-none font-normal outline-0 text-center flex-1"
              />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
              <label htmlFor="scale-both" className="py-1 text-center text-slate-50 font-normal bg-slate-700 rounded has-checked:bg-slate-200 has-checked:text-slate-900">
                <input id="scale-both" name="scale-type" type="radio" className="sr-only" onChange={() => setScaleType('both')} defaultChecked/> -{scaleMaxValue} to {scaleMaxValue}
              </label>

              <label htmlFor="scale-positive" className="py-1 text-center text-slate-50 font-normal bg-slate-700 rounded has-checked:bg-slate-200 has-checked:text-slate-900">
                <input id="scale-positive" name="scale-type" type="radio" className="sr-only" onChange={() => setScaleType('positive')} /> 0 to {scaleMaxValue}
              </label>
            </div>
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

          <div className="mt-4">
            <div
              className="peer group flex items-center text-sm font-semibold px-3 py-2 bg-slate-900/50 [&:not(.collapsed)]:bg-slate-900 rounded touch-manipulation collapsed"
              onClick={onCollapse}
            >
              Set reminders
              <Chevron className="group-[:not(.collapsed)]:scale-y-[-1] ml-auto size-4 stroke-2 pointer-events-none"/>
            </div>

            <div className="hide-able grid-rows-[1fr] peer-[.collapsed]:grid-rows-[0fr] peer-[:not(.collapsed)]:mt-6 peer-[:not(.collapsed)]:mb-1">
              <DaySelector
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-between mt-2">
          <SimpleButton
            onClick={closeDialog}
            className="dialog-button bg-slate-300 text-black"
          >
            Cancel
          </SimpleButton>

          <SimpleButton
            onClick={() => handleConfirm({
              title: dialogInput.current.value,
              selectedDays: selectedDays,
              scaleMax: scaleMaxValue,
              scaleType: scaleType
            })}
            disabled={!inputValue.replaceAll(" ", "")}
            className="dialog-button bg-blue-500 disabled:text-blue-700"
          >
            Add
          </SimpleButton>
        </div>
      </div>
  )
}

export default NewItemDialog