import Shadow from "@/components/atoms/Shadow"
import SimpleButton from "@/components/atoms/SimpleButton"
import { useEffect, useRef, useState } from "react"
import { nbsps } from "@/utils"
import { useOutsideClick } from "@/hooks/useOutsideClick"

function Dialog({props, handleConfirm, closeDialog}) {
  const {
    Icon,
    title,
    message,
    input,
    confirmBg,
    confirmColor,
    confirmText,
    cancelText
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
        handleConfirm(dialogInput.current.value)
      }
    }
  }

  useEffect(() => {
    dialogInput.current && dialogInput.current.focus()
  }, [])

  useOutsideClick(closeDialog, dialogEl)

  return (
    <div className="px-6 py-8 w-full rounded-lg bg-slate-800 border border-slate-700 text-white flex flex-col gap-6" ref={dialogEl}>
      {Icon &&
        <Icon className="size-10"/>
      }
      {title &&
        <div className="text-xl font-semibold">
          {nbsps(title)}
        </div>
      }
      {message &&
        <div className="text-slate-200">
          {message}
        </div>
      }
      {input &&
        <input
          className="dialog-input"
          type="text" placeholder={input.placeholder}
          name={input.name}
          aria-label={input.placeholder}
          autoComplete="off"
          onInput={onInput}
          onKeyDown={onKeyDown}
          value={inputValue}
          ref={dialogInput}
        />
      }
      <div className="flex gap-4 justify-between mt-2">
        <SimpleButton
          onClick={() => handleConfirm(dialogInput.current ? dialogInput.current.value : true)}
          disabled={input && !inputValue.replaceAll(" ", "")}
          className={`dialog-button ${confirmBg ?? 'bg-red-500'} ${confirmColor ?? 'text-white disabled:text-red-700'}`.trim()}
        >
          {confirmText ?? 'Yes'}
        </SimpleButton>

        <SimpleButton
          onClick={closeDialog}
          className="dialog-button bg-slate-300 text-black"
        >
          {cancelText ?? 'Cancel'}
        </SimpleButton>
      </div>
    </div>
  )
}

export default Dialog