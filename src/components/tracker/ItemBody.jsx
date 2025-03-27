import { useRef } from "react"
import { getSortedItems } from "@/data"
import { formatWhenDate, getLastPastAssDiff, handleBigToast, handleSmallToast, isItToday, nbsps, todayNum } from "@/utils"
import PinFill from "@/assets/pin-fill.svg?react"
import ClockFill from "@/assets/clock-fill.svg?react"

export default function ItemBody({item, items, setters, assessments}) {
  const {
    setItems,
    setToastData
  } = setters

  const nameChangeEl = useRef(null)
  const changingName = useRef(false)

  function onNameChangeFocus(e) {
    e.target.classList.add('active')
  }

  function onNameChangeInput() {
    changingName.current = true
  }

  function onNameChangeKeyPress(e) {
    if (changingName.current && e.key === 'Enter') {
      e.preventDefault()
      e.target.blur()
    }
  }

  function handleItemNameCheck() {
    if (item.title.trim() !== nameChangeEl.current.textContent.trim()) {
      if (items.some(i => i.id !== item.id && i.title.trim().toLowerCase() === nameChangeEl.current.textContent.trim().toLowerCase())) {
        handleBigToast('error', 1, setToastData)
        nameChangeEl.current.textContent = item.title
        document.activeElement.blur()
      } else {
        setItems(prev => getSortedItems(prev.map(i => i.id === item.id ? {...i, title: nbsps(nameChangeEl.current.textContent)} : {...i} ), assessments))

        document.activeElement.blur()
        handleSmallToast('success', 1, setToastData)
      }
    }
  }

  function onNameChangeBlur(e) {
    e.target.classList.remove('active')
    handleItemNameCheck()

    e.target.scrollTo({top: 0, behavior: 'instant'})
    changingName.current = false
  }

  return (
      <div className="relative size-full flex overflow-hidden">
        <div className="flex-1 relative flex items-center gap-2">
          <div className="flex-1 flex flex-col gap-px m-2">
            <div className="inline-block">
              <div
                contentEditable={true}
                className="[&:not(.active)]:line-clamp-2 max-h-13 rounded px-1.5 py-0.5 overflow-hidden focus:outline-none focus:bg-black/30 font-medium"
                spellCheck={false}
                onFocus={onNameChangeFocus}
                onInput={onNameChangeInput}
                onBlur={onNameChangeBlur}
                onKeyPress={onNameChangeKeyPress}
                suppressContentEditableWarning={true}
                ref={nameChangeEl}
                id={`edit-title-${item.id}`}
                style={{
                  WebkitUserSelect: 'text',
                  userSelect: 'text',
                  pointerEvents: 'auto'
                }}
              >{item.title}</div>
            </div>

            <div className="flex h-7 items-center gap-3 text-gray-500 text-sm px-1.5 empty:hidden">
              {item.pinned &&
                <PinFill className="size-4 text-sky-500" />
              }
              {item.reminderDays.includes(todayNum) &&
                <div className={`flex items-center border p-px text-xs font-medium rounded-full pr-1.5 transition-colors ${isItToday(assessments.find(ass => ass.item_id === item.id)?.last.date) ? 'text-lime-500 border-lime-500/50' : 'text-yellow-500 border-yellow-500/50'}`}>
                  <ClockFill
                    className={`size-4 text-yellow-500 [&:not(.done)]:mr-1 [&.done]:w-0 overflow-hidden ${isItToday(assessments.find(ass => ass.item_id === item.id)?.last.date) ? 'done pr-1.5' : ''}`}
                    style={{
                      transition: 'width .1s'
                    }}
                  />
                  <span
                    className={`w-[1.5ch] [&.done]:w-0 overflow-hidden ${isItToday(assessments.find(ass => ass.item_id === item.id)?.last.date) ? 'done' : ''}`}
                    style={{
                      transition: 'width .1s'
                    }}
                  >to</span>
                  <span>do</span>
                  <span
                    className={`w-[2ch] [&.done]:w-0 overflow-hidden ${isItToday(assessments.find(ass => ass.item_id === item.id)?.last.date) ? '' : 'done'}`}
                    style={{
                      transition: 'width .1s'
                    }}
                  >ne</span>
                </div>
              }
              {assessments.find(ass => ass.item_id === item.id)?.last &&
                <span>{formatWhenDate(assessments.find(ass => ass.item_id === item.id)?.last.date)}</span>
              }
              {assessments.find(ass => ass.item_id === item.id)?.past.length > 0 && getLastPastAssDiff(item.id, assessments) !== 0 &&
                <div className={`ml-auto rounded-full ${
                  getLastPastAssDiff(item.id, assessments) < 0 ? 'text-red-500' :
                  getLastPastAssDiff(item.id, assessments) > 0 ? 'text-green-600' : ''
                }`}>
                  {getLastPastAssDiff(item.id, assessments)}
                  {getLastPastAssDiff(item.id, assessments) < 0 && <span>↓</span>}
                  {getLastPastAssDiff(item.id, assessments) > 0 && <span>↑</span>}
                </div>
              }
            </div>
          </div>
        </div>
      </div>
  )
}