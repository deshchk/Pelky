import TrackerItem from "@/components/tracker/TrackerItem"
import { useEffect, useRef } from "react"

function TrackerList({items, data}) {
  const listContainer = useRef(null)
  const listEl = useRef(null)

  useEffect(() => {
    listContainer.current.classList.remove('hiding-animation')
    setTimeout(() => {
      listEl.current.classList.remove('hiding')
    },200)
  }, [])

  return (
    <div className="hide-able grid-rows-[1fr] empty:!hidden hiding-animation" ref={listContainer}>
      {items.length > 0 && <ul className="grid grid-cols-1 gap-5 sm:gap-8 [&.hiding]:overflow-hidden hiding" ref={listEl}>
        {items.map(item => (
            <TrackerItem key={item.id} item={item} data={data}>{item.title}</TrackerItem>
        ))}
      </ul>}
    </div>
  )
}

export default TrackerList