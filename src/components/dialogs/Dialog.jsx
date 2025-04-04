import { useEffect, useRef, useState } from "react"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import { nbsps } from "@/services/utils"
import SimpleButton from "@/components/atoms/SimpleButton"

function Dialog({props, handleConfirm, closeDialog}) {
  const {
    Icon,
    title,
    message,
    Custom,
    input,
    confirmBg,
    confirmColor,
    confirmText,
    cancelText,
    dataCollector,
  } = props

  const dialogEl = useRef(null)
  const dialogInput = useRef(null)

  const [inputValue, setInputValue] = useState("")
  const [customData, setCustomData] = useState(null)

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
    if (dataCollector) {
      setCustomData(dataCollector)
    }
  }, [dataCollector])

  useEffect(() => {
    // to be able to click in dialogs that were for some reason frozen in spacetime
    document.dispatchEvent(new TouchEvent('touchstart'))
  }, [])

  useOutsideClick(closeDialog, dialogEl)

  return (
    <div className="px-6 py-8 w-full max-w-md rounded-lg bg-slate-800 border border-slate-700 text-white flex flex-col gap-6" ref={dialogEl}>
      <div className="relative flex">
        <div className="flex flex-col gap-2">
          {title &&
            <div className="text-xl font-semibold text-pretty max-w-[18ch]">
              {nbsps(title)}
            </div>
          }
          {message &&
            <div className="text-slate-200 text-sm text-balance">
              {message}
            </div>
          }
        </div>
        {Icon &&
          <Icon className={`absolute top-1/2 -translate-y-1/2 right-0 ${message && title ? 'size-19.5' : 'size-11'} stroke-1 text-slate-700 shrink-0`} />
        }
      </div>

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
      {Custom &&
        <Custom />
      }
      <div className="flex gap-4 justify-between mt-2">
        <SimpleButton
          onClick={closeDialog}
          className="dialog-button bg-slate-300 text-black"
        >
          {cancelText ?? 'Cancel'}
        </SimpleButton>

        <SimpleButton
          onClick={() => handleConfirm(customData || (dialogInput.current?.value) || true)}
          disabled={input && !inputValue.replaceAll(" ", "")}
          className={`dialog-button ${confirmBg ?? 'bg-red-500'} ${confirmColor ?? 'text-white disabled:text-red-700'}`.trim()}
        >
          {confirmText ?? 'Yes'}
        </SimpleButton>
      </div>
    </div>
  )
}

export default Dialog