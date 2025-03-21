import SimpleButton from "@/components/atoms/SimpleButton"
import { useEffect, useRef, useState } from "react"
import { nbsps } from "@/utils"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import Chevron from "@/assets/chevron.svg?react"

function Dialog({props, handleConfirm, closeDialog}) {
  const {
    Icon,
    title,
    message,
    customCollapsable,
    customTitle,
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

  useOutsideClick(closeDialog, dialogEl)

  return (
    <div className="px-6 py-8 w-full max-w-md rounded-lg bg-slate-800 border border-slate-700 text-white flex flex-col gap-6" ref={dialogEl}>
      {Icon &&
        <Icon className="size-10"/>
      }
      {title &&
        <div className="text-xl font-semibold text-pretty mt-2">
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
      {Custom &&
        <div>
          {customCollapsable && (
            <div className={`
                peer group flex items-center text-sm font-semibold px-3 py-2 bg-slate-900/50 rounded touch-manipulation
              `.trim()}
            >
              {customTitle && customTitle}
              <Chevron className="group-[:not(.collapsed)]:scale-y-[-1] ml-auto size-4 stroke-2 pointer-events-none" />
            </div>
          )}
          <div className={customCollapsable ? 'hide-able grid-rows-[1fr] peer-[.collapsed]:grid-rows-[0fr] peer-[:not(.collapsed)]:mt-6 peer-[:not(.collapsed)]:mb-1' : ''}>
            <Custom />
          </div>
        </div>
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