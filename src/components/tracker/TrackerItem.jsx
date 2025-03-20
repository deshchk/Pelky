import Trash from "@/assets/trash.svg?react"
import Clock from "@/assets/clock.svg?react"
import Pin from "@/assets/pin.svg?react"
import Loader from "@/assets/loader.svg?react"
import Check from "@/assets/check.svg?react"
import { useEffect, useRef, useState } from "react"
import useDialog from "@/hooks/useDialog"
import AssessmentScroller from "@/components/tracker/AssessmentScroller"
import DaySelector from "@/components/atoms/DaySelector.jsx"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import {
  firstUpper,
  isItToday,
  todayNum,
  getLastPastAssDiff,
  loadItemsInNeed,
  handleSmallToast,
  handleBigToast
} from "@/utils"
import { getSortedItems, deleteItemAndAssessments, saveItems } from "@/data"

function TrackerItem({children, item, data, itemIndex}) {
  const {
    items,
    setItems,
    assessments,
    setAssessments,
    setToastData,
    setDialogData,
    setAnimationsInProgress
  } = data



  const itemContainer = useRef(null)
  const itemEl = useRef(null)
  const scrollEl = useRef(null)
  const itemLoader = useRef(null)
  const nameChangeEl = useRef(null)
  const leftParallaxEl = useRef(null)

  const touches = useRef(0)
  const wasSettingReminder = useRef(false)
  const changingName = useRef(false)

  const [touchEnded, setTouchEnded] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [selectedDays, setSelectedDays] = useState(item.reminderDays)

  const colorClasses = item.pinned ? 'bg-sky-800' : !assessments.some(ass => ass.item_id === item.id) ? 'bg-slate-800' : 'bg-slate-700'
  const borderColorClasses = item.pinned ? 'border-slate-800' : !assessments.some(ass => ass.item_id === item.id) ? 'border-slate-950' : 'border-slate-900/80'
  const animationDurationStyle = {transition: `opacity .3s, outline-color .4s, margin .4s, grid-template-rows .2s, translate .${700-(itemIndex*50)}s`}



  // ---------- Item functions ----------
  function onTouchStart() {
    setTouchEnded(false)
    touches.current += 1
    if (touches.current === 3) {
      setItems(items.map(i => ({...i, lastAssessed: false}) ))
      touches.current = 0
    }
  }

  function onTouchEnd() {
    setTouchEnded(true)
  }

  function onScroll(e) {
    if (e.target.scrollLeft === 0) {
      setItems(items.map(i => i.id === item.id ? {...i, settingReminder: true} : {...i, settingReminder: false} ))
      wasSettingReminder.current = true
    }

    if (!item.settingReminder) {
      if (e.target.scrollLeft > e.target.clientWidth / 1.25 && touchEnded && !deleting) {
        deleteItem()
      }
    } else if (wasSettingReminder.current) {
      e.target.classList.add('stop-scroll')
      setItems(items.map(i => i.id === item.id ? {...i, settingReminder: false} : {...i}))
      // e.target.scrollTo({left: e.target.children[0].clientWidth+1})
      wasSettingReminder.current = false
    }
  }

  // ---------- Deleting item ----------
  const deleteDialog = useDialog(setDialogData,{
    Icon: Trash,
    title: `Deleting "${item.title}"`,
    message: 'This item and it\'s data will be deleted. Delete anyway?'
  })

  function del() {
    itemContainer.current.classList.remove('reminder')
    itemEl.current.classList.add('hiding-animation')
    setItems(items.map(i => ({...i, settingReminder: false})))
    setTimeout(() => {
      deleteItemAndAssessments(item.id)
      setItems(items.toSpliced(items.indexOf(item), 1))
    }, 200)
  }

  async function deleteItem() {
    setDeleting(true)

    if (!assessments.find(ass => ass.item_id === item.id)) {
      del()
    } else {
      const promise = await deleteDialog()

      if (promise) {
        del()
      } else {
        scrollEl.current.scrollTo({left: scrollEl.current.children[0].clientWidth+1})
        setDeleting(false)
        setTouchEnded(false)
      }
    }
  }

  // ---------- Setting Reminder ----------
  const reminderDialog = useDialog(setDialogData,{
    Icon: Clock,
    title: firstUpper(item.title),
    message: 'On which days would you like to be reminded about this?',
    confirmText: 'Save',
    confirmBg: 'bg-blue-500',
    dataCollector: () => selectedDays,
    Custom: () => <DaySelector selectedDays={selectedDays} setSelectedDays={setSelectedDays} />
  })

  async function onSetReminder() {
    const promise = await reminderDialog()

    if (promise) {
      const updatedItems = getSortedItems(items.map(i => i.id === item.id ? {...i, reminderDays: promise} : {...i}),assessments)

      setItems(updatedItems)
      saveItems(updatedItems)

      !promise.includes(todayNum) && itemContainer.current.classList.remove('reminder')
    } else {
      setSelectedDays(item.reminderDays)
    }
  }

  function onSetPinned() {
    const updatedItems = getSortedItems(items.map(i => i.id === item.id ? {...i, pinned: !i.pinned} : {...i}),assessments)

    setItems(updatedItems)
    saveItems(updatedItems)

    scrollEl.current.scrollTo({left: scrollEl.current.children[0].clientWidth+1})
  }

  function onNameChangeFocus() {
    nameChangeEl.current.classList.add('active')
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
        console.log('dupa')
        handleBigToast('error', 1, setToastData)
        nameChangeEl.current.textContent = item.title
        document.activeElement.blur()
      } else {
        const updatedItems = getSortedItems(items.map(i => i.id === item.id ? {...i, title: nameChangeEl.current.textContent} : {...i} ), assessments)

        loadItemsInNeed(
          updatedItems.indexOf(updatedItems.find(i => i.id === item.id)) !== items.indexOf(item),
          itemEl, itemLoader, setAnimationsInProgress
        )

        setItems(updatedItems)
        saveItems(updatedItems)

        document.activeElement.blur()
        handleSmallToast('success', 1, setToastData)
      }
    }
  }

  function onNameChangeBlur() {
    nameChangeEl.current.classList.remove('active')
    handleItemNameCheck()

    nameChangeEl.current.scrollTo({top: 0, behavior: 'instant'})
    changingName.current = false
  }

  useOutsideClick(() => {
    if (item.lastAssessed) {
      setItems(items.map(i => ({...i, lastAssessed: false}) ))
    }
    if (item.settingReminder) {
      setItems(items.map(i => i.id === item.id ? {...i, settingReminder: false} : {...i} ))
    }
  }, itemEl, {item, setItems})

  useOutsideClick(e => {
    if (changingName.current && e.target.id.includes('edit-title')) {
      e.preventDefault()
      document.activeElement.blur()
    }
  }, nameChangeEl)

  useEffect(() => {
    if (!item.settingReminder) {
      scrollEl.current.scrollTo({left: scrollEl.current.children[0].clientWidth+1})
      scrollEl.current.classList.remove('stop-scroll')
    }
    if (item.reminderDays.length > 0) {
      if (item.reminderDays.includes(todayNum) && !deleting
        && !assessments.some(ass => ass.item_id === item.id && isItToday(ass.last.date))) {
        itemContainer.current.classList.add('reminder')
      }
    }
    itemContainer.current.classList.remove('hiding-animation')
  }, [assessments, item.id, item.reminderDays, item.settingReminder, item.lastAssessed, deleting])

  const assessmentProps = {
    colorClasses, borderColorClasses,
    item, items, setItems, changingName,
    assessments, setAssessments,
    setToastData, setAnimationsInProgress,
    itemContainer, itemEl, itemLoader
  }


  return (
    <li className={`hide-able tracker-item relative rounded-lg touch-manipulation hiding-animation
        shown [&:not(.shown)]:opacity-0 [&.saving]:!hidden w-[calc(100%_-_32px)] sm:w-[calc(100%_-_64px)]
        ${item.lastAssessed ? 'last-assessed' : ''}
      `.trim()}
      ref={itemContainer}
      style={animationDurationStyle}
    >
      <div className="absolute inset-0 group hide-able loading-animation place-items-center [&:not(.loading-animation)]:h-20 pointer-events-none" ref={itemLoader}>
        <Loader className="size-5 text-green-500 group-[&.loading-animation]:hidden" />
      </div>

      <div className="hide-able group/hide grid-rows-[1fr] overflow-hidden rounded-lg" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} ref={itemEl}>

        <div className={`
            grid grid-cols-[auto_100%_100%] gap-px group-[:not(.hiding-animation)]/hide:min-h-[80px]
            overflow-x-scroll overflow-y-hidden [&.stop-scroll]:overflow-hidden invisible-scroll scroll-smooth snap-x snap-mandatory
          `} onScroll={onScroll} ref={scrollEl}
        >
          <div className="relative flex snap-start snap-always">
            <div onClick={onSetPinned} className="bg-sky-800 w-20 h-full grid place-items-center sticky left-0" ref={leftParallaxEl}>
              <Pin className="size-8"/>
            </div>

            <div onClick={onSetReminder}
              className="bg-[color-mix(in_oklab,var(--color-yellow-500)_100%,var(--color-amber-600)_100%)] w-20 grid place-items-center"
            >
              <Clock className="size-8"/>
            </div>
          </div>

          <div className="relative snap-start snap-always flex group-[.hiding-animation]/hide:overflow-hidden">
            <div className={`relative flex-1 flex items-center px-4 text-white text-left ${colorClasses}`}>
              <div className="flex items-center gap-3 pr-2 w-full">
                {
                  assessments.find(ass => ass.item_id === item.id)?.last && isItToday(assessments.find(ass => ass.item_id === item.id)?.last.date) ?
                  <div className={`size-5 grid place-items-center rounded-full bg-slate-900/50 text-white shrink-0`}>
                    <Check className="size-3 stroke-2"/>
                  </div>
                  :
                  <div className={`size-5 grid place-items-center rounded-full bg-slate-900/50 text-white shrink-0`}></div>
                }

                <div className="inline-block flex-1 my-2.5">
                  <div
                    contentEditable={true}
                    className="[&:not(.active)]:line-clamp-3 max-h-[76px] rounded px-2 py-0.5 overflow-hidden focus:outline-none focus:bg-black/40"
                    spellCheck={false}
                    onFocus={onNameChangeFocus}
                    onInput={onNameChangeInput}
                    onBlur={onNameChangeBlur}
                    onKeyPress={onNameChangeKeyPress}
                    suppressContentEditableWarning={true}
                    ref={nameChangeEl}
                    id={`edit-title-${item.id}`}
                  >{children}</div>
                </div>
              </div>

              <div className="absolute top-0 bottom-0 -right-0.5 grid place-items-center">
                {
                    assessments.find(ass => ass.item_id === item.id)?.past.length > 0 &&
                    <div className={`size-5 grid place-items-center rounded-l-full text-[9px] font-bold ${
                        getLastPastAssDiff(item.id, assessments) < 0 ? 'bg-red-500/60' :
                            getLastPastAssDiff(item.id, assessments) > 0 ? 'bg-green-600/60' : ''
                    }`}>
                      {
                          getLastPastAssDiff(item.id, assessments) !== 0 && getLastPastAssDiff(item.id, assessments)
                    }
                  </div>
                }
              </div>
            </div>

            <AssessmentScroller {...assessmentProps} />
          </div>

          <div className="bg-red-500 snap-end flex px-4 relative">
            <Trash className="absolute top-1/2 -translate-y-1/2 size-9"/>
          </div>
        </div>
      </div>
    </li>
  )
}

export default TrackerItem