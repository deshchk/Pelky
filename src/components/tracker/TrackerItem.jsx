import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import { getSortedItems } from "@/services/data"
import { firstUpper } from "@/services/utils"
import { deleteItem, pinItem } from "@/components/tracker/itemEdgeActions"
import ItemBody from "@/components/tracker/ItemBody"
import ScrollerInput from "@/components/tracker/ScrollerInput"
import ItemAction from "@/components/tracker/ItemAction"
import useDialog from "@/hooks/useDialog"
import DaySelector from "@/components/dialogs/insides/DaySelector"
import Trash from "@/assets/trash.svg?react"
import Clock from "@/assets/clock.svg?react"
import Pen from "@/assets/pen.svg?react"
import Xmark from "@/assets/x-mark.svg?react"

export default function TrackerItem({item, listIndex, items, assessments, listScrolling, setters}) {
  const {
    setItems,
    setDialogData,
  } = setters

  const navigate = useNavigate()
  const itemWrapper = useRef(null)
  const mainContent = useRef(null)

  const [mainTranslateX, setMainTranslateX] = useState(0)
  const [leftWidth, setLeftWidth] = useState(0)
  const [rightWidth, setRightWidth] = useState(0)

  const [wasMoving, setWasMoving] = useState(false)
  const [swipingBlocked, setSwipingBlocked] = useState(false)
  const [loadingItem, setLoadingItem] = useState(false)

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


  // ---------- ACTION FUNCTIONS ----------
  // pinning the item
  const actionPinItem = useCallback(() => {
    const nextItems = getSortedItems(items.map(i => i.id === item.id ? {...i, pinned: !i.pinned} : i), assessments)
    const nextIndex = nextItems.length-nextItems.indexOf(nextItems.find(i => i.id === item.id))

    if (Math.abs(nextIndex-item.index) > 1) {
      setLoadingItem(true)
      setTimeout(async () => {
        pinItem(item, assessments, setItems)
        setShouldLeftAction(false)
      }, 200)
    } else {
      pinItem(item, assessments, setItems)
      setShouldLeftAction(false)
    }
  }, [assessments, item, items, setItems])

  // deleting the item
  const deleteDialog = useDialog(
    setDialogData,
    useMemo(() => ({
      Icon: Trash,
      title: `Deleting "${item.title}"`,
      message: 'This item and it\'s data will be deleted. Delete anyway?'
    }), [item.title])
  )
  function actionDeleteItem() {
    setLoadingItem(true)
    setTimeout(() => {
      deleteItem(item, assessments, setItems, deleteDialog).then(() => {
        setShouldRightAction(false)
        setLoadingItem(false)
      })
    }, 200)
  }

  // setting reminders for the item
  const [selectedDays, setSelectedDays] = useState(item.reminderDays)
  const reminderDialog = useDialog(
    setDialogData,
    useMemo(() => ({
      Icon: Clock,
      title: firstUpper(item.title),
      message: 'On which days would you like to be reminded about this?',
      confirmText: 'Save',
      confirmBg: 'bg-blue-500',
      dataCollector: () => selectedDays,
      Custom: () => <DaySelector selectedDays={selectedDays} setSelectedDays={setSelectedDays} />
    }), [item.title, selectedDays])
  )
  const actionReminderItem = useCallback(async () => {
    const promise = await reminderDialog()

    if (promise) {
      const nextItems = getSortedItems(items.map(i => i.id === item.id ? {...i, reminderDays: promise} : i), assessments)
      const nextIndex = nextItems.length-nextItems.indexOf(nextItems.find(i => i.id === item.id))

      function saveChanges() {
        const newIndex = (currentArray, object) => {
          const newArray = getSortedItems(currentArray.map(x => x.id === item.id ? {...x, reminderDays: promise} : x), assessments)
          return currentArray.length-newArray.indexOf(newArray.find(y => y.id === object.id))
        }

        setItems(prev => getSortedItems(prev.map(i => i.id === item.id
          ? {...i, reminderDays: promise, index: newIndex(prev, i)}
          : {...i, index: newIndex(prev, i)}),
          assessments)
        )
      }

      if (Math.abs(nextIndex-item.index) > 1) {
        setLoadingItem(true)
        setTimeout(async () => {
          saveChanges()
        }, 200)
      } else {
        saveChanges()
      }
    } else {
      setSelectedDays(item.reminderDays)
    }
  }, [assessments, item.id, item.index, item.reminderDays, items, reminderDialog, setItems])

  // navigating to item assessment details
  function actionDetailsItem() {
    navigate(`/ass/${item.id}`)
  }



  function handleStartMovement(e) {
    startPos.current.x = e.touches[0].clientX
    startPos.current.y = e.touches[0].clientY
    snapWidth.current = (18*4)*2 // w-18 per one
  }

  function handleWhileMovement(e) {
    setWasMoving(false)

    const currentPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    const diffX = currentPos.x - startPos.current.x
    const diffY = currentPos.y - startPos.current.y

    if (Math.abs(diffY) > Math.abs(diffX) || listScrolling.current || stateRef.current.swipingBlocked || document.activeElement.getAttribute('contenteditable') === 'true') {
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
    setLeftWidth(isAfterSnapLeft.current ? Math.max(tX, 0) : isAfterSnapRight.current ? Math.min(tX, 0) : tX)
    setRightWidth(isAfterSnapLeft.current ? Math.max(-tX, 0) : isAfterSnapRight.current ? Math.min(-tX, 0) : -tX)

    setShouldLeftAction(tX > itemWrapper.current.clientWidth/1.8)
    setShouldRightAction(tX < -(itemWrapper.current.clientWidth/1.8))
  }



  async function handleEndMovement() {
    const currentMTX = stateRef.current.mainTranslateX
    const shouldDoLeftAction = stateRef.current.shouldLeftAction
    const shouldDoRightAction = stateRef.current.shouldRightAction
    const shouldSnap = isAfterSnapLeft.current || isAfterSnapRight.current ? false : Math.abs(currentMTX) >= snapWidth.current*.3

    if (shouldDoLeftAction || shouldDoRightAction) {
      if (shouldDoLeftAction) {
        actionPinItem()
      }

      if (shouldDoRightAction) {
        actionDeleteItem()
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
    if (item.status.lastAssessed || item.status.newestItem) {
      setItems(prev => prev.map(i => i.id === item.id ? {...i, status: {lastAssessed: false, newestItem: false}} : i))
    }
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

  useEffect(() => {
    requestAnimationFrame(() => {
      setLoadingItem(false)
    })
  }, [item.index, assessments])


  // scroller assessment options
  const assessmentOptions = useRef(null)
  const cancelAssessment = useRef(false)
  const noteAssessment = useRef(false)
  const [showAssessmentOptions, setShowAssessmentOptions] = useState(false)

  function handleNotingAssessment() {
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
      className="group/item relative grid grid-cols-2 w-full max-h-26 overflow-hidden border-y -mt-px first:border-y border-slate-700 touch-manipulation"
      style={{
        transform: `translateZ(0) ${loadingItem ? 'translateX(-100%)' : 'translateX(0)'}`,
        transition: `opacity .2s ease-in-out, transform .2s`,
        opacity: loadingItem ? '0' : 1,
      }}
    >
      <div
        ref={mainContent}
        className={`row-start-1 row-end-2 col-span-full min-h-20 grid grid-cols-[1fr_auto] select-none z-10 ${item.status.lastAssessed ? 'bg-lime-500/5' : item.status.newestItem ? 'bg-sky-500/5' : 'bg-slate-900'}`}
        style={{
          transform: `translateX(${mainTranslateX}px)`,
          transition: `${wasMoving ? 'transform .1s, ' : ''}background-color .2s`,
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="relative overflow-hidden">
          <ItemBody item={item} setters={{...setters, setLoadingItem}} {...{items, assessments}} />

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
              <div onClick={handleNotingAssessment} className="w-10 h-full bg-lime-600 grid place-items-center">
                <Pen className="size-6 stroke-2 p-1"/>
              </div>
            </div>
          </div>
        </div>

        <ScrollerInput
          item={item}
          listIndex={listIndex}
          items={items}
          setters={{...setters, setSwipingBlocked, setLoadingItem}}
          options={{cancelAssessment, noteAssessment, setShowAssessmentOptions}}
        />
      </div>

      <ul
        className="row-start-1 row-end-2 col-start-1 col-end-2 h-full grid overflow-hidden"
        style={{
          width: leftWidth,
          gridTemplateColumns: shouldLeftAction ? '1fr 0fr' : '1fr 1fr',
          transition: wasMoving ? 'width .1s' : 'grid-template-columns .15s'
        }}
      >
        <li
          className="grid select-none overflow-hidden bg-sky-700"
          style={{
            justifyItems: shouldLeftAction ? 'end' : 'center',
          }}
        >
          <ItemAction type="pin" action={actionPinItem} />
        </li>

        <li
          className="grid select-none overflow-hidden bg-yellow-500"
          style={{
            justifyItems: 'center',
          }}
        >
          <ItemAction type="reminder" action={actionReminderItem} />
        </li>
      </ul>

      <ul
        className="row-start-1 row-end-2 col-start-2 col-end-3 justify-self-end grid h-full overflow-hidden"
        style={{
          width: rightWidth,
          gridTemplateColumns: shouldRightAction ? '0fr 1fr' : '1fr 1fr',
          transition: wasMoving ? 'width .1s' : 'grid-template-columns .15s'
        }}
      >
        <li
          className="grid select-none overflow-hidden bg-slate-700"
          style={{
            justifyItems: 'center',
          }}
        >
          <ItemAction type="details" action={actionDetailsItem} />
        </li>

        <li
          className="grid select-none overflow-hidden bg-red-500"
          style={{
            justifyItems: shouldRightAction ? 'start' : 'center',
          }}
        >
          <ItemAction type="delete" action={actionDeleteItem} />
        </li>
      </ul>
    </li>
  )
}