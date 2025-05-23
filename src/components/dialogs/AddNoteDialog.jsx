import { useEffect, useRef, useState } from "react"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import { nbsps } from "@/services/utils"
import SimpleButton from "@/components/atoms/SimpleButton"
import Pen from "@/assets/pen.svg?react"

function AddNoteDialog({props, handleConfirm, closeDialog}) {
  const {
    item,
    assessment
  } = props

  const dialogEl = useRef(null)
  const dialogInput = useRef(null)

  const [inputValue, setInputValue] = useState("")

  function onInput(){
    setInputValue(dialogInput.current.value)
  }

  function onKeyDown(e) {
    if (dialogInput.current.value.replaceAll(" ", "")) {
      if (e.key === "Enter") {
        handleConfirm(inputValue)
      }
    }
  }

  useEffect(() => {
    dialogInput.current.focus()
  }, [])

  useOutsideClick(closeDialog, dialogEl)

  return (
    <div className="px-6 py-8 w-full max-w-md rounded-lg bg-slate-800 border border-slate-700 text-white flex flex-col gap-6" ref={dialogEl}>
      <div className="relative">
        <span className="block text-xl font-semibold text-balance max-w-[250px]">
          {nbsps(item.title)}
          <span className={`ml-2 px-2.5 py-0.5 rounded ${assessment < 0 ? 'bg-red-900' : item.scale.type === 'negative' && assessment > 0 ? 'bg-red-900' : assessment > 0 ? 'bg-green-900' : 'bg-slate-950/50'}`}>
            {assessment}
          </span>
        </span>
        <Pen className="size-10 absolute top-1/2 -translate-y-1/2 right-0 text-slate-700"/>
      </div>

      <div className="text-slate-200 text-sm">
        You can <em className="text-sky-300 font-medium">add a note</em> to your assessment or <em
          className="text-slate-400 font-medium tracking-wide">cancel</em> and save without it.
      </div>

      <div className="flex flex-col gap-1">
        <textarea
          ref={dialogInput}
          name="note-dialog-input" rows="3" maxLength="280" onInput={onInput} onKeyDown={onKeyDown}
          className="resize-none size-full px-2 py-1.5 bg-slate-900 rounded outline-none"
        >
        </textarea>
        <small className={`self-end font-medium ${inputValue.length === 280 ? 'text-amber-400' : ''}`.trim()}>{inputValue.length}/280</small>
      </div>

      <div className="flex gap-4 justify-between mt-2">
        <SimpleButton
          onClick={closeDialog}
          className="dialog-button bg-slate-300 text-black"
        >
          Cancel
        </SimpleButton>

        <SimpleButton
          onClick={() => handleConfirm(inputValue)}
          disabled={!inputValue.replaceAll(" ", "") || inputValue.length > 280}
          className="dialog-button bg-blue-500 disabled:text-blue-700"
        >
          Add note
        </SimpleButton>
      </div>
    </div>
  )
}

export default AddNoteDialog