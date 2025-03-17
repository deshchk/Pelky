import TrackerItem from "@/components/tracker/TrackerItem"
import { useEffect, useRef } from "react"
import Stars from "@/assets/stars.svg?react"

function TrackerList({items, data}) {
  const listContainer = useRef(null)
  const listEl = useRef(null)

  useEffect(() => {
    listContainer.current.classList.remove('hiding-animation')
    setTimeout(() => {
      listEl.current && listEl.current.classList.remove('hiding')
    },200)
  }, [items])

  return (
    <div className="hide-able grid-rows-[1fr] empty:!hidden hiding-animation" ref={listContainer}>
      {items.length > 0 ? <ul className="grid grid-cols-1 gap-5 sm:gap-8 [&.hiding]:overflow-hidden hiding" ref={listEl}>
        {items.map((item, i) => (
          <TrackerItem key={item.id} item={item} data={data} itemIndex={i+1}>
            {item.title}
          </TrackerItem>
        ))}
      </ul>
      : (
          <div className="fixed inset-0">
            <div className="relative size-full grid place-items-center">
              <div className="text-xl text-slate-600 font-medium">
                <p className="text-center text-3xl mb-2 motion-safe:animate-[left-right_5s_ease-in-out_infinite]">👀</p>
                <p>No items here yet</p>
              </div>

              <div className="absolute right-10 sm:right-20 bottom-30 px-5 py-2 bg-slate-800 text-slate-200 rounded-tl-md rounded-tr-md rounded-bl-md shadow-xl shadow-slate-950/20 opacity-90">
                Add a new one!
                <div className={`
                  absolute right-0 bottom-0 translate-y-full border-t-12 border-slate-800 [border-left:24px_solid_transparent]
                `}></div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default TrackerList