import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import {formatWhenDate, handleSmallToast, nbsps} from "@/services/utils"
import ItemAction from "@/components/tracker/ItemAction"

export default function AssessmentItem({item, ass, listScrolling, setter}) {
  const navigate = useNavigate()

  const itemWrapper = useRef(null)
  const mainContent = useRef(null)

  const [mainTranslateX, setMainTranslateX] = useState(0)
  const [rightWidth, setRightWidth] = useState(0)

  const [wasMoving, setWasMoving] = useState(false)
  const [loadingItem, setLoadingItem] = useState(false)
  const [inputFocused, setInputFocused] = useState(null)

  const [shouldRightAction, setShouldRightAction] = useState(false)

  const startPos = useRef({x: 0, y: 0})
  const direction = useRef("")
  const snapWidth = useRef(0)
  const isAfterSnapRight = useRef(false)

  const stateRef = useRef({})
  stateRef.current = {
    mainTranslateX,
    rightWidth,
    shouldRightAction,
    wasMoving,
  }

  const getMinMax = () => {
    if (item.scale) {
      switch (item.scale.type) {
        case 'positive':
          return { min: 0, max: item.scale.max }
        case 'negative':
          return { min: 0, max: item.scale.max }
        case 'both':
        default:
          return { min: -item.scale.max, max: item.scale.max }
      }
    } else {
      return { min: -10, max: 10 }
    }
  }

  const { min, max } = getMinMax()
  const scaleValues = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const colorPercent = item.scale.type === 'both' || !item.scale ? Math.abs(scaleValues.indexOf(ass.value) - Math.abs(min))/max*100 : (Math.abs(scaleValues.indexOf(ass.value))/max)*100


  // ---------- ACTION FUNCTIONS ----------
  // deleting assessment
  function actionDeleteAssessment() {
    setLoadingItem(true)
    setTimeout(() => {
      setter.assessments(prev => {
        return prev.map(a => a.item_id === item.id ? {...a, entries: a.entries.filter(x => x.id !== ass.id)} : a)
      })
      navigate(`/ass/${item.id}`, { replace: true })
    }, 100)
  }

  // adding OR changing note
  const noteChangeEl = useRef(null)
  const changingNote = useRef(false)
  const [inputValue, setInputValue] = useState(ass.note ?? '')

  function onNoteChangeFocus() {
    setInputFocused(true)
  }

  function onNoteChangeBeforeInput(e) {
    if (e.target.textContent.trim().length >= 280) {
      e.preventDefault()
      e.target.textContent = String(e.target.textContent).slice(0,280)
    }
  }

  function onNoteChangeInput(e) {
    if (e.target.textContent.trim().length >= 280 && e.nativeEvent.inputType === 'insertFromPaste') {
      e.preventDefault()
      e.target.textContent = String(e.target.textContent).slice(0,280)
    }
    changingNote.current = true
    setInputValue(e.target.textContent)
  }

  function onNoteChangeKeyPress(e) {
    if (changingNote.current && e.key === 'Enter') {
      e.preventDefault()
      e.target.blur()
    }
  }

  function onNoteChangeBlur(e) {
    setInputFocused(false)

    if (ass.note && e.target.textContent.trim() === ass.note.trim()) {
      return
    } else if(!ass.note && e.target.textContent.trim() === '') {
      e.target.textContent = ''
      return
    } else {
      setter.assessments(prev => {
        return prev.map(a => a.item_id === item.id ? {...a, entries: a.entries.map(x => x.id === ass.id ? {...x, note: nbsps(e.target.textContent.trim())} : x)} : a)
      })

      document.activeElement.blur()
      navigate(`/ass/${item.id}`, { replace: true })
      handleSmallToast('success', 1, setter.toast)
    }

    e.target.scrollTo({top: 0, behavior: 'instant'})
    changingNote.current = false
  }



  function handleStartMovement(e) {
    startPos.current.x = e.touches[0].clientX
    startPos.current.y = e.touches[0].clientY
    snapWidth.current = (18*4) // w-18 per one
  }

  function handleWhileMovement(e) {
    setWasMoving(false)

    const currentPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    const diffX = currentPos.x - startPos.current.x
    const diffY = currentPos.y - startPos.current.y

    if (Math.abs(diffY) > Math.abs(diffX) || listScrolling.current || changingNote.current) {
      return
    } else if (e.cancelable) {
      e.preventDefault()
    }

    let tX = isAfterSnapRight.current ? diffX - snapWidth.current : diffX

    if (diffX < 0) {
      // swipe left (reveal right)
      direction.current = 'left'
    }

    setMainTranslateX(Math.min(tX, 0))
    setRightWidth(-tX)

    setShouldRightAction(tX < -(itemWrapper.current.clientWidth/2))
  }



  async function handleEndMovement() {
    const currentMTX = stateRef.current.mainTranslateX
    const shouldDoRightAction = stateRef.current.shouldRightAction
    const shouldSnap =  isAfterSnapRight.current ? false : Math.abs(currentMTX) >= snapWidth.current*.3

    if (shouldDoRightAction) {
      actionDeleteAssessment()
    } else {
      setWasMoving(true)
      shouldSnap ? snapSwipe() : resetSwipe()
    }
  }

  function snapSwipe() {
    if (direction.current === 'left') {
      setShouldRightAction(prev => prev ? !prev : prev)
      setMainTranslateX(-snapWidth.current)
      setRightWidth(snapWidth.current)
      isAfterSnapRight.current = true
    }
  }

  function resetSwipe() {
    setMainTranslateX(0)
    setRightWidth(0)
    isAfterSnapRight.current = false
  }

  useOutsideClick(() => {
    resetSwipe()
  }, itemWrapper)

  useEffect(() => {
    const mainEl = mainContent.current
    if (!mainEl) return

    const ac = new AbortController()

    itemWrapper.current?.addEventListener("touchstart", handleStartMovement, { signal: ac.signal })
    itemWrapper.current?.addEventListener("touchmove", handleWhileMovement, { passive: false, signal: ac.signal })
    itemWrapper.current?.addEventListener("touchend", handleEndMovement, { signal: ac.signal })

    return () => ac.abort()
  }, [])

  return (
    <li
      ref={itemWrapper}
      className="group/item relative grid grid-cols-1 grid-rows-1 w-full overflow-hidden border-y -mt-px border-[hsl(222_55%_7%)] bg-red-500 touch-manipulation"
      style={{
        transform: `translateZ(0) ${loadingItem ? 'translateX(-100%)' : 'translateX(0)'}`,
        transition: `opacity .2s ease-in-out, transform .2s`,
        opacity: loadingItem ? 0 : 1,
      }}
    >
      <div
        ref={mainContent}
        className="row-start-1 row-end-2 col-start-1 col-end-2 min-h-20 grid grid-cols-[1fr_auto] select-none z-10 bg-slate-900"
        style={{
          transform: `translateX(${mainTranslateX}px)`,
          transition: wasMoving ? 'transform .2s' : '',
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="relative size-full flex overflow-hidden">
          <div className="flex-1 relative flex items-center gap-2">
            <div className="flex-1 flex flex-col gap-2 m-2">
              <div className="flex items-center justify-between">
                <div className="px-1.5 py-0.5 text-xs font-medium">
                  {!parseInt(formatWhenDate(ass.date)) ?
                    <span>
                      <span className="text-sm">{formatWhenDate(ass.date)}</span>
                      <span className="ml-2 text-slate-400">{ass.date.split(',')[1]}</span>
                    </span>
                    :
                    <span>
                      <span className="text-sm">{ass.date.split(',')[0]}</span>
                      <span className="ml-2 text-slate-400">{ass.date.split(',')[1]}</span>
                    </span>
                  }
                </div>
                <small
                  className={`text-xs mr-1.5 transition-opacity duration-200 ${inputValue.length < 200 ? 'text-slate-400' : inputValue.length === 280 ? 'text-amber-400' : ''}`.trim()}
                  style={{
                    opacity: inputFocused ? '100%' : '0%',
                  }}
                >
                  {inputValue.length}/280
                </small>
              </div>

              <div className="mx-1 inline-block">
                <div
                  contentEditable={true}
                  placeholder="add a note"
                  className="px-2 py-1 rounded bg-slate-950/15 flex min-h-7 items-center gap-3 text-slate-200 text-sm focus:outline-none focus:bg-slate-950"
                  onFocus={onNoteChangeFocus}
                  onBeforeInput={onNoteChangeBeforeInput}
                  onInput={onNoteChangeInput}
                  onBlur={onNoteChangeBlur}
                  onKeyPress={onNoteChangeKeyPress}
                  suppressContentEditableWarning={true}
                  ref={noteChangeEl}
                  id={`edit-note-${item.id}`}
                  style={{
                    WebkitUserSelect: 'text',
                    userSelect: 'text',
                    pointerEvents: 'auto'
                  }}
                >{ass.note}</div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: ass.value === 0 ? 'color-mix(in oklab, transparent, var(--color-slate-950) 50%'
              : `color-mix(in oklab, transparent ${100-colorPercent}%, var(${((item.scale.type === 'both' || !item.scale) && scaleValues.indexOf(ass.value) < scaleValues.length/2) ? '--color-red-500' : item.scale.type === 'negative' ? '--color-red-500' : '--color-green-500'}) ${colorPercent/2}%)`,
          }}
          className="h-full w-18 grid place-items-center text-xl border-l border-[hsl(222_55%_7%)]"
        >
          {ass.value}
        </div>
      </div>

      <ul
        className="row-start-1 row-end-2 col-start-1 col-end-2 justify-self-end grid h-full overflow-hidden relative"
        style={{
          width: rightWidth,
          gridTemplateColumns: '1fr',
          transition: wasMoving ? 'width .1s' : ''
        }}
      >
        <li
          className="absolute grid h-full select-none overflow-hidden"
          style={{
            left: shouldRightAction ? '0' : '50%',
            transform: shouldRightAction ? 'translateX(0)' : 'translateX(-50%)',
            transition: 'left .15s, transform .15s',
          }}
        >
          <ItemAction type="delete" action={actionDeleteAssessment} />
        </li>
      </ul>
    </li>
  )
}