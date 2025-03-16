import Trash from "@/assets/trash.svg?react"
import Clock from "@/assets/clock.svg?react"
import Pin from "@/assets/pin.svg?react"
import { useEffect, useRef, useState } from "react"
import useDialog from "@/hooks/useDialog"
import AssessmentScroller from "@/components/tracker/AssessmentScroller"
import DaySelector from "@/components/atoms/DaySelector.jsx"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import { isItToday, todayNum } from "@/utils"

function TrackerItem({children, item, data}) {
  const {
    items,
    setItems,
    assessments,
    setAssessments,
    setToastData,
    setDialogData
  } = data



  const itemContainer = useRef(null)
  const itemEl = useRef(null)
  const scrollEl = useRef(null)

  const touches = useRef(0)
  const wasSettingReminder = useRef(false)

  const [touchEnded, setTouchEnded] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [selectedDays, setSelectedDays] = useState(item.reminderDays)

  const colorClasses = item.pinned ? 'bg-sky-800' : !assessments.some(ass => ass.item_id === item.id) ? 'bg-slate-800' : 'bg-slate-700'
  const borderColorClasses = item.pinned ? 'border-slate-800' : !assessments.some(ass => ass.item_id === item.id) ? 'border-slate-950' : 'border-slate-900/80'
  const animationDurationStyle = {transition: `grid-template-rows .2s, translate .${700-((items.indexOf(item)+1)*50)}s`}


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
    itemEl.current.classList.add('hiding-animation')
    setItems(items.map(i => ({...i, settingReminder: false})))
    setTimeout(() => {
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
    title: `Setting reminders for "${item.title}"`,
    message: 'On which days would you like to be reminded about this?',
    confirmText: 'Save',
    confirmBg: 'bg-blue-500',
    dataCollector: () => selectedDays,
    Custom: () => <DaySelector selectedDays={selectedDays} setSelectedDays={setSelectedDays} />
  })

  async function onSetReminder() {
    const promise = await reminderDialog()

    if (promise) {
      setItems(items.map(i => i.id === item.id ? {...i, reminderDays: promise} : {...i}))
      !promise.includes(todayNum) && itemContainer.current.classList.remove('reminder')
    } else {
      setSelectedDays(item.reminderDays)
    }
  }

  function onSetPinned() {
    setItems(items.map(i => i.id === item.id ? {...i, pinned: !i.pinned} : {...i}))
    scrollEl.current.scrollTo({left: scrollEl.current.children[0].clientWidth+1})
  }

  useOutsideClick(() => {
    if (item.lastAssessed) {
      setItems(items.map(i => ({...i, lastAssessed: false}) ))
    }
    if (item.settingReminder) {
      setItems(items.map(i => i.id === item.id ? {...i, settingReminder: false} : {...i} ))
    }
  }, itemEl, {item, setItems})

  useEffect(() => {
    if (!item.settingReminder) {
      scrollEl.current.scrollTo({left: scrollEl.current.children[0].clientWidth+1})
      scrollEl.current.classList.remove('stop-scroll')
    }
    if (item.reminderDays.length > 0) {
      if (item.reminderDays.includes(todayNum)
        && !assessments.some(ass => ass.item_id === item.id && isItToday(ass.last.date))) itemContainer.current.classList.add('reminder')
    }
    itemContainer.current.classList.remove('hiding-animation')
  }, [assessments, item.id, item.reminderDays, item.settingReminder, item.lastAssessed])

  const assessmentProps = {
    colorClasses, borderColorClasses, item, setItems, setAssessments, setToastData
  }



  return (
    <li className={`hide-able tracker-item relative rounded-lg touch-manipulation hiding-animation ${item.lastAssessed ? 'last-assessed' : ''}`.trim()}
      ref={itemContainer}
      style={animationDurationStyle}
    >
      <div className="hide-able grid-rows-[1fr] overflow-clip rounded-lg" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} ref={itemEl}>

        <div
            className="grid grid-cols-[auto_100%_100%] gap-px overflow-x-scroll overflow-y-hidden [&.stop-scroll]:overflow-hidden invisible-scroll scroll-smooth snap-x snap-mandatory grid-rows-[80px]"
            onScroll={onScroll} ref={scrollEl}
        >
          <div className="flex snap-start snap-always">
            <div onClick={onSetPinned} className="bg-sky-800 w-20 grid place-items-center">
              <Pin className="size-8"/>
            </div>

            <div onClick={onSetReminder}
              className="bg-[color-mix(in_oklab,var(--color-yellow-500)_100%,var(--color-amber-600)_100%)] w-20 grid place-items-center"
            >
              <Clock className="size-8"/>
            </div>
          </div>

          <div className="snap-start snap-always flex">
            <div className={`flex-1 flex items-center px-6 text-white text-left ${colorClasses}`}>
              {children}
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