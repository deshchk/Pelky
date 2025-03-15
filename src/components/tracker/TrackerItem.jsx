import Trash from "@/assets/trash.svg?react"
import Clock from "@/assets/clock.svg?react"
import {useEffect, useRef, useState} from "react"
import useDialog from "@/hooks/useDialog"
import AssessmentScroller from "@/components/tracker/AssessmentScroller"
import DaysSelector from "@/components/atoms/DaysSelector"
import { useOutsideClick } from "@/hooks/useOutsideClick"

function TrackerItem({children, item, data}) {
  const {
    items,
    setItems,
    assessments,
    setAssessments,
    setToastData,
    setDialogData
  } = data


  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const todayString = new Intl.DateTimeFormat("en-US", {weekday: "long"}).format(new Date()).toLowerCase()
  const todayNum = days.indexOf(todayString) // 0-6


  const itemContainer = useRef(null)
  const itemEl = useRef(null)
  const scrollEl = useRef(null)

  const touches = useRef(0)
  const wasSettingReminder = useRef(false)

  const [touchEnded, setTouchEnded] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [selectedDays, setSelectedDays] = useState(item.reminderDays)

  const sizeClasses = item.priority === 'max' ? 'grid-rows-[128px]' : 'grid-rows-[80px]'

  const colorClasses = item.priority === 'min' ? 'bg-slate-800'
    : item.priority === 'max' ? 'bg-sky-800' : 'bg-slate-700'

  const borderColorClasses = item.priority === 'min' ? 'border-slate-950'
    : item.priority === 'max' ? 'border-slate-800' : 'border-slate-900/80'



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
      e.target.scrollTo({left: e.target.children[0].clientWidth+1})
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

    if (!assessments.find(bank => bank.id === item.id)) {
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
    Custom: () => <DaysSelector selectedDays={selectedDays} setSelectedDays={setSelectedDays} />
  })

  async function onSetReminder(e) {
    const promise = await reminderDialog()

    if (promise) {
      setItems(items.map(i => i.id === item.id ? {...i, reminderDays: promise} : {...i}))
      !promise.includes(todayNum) && itemContainer.current.classList.remove('reminder')
    } else {
      setSelectedDays(item.reminderDays)
    }
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
      item.reminderDays.includes(todayNum) && itemContainer.current.classList.add('reminder')
    }
  }, [item.reminderDays, item.settingReminder, todayNum])



  return (
    <li className={`tracker-item relative rounded-lg touch-manipulation ${item.lastAssessed ? 'last-assessed' : ''}`.trim()} ref={itemContainer}>
      <div className={`hide-able grid-rows-[1fr] overflow-clip rounded-lg`}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} ref={itemEl}
      >

        <div
          className={`grid grid-cols-[auto_100%_100%] gap-px overflow-x-scroll overflow-y-hidden [&.stop-scroll]:overflow-hidden invisible-scroll scroll-smooth snap-x snap-mandatory ${sizeClasses}`.trim()}
          onScroll={onScroll} ref={scrollEl}
        >
          <div onClick={onSetReminder} className={`bg-[color-mix(in_oklab,var(--color-yellow-500)_100%,var(--color-amber-600)_100%)] snap-start snap-always w-20 grid place-items-center`}>
            <Clock className={`${item.priority === 'max' ? 'size-10' : 'size-8'}`} />
          </div>

          <div className="snap-start snap-always flex">
            <div className={`flex-1 flex items-center px-6 text-white text-left ${colorClasses}`}>
              {children}
            </div>

            <AssessmentScroller color={colorClasses} borderColor={borderColorClasses} item={item} setItems={setItems} setToast={setToastData} />
          </div>

          <div className="bg-red-500 snap-end flex px-4 relative">
            <Trash className={`absolute top-1/2 -translate-y-1/2 ${item.priority === 'max' ? 'size-11' : 'size-9'}`}/>
          </div>
        </div>
      </div>
    </li>
  )
}

export default TrackerItem