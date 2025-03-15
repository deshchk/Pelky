import TrackerItem from "@/components/tracker/TrackerItem"
import { useEffect, useRef } from "react"

function TrackerList({items, data}) {
  const listContainer = useRef(null)
  const listEl = useRef(null)

  const loadingTimeClasses = items[0] ?
    items[0].priority === 'min' ? '![transition:_grid-template-rows_.2s,_translate_.55s]' :
    items[0].priority === 'mid' ? '![transition:_grid-template-rows_.2s,_translate_.40s]' : '' : ''

  useEffect(() => {
    listContainer.current.classList.remove('hiding-animation')
    setTimeout(() => {
      listEl.current.classList.remove('hiding')
    },200)
  }, [])

  return (
    <div className={`hide-able grid-rows-[1fr] empty:!hidden hiding-animation ${loadingTimeClasses}`.trim()} ref={listContainer}>
      {items.length > 0 && <ul className="grid grid-cols-1 gap-4 [&.hiding]:overflow-hidden hiding" ref={listEl}>
        {items.map(item => (
            <TrackerItem key={item.id} item={item} data={data}>{item.title}</TrackerItem>
        ))}
      </ul>}
    </div>
  )
}

export default TrackerList