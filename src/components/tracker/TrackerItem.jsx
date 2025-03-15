import Trash from "@/assets/trash.svg?react"
import {useEffect, useRef, useState} from "react"
import useDialog from "@/hooks/useDialog"
import AssessmentScroller from "@/components/tracker/AssessmentScroller"
import { useOutsideClick } from "@/hooks/useOutsideClick"

function TrackerItem({children, item, data}) {
  const {
    setItems,
    assessments,
    setAssessments,
    setToastData,
    setDialogData
  } = data

  const itemEl = useRef(null)
  const scrollEl = useRef(null)

  const wasSettingReminder = useRef(false)
  const dontDelete = useRef(false)

  const [touchEnded, setTouchEnded] = useState(true)
  const [deleting, setDeleting] = useState(false)


  const sizeClasses = item.priority === 'max' ? 'grid-rows-[128px]' : 'grid-rows-[80px]'

  const colorClasses = item.priority === 'min' ? 'bg-slate-800'
    : item.priority === 'max' ? 'bg-sky-800' : 'bg-slate-700'

  const borderColorClasses = item.priority === 'min' ? 'border-slate-950'
    : item.priority === 'max' ? 'border-slate-800' : 'border-slate-900/80'

  const trashClasses = item.priority === 'max' ? 'size-12' : 'size-8'

  function del() {
    itemEl.current.classList.add('hiding-animation')
    setTimeout(() => {
      setItems(items => items.toSpliced(items.indexOf(item), 1))
    }, 200)
  }

  const confirmDelete = useDialog(setDialogData,{
    Icon: Trash,
    title: `Deleting "${item.title}"`,
    message: 'This item and it\'s data will be deleted. Delete anyway?'
  })

  async function deleteItem() {
    setDeleting(true)

    if (!assessments.find(bank => bank.id === item.id)) {
      del()
    } else {
      const promise = await confirmDelete()

      if (promise) {
        del()
      } else {
        scrollEl.current.scrollTo({left: scrollEl.current.children[0].clientWidth+1})
        setDeleting(false)
        setTouchEnded(false)
      }
    }
  }

  function onTouchStart() {
    setTouchEnded(false)
  }

  function onTouchEnd() {
    setTouchEnded(true)
  }

  function onScroll(e) {
    if (e.target.scrollLeft === 0) {
      setItems(prev => prev.map(i => i.id === item.id ? {...i, settingReminder: true} : {...i, settingReminder: false} ))
      wasSettingReminder.current = true
    }

    if (!item.settingReminder) {
      if (!dontDelete.current) {
        (e.target.scrollLeft > e.target.clientWidth/2 && touchEnded && !deleting) && deleteItem()
      } else {
        if (e.target.scrollLeft < scrollEl.current.children[0].clientWidth+1 && wasSettingReminder.current) {
          console.log('here')
          scrollEl.current.classList.add('stop-scroll')
        } else {
          scrollEl.current.scrollTo({left: scrollEl.current.children[0].clientWidth+1, behavior: 'instant'})
          wasSettingReminder.current = false
          dontDelete.current = false
          setTimeout(() => {
            scrollEl.current.classList.remove('stop-scroll')
          }, 5000)
        }
      }
    } else if (wasSettingReminder.current) {
      setItems(prev => prev.map(i => i.id === item.id ? {...i, settingReminder: false} : {...i} ))
    }
  }

  useOutsideClick(() => {
    if (item.lastAssessed) {
      setItems(prev => prev.map(i => ({...i, lastAssessed: false}) ))
    }
  }, itemEl, {item, setItems})

  useEffect(() => {
    if (!item.settingReminder) {
      scrollEl.current.scrollTo({left: scrollEl.current.children[0].clientWidth+1})
      if (wasSettingReminder.current) {
        dontDelete.current = true
      }
    }
  }, [item.settingReminder])

  return (
    <li className={`tracker-item relative rounded-lg ${item.lastAssessed && 'last-assessed'}`}>
      <div className={`hide-able grid-rows-[1fr] overflow-clip rounded-lg`}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} ref={itemEl}
      >

        <div
          className={`grid grid-cols-[auto_100%_100%] gap-px overflow-x-scroll overflow-y-hidden [&.stop-scroll]:overflow-hidden invisible-scroll scroll-smooth snap-x snap-mandatory ${sizeClasses}`.trim()}
          onScroll={onScroll} ref={scrollEl}
        >
          <div className="snap-start snap-always w-10 bg-amber-500">
            XD
          </div>

          <div className="snap-start snap-always flex">
            <div className={`flex-1 flex items-center px-6 text-white text-left ${colorClasses}`}>
              {children}
            </div>

            <AssessmentScroller color={colorClasses} borderColor={borderColorClasses} item={item} setItems={setItems} setToast={setToastData} />
          </div>

          <div className="bg-red-500 snap-start flex px-4 relative">
            <Trash className={`absolute top-1/2 -translate-y-1/2 ${trashClasses}`.trim()}/>
          </div>
        </div>
      </div>
    </li>
  )
}

export default TrackerItem