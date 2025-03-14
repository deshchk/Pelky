import Options from "@/assets/options.svg?react"
import Trash from "@/assets/trash.svg?react"
import { useRef, useState } from "react"
import useDialog from "@/hooks/useDialog"
import AssessmentScroller from "@/components/tracker/AssessmentScroller"

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

  const [touchEnded, setTouchEnded] = useState(true)
  const [deleting, setDeleting] = useState(false)


  const sizeClasses = item.priority === 'max' ? 'grid-rows-[128px]' : 'grid-rows-[80px]'

  const colorClasses = item.priority === 'min' ? 'bg-slate-800 hover:bg-slate-900 focus:bg-slate-900'
    : item.priority === 'max' ? 'bg-sky-800 hover:bg-sky-900 focus:bg-sky-900'
    : 'bg-slate-700 hover:bg-slate-800 focus:bg-slate-800'

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
        scrollEl.current.scrollTo({left: 0})
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
    if (e.target.scrollLeft > e.target.clientWidth/2 && touchEnded && !deleting) deleteItem()
  }


  return (
    <div className="relative">
      <li className={`grid grid-rows-[1fr] hide-able overflow-clip transition duration-300 rounded-lg`}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} ref={itemEl}
      >

        <div
          className={`grid grid-cols-[100%_100%] overflow-x-scroll invisible-scroll scroll-smooth snap-x snap-mandatory ${sizeClasses}`.trim()}
          onScroll={onScroll} ref={scrollEl}
        >
          <div className="snap-start flex">
            <button className={`${colorClasses} px-4 text-white border-r ${borderColorClasses}`.trim()}>
              <Options className="size-5"/>
            </button>

            <div className={`flex-1 flex items-center px-4 text-white text-left ${colorClasses}`}>
              {children}
            </div>

            <AssessmentScroller color={colorClasses} borderColor={borderColorClasses} item={item} setToast={setToastData} />
          </div>

          <div className="bg-red-500 snap-start flex px-4 relative">
            <Trash className={`absolute top-1/2 -translate-y-1/2 ${trashClasses}`.trim()}/>
          </div>
        </div>
      </li>
    </div>
  )
}

export default TrackerItem