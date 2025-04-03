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
          <div>
            <div
                className="peer group flex items-center justify-between text-sm px-3 py-2 bg-slate-900/50 [&:not(.collapsed)]:bg-slate-900 rounded touch-manipulation collapsed"
                onClick={onCollapse}
            >
              <span className="font-semibold pointer-events-none">Scale</span>
              <em className="text-xs tracking-wide pointer-events-none"><strong>{scaleMaxValue}</strong> – {scaleType === 'both'? 'both ways' : scaleType}</em>
              <Chevron className="group-[:not(.collapsed)]:scale-y-[-1] size-4 stroke-2 pointer-events-none"/>
            </div>

            <div className="hide-able grid-rows-[1fr] peer-[.collapsed]:grid-rows-[0fr] peer-[:not(.collapsed)]:mt-4 peer-[:not(.collapsed)]:mb-1">
              <div className="flex flex-col items-center gap-y-4 font-semibold px-3 touch-manipulation overflow-hidden">
                <div className="self-stretch grid grid-cols-3 gap-x-3 mt-2">
                  <label htmlFor="scale-both" className="h-6 bg-linear-to-r from-red-500 from-20% to-80% to-green-700 rounded outline-offset-2 opacity-50 has-checked:outline has-checked:outline-late-50 has-checked:opacity-100 transition-opacity">
                    <input id="scale-both" name="scale-type" type="radio" className="sr-only" onChange={() => setScaleType('both')} defaultChecked/>
                  </label>

                  <label htmlFor="scale-positive" className="h-6 bg-linear-to-r from-slate-700 to-80% to-green-700 rounded outline-offset-2 opacity-50 has-checked:outline has-checked:outline-late-50 has-checked:opacity-100 transition-opacity">
                    <input id="scale-positive" name="scale-type" type="radio" className="sr-only" onChange={() => setScaleType('positive')}/>
                  </label>

                  <label htmlFor="scale-negative" className="h-6 bg-linear-to-r from-slate-700 to-80% to-red-500 rounded outline-offset-2 opacity-50 has-checked:outline has-checked:outline-late-50 has-checked:opacity-100 transition-opacity">
                    <input id="scale-negative" name="scale-type" type="radio" className="sr-only" onChange={() => setScaleType('negative')}/>
                  </label>
                </div>

                <div className={`h-8 flex justify-between items-center px-3 w-10/12 rounded-md transition-colors duration-300 bg-linear-to-r ${
                  scaleType === 'both' ? 'from-red-500 from-20% to-80% to-green-700'
                    : scaleType === 'positive' ? 'from-slate-700 to-80% to-green-700' : 'from-slate-700 to-80% to-red-500'
                }`}>
                  <span>
                    {scaleType === 'both' ? `-${scaleMaxValue}` : 0}
                  </span>
                  <span>
                    {scaleMaxValue}
                  </span>
                </div>

                <div className="self-stretch grid grid-cols-3 gap-x-3">
                  <label htmlFor="scale-one" className="h-6 grid place-items-center text-xs font-medium rounded opacity-50 bg-slate-700 has-checked:bg-slate-200 has-checked:text-slate-900 has-checked:opacity-100 transition-opacity">
                    <input id="scale-one" name="scale-max" type="radio" className="sr-only" onChange={() => setScaleMaxValue(1)}/>
                    1
                  </label>

                  <label htmlFor="scale-five" className="h-6 grid place-items-center text-xs font-medium rounded opacity-50 bg-slate-700 has-checked:bg-slate-200 has-checked:text-slate-900 has-checked:opacity-100 transition-opacity">
                    <input id="scale-five" name="scale-max" type="radio" className="sr-only" onChange={() => setScaleMaxValue(5)} defaultChecked/>
                    5
                  </label>

                  <label htmlFor="scale-ten" className="h-6 grid place-items-center text-xs font-medium rounded opacity-50 bg-slate-700 has-checked:bg-slate-200 has-checked:text-slate-900 has-checked:opacity-100 transition-opacity">
                    <input id="scale-ten" name="scale-max" type="radio" className="sr-only" onChange={() => setScaleMaxValue(10)}/>
                    10
                  </label>
                </div>
              </div>
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

          <div>
            <div
                className="peer group flex items-center text-sm font-semibold px-3 py-2 bg-slate-900/50 [&:not(.collapsed)]:bg-slate-900 rounded touch-manipulation collapsed"
                onClick={onCollapse}
            >
              <span className="pointer-events-none">Reminders</span>
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