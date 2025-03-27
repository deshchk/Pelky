import { useEffect, useRef, useState } from 'react'
import { useOutsideClick } from "@/hooks/useOutsideClick"
import { deleteItem, pinItem } from "@/components/tracker/itemActions"
import useDialog from "@/hooks/useDialog"
import ScrollerInput from "@/components/tracker/ScrollerInput"
import Trash from "@/assets/trash.svg?react"
import Pen from "@/assets/pen.svg?react"
import Xmark from "@/assets/x-mark.svg?react"

export default function TrackerItem({index, item, body, leftActions, rightActions, assessments, setters}) {
  const {
    setItems,
    setDialogData
  } = setters

  const itemWrapper = useRef(null)
  const mainContent = useRef(null)
  const leftActionsWrapper = useRef(null)
  const rightActionsWrapper = useRef(null)

  const [mainTranslateX, setMainTranslateX] = useState(0)
  const [leftWidth, setLeftWidth] = useState(0)
  const [rightWidth, setRightWidth] = useState(0)

  const [wasMoving, setWasMoving] = useState(false)
  const [swipingBlocked, setSwipingBlocked] = useState(false)

  const [shouldLeftAction, setShouldLeftAction] = useState(false)
  const [shouldRightAction, setShouldRightAction] = useState(false)

  const startPos = useRef({x: 0, y: 0})
  const direction = useRef("")
  const snapWidth = useRef(0)
  const isAfterSnapLeft = useRef(false)
  const isAfterSnapRight = useRef(false)

  const stateRef = useRef({})
  stateRef.current = {
    mainTranslateX,
    leftWidth,
    rightWidth,
    shouldLeftAction,
    shouldRightAction,
    wasMoving,
    swipingBlocked,
  }



  function handleStartMovement(e) {
    startPos.current.x = e.touches[0].clientX
    startPos.current.y = e.touches[0].clientY
    snapWidth.current = (14*4)*2 // w-14 per one
  }

  function handleWhileMovement(e) {
    setWasMoving(false)

    const currentPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    const diffX = currentPos.x - startPos.current.x
    const diffY = currentPos.y - startPos.current.y

    if (Math.abs(diffY) > Math.abs(diffX) || stateRef.current.swipingBlocked || document.activeElement.getAttribute('contenteditable') === 'true') {
      return
    } else if (e.cancelable) {
      e.preventDefault()
    }

    let tX = isAfterSnapLeft.current ? snapWidth.current + diffX
      : isAfterSnapRight.current ? diffX - snapWidth.current
      : diffX

    if (diffX > 0) {
      // swipe right (reveal left)
      direction.current = 'right'
    } else {
      // swipe left (reveal right)
      direction.current = 'left'
    }

    setMainTranslateX(isAfterSnapLeft.current ? Math.max(tX, 0) : isAfterSnapRight.current ? Math.min(tX, 0) : tX)
    setLeftWidth(tX)
    setRightWidth(-tX)

    setShouldLeftAction(tX > itemWrapper.current.clientWidth/1.8)
    setShouldRightAction(tX < -(itemWrapper.current.clientWidth/1.8))
  }

  const deleteDialog = useDialog(setDialogData,{
    Icon: Trash,
    title: `Deleting "${item.title}"`,
    message: 'This item and it\'s data will be deleted. Delete anyway?'
  })

  async function handleEndMovement() {
    const currentMTX = stateRef.current.mainTranslateX
    const shouldDoLeftAction = stateRef.current.shouldLeftAction
    const shouldDoRightAction = stateRef.current.shouldRightAction
    const shouldSnap = isAfterSnapLeft.current || isAfterSnapRight.current ? false : Math.abs(currentMTX) >= snapWidth.current*.3

    if (shouldDoLeftAction || shouldDoRightAction) {
      if (shouldDoLeftAction) {
        await pinItem(item, assessments, setItems).then(() => setShouldLeftAction(false))
      }

      if (shouldDoRightAction) {
        await deleteItem(item, assessments, setItems, deleteDialog).then(() => setShouldRightAction(false))
      }
    } else {
      setWasMoving(true)
      shouldSnap ? snapSwipe() : resetSwipe()
    }
  }

  function snapSwipe() {
    if (direction.current === 'right') {
      setShouldLeftAction(prev => prev ? !prev : prev)
      setMainTranslateX(snapWidth.current)
      setLeftWidth(snapWidth.current)
      isAfterSnapLeft.current = true
    } else {
      setShouldRightAction(prev => prev ? !prev : prev)
      setMainTranslateX(-snapWidth.current)
      setRightWidth(snapWidth.current)
      isAfterSnapRight.current = true
    }
  }

  function resetSwipe() {
    setMainTranslateX(0)
    setLeftWidth(0)
    setRightWidth(0)
    isAfterSnapLeft.current = false
    isAfterSnapRight.current = false
  }

  useOutsideClick(() => {
    resetSwipe()
  }, itemWrapper)

  useEffect(() => {
    resetSwipe()
  }, [item.pinned])

  useEffect(() => {
    const mainEl = mainContent.current
    if (!mainEl) return

    const ac = new AbortController()

    itemWrapper.current?.addEventListener("touchstart", handleStartMovement, { signal: ac.signal })
    itemWrapper.current?.addEventListener("touchmove", handleWhileMovement, { passive: false, signal: ac.signal })
    itemWrapper.current?.addEventListener("touchend", handleEndMovement, { signal: ac.signal })

    return () => ac.abort()
  }, [])



  // scroller assessment options
  const assessmentOptions = useRef(null)
  const cancelAssessment = useRef(false)
  const noteAssessment = useRef(false)
  const [showAssessmentOptions, setShowAssessmentOptions] = useState(false)

  function handleNotingAsessment() {
    noteAssessment.current = true
    setShowAssessmentOptions(false)
  }

  function handleCancelAssessment() {
    cancelAssessment.current = true
    setShowAssessmentOptions(false)
  }

  return (
    <li
      ref={itemWrapper}
      className="group/item relative grid grid-cols-2 w-full max-h-26 overflow-hidden border-b first:border-y border-slate-700"
      style={{
        transform: 'translateZ(0)',
        transition: `opacity .3s, outline-color .4s, margin .4s, grid-template-rows .2s, translate .${700-(index*100)}s`
      }}
    >
      <div
        ref={mainContent}
        className="row-start-1 row-end-2 col-span-full min-h-20 grid grid-cols-[1fr_auto] select-none z-10 bg-slate-900"
        style={{
          transform: `translateX(${mainTranslateX}px)`,
          transition: wasMoving ? `transform .1s` : 'none',
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="relative overflow-hidden">
          {body}

          <div
            ref={assessmentOptions}
            className="absolute top-1/2 right-0 grid place-items-center bg-slate-700/20 backdrop-blur-[2px]"
            style={{
              transform: !showAssessmentOptions ? 'translateX(200%) translateY(-50%)' : 'translateX(0) translateY(-50%)',
              transition: 'transform .3s',
            }}
          >
            <div className="flex gap-4 h-16 p-3 pr-5">
              <div onClick={handleCancelAssessment} className="w-10 h-full bg-red-500 grid place-items-center">
                <Xmark className="size-6"/>
              </div>
              <div onClick={handleNotingAsessment} className="w-10 h-full bg-lime-600 grid place-items-center">
                <Pen className="size-6 stroke-2 p-1"/>
              </div>
            </div>
          </div>
        </div>

        <ScrollerInput
          item={{...item, index}}
          setters={{...setters, setSwipingBlocked}}
          options={{cancelAssessment, noteAssessment, setShowAssessmentOptions}}
          scale={10}
          scaleDirection="both"
        />
      </div>

      <ul
        ref={leftActionsWrapper}
        className="row-start-1 row-end-2 col-start-1 col-end-2 h-full grid overflow-hidden"
        style={{
          width: leftWidth,
          gridTemplateColumns: shouldLeftAction ? '1fr 0fr' : '1fr 1fr',
          transition: wasMoving ? 'width .2s' : 'grid-template-columns .15s'
        }}
      >
        {leftActions.length > 0 &&
          leftActions.map(action => (
            <li
              key={action.name}
              className={`grid select-none overflow-hidden ${action.color}`}
              style={{
                alignContent: 'center',
                justifyItems: shouldLeftAction ? 'end' : 'center',
              }}
            >
              {action.body}
            </li>
          ))
        }
      </ul>

      <ul
        ref={rightActionsWrapper}
        className="row-start-1 row-end-2 col-start-2 col-end-3 justify-self-end grid h-full overflow-hidden"
        style={{
          width: rightWidth,
          gridTemplateColumns: shouldRightAction ? '0fr 1fr' : '1fr 1fr',
          transition: wasMoving ? 'width .2s' : 'grid-template-columns .15s'
        }}
      >
        {rightActions.length > 0 &&
          rightActions.map(action => (
            <li key={action.name}
              className={`grid select-none overflow-hidden ${action.color}`}
              style={{
                alignContent: 'center',
                justifyItems: shouldRightAction ? 'start' : 'center',
              }}
            >
              {action.body}
            </li>
          ))
        }
      </ul>
    </li>
  )
}