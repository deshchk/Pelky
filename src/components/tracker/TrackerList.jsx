import TrackerItem from "@/components/tracker/TrackerItem"
import {useEffect, useRef} from "react"
import Droplets from "@/assets/droplets.svg?react"
import { setRandomInterval } from "@/utils"

function TrackerList({items, data}) {
  const listContainer = useRef(null)
  const listEl = useRef(null)
  const topGradient = useRef(null)
  const dropLogo = useRef(null)
  const dropLogoBlur = useRef(null)
  const eyesEl = useRef(null)

  function onScroll(e) {
    const stPercent = Math.min(100, e.target.scrollTop)
    topGradient.current.style.setProperty("opacity", stPercent + "%")
  }

  useEffect(() => {
    dropLogo.current.classList.contains('loading') && dropLogo.current.classList.remove('loading')
    dropLogoBlur.current.classList.contains('loading') && dropLogoBlur.current.classList.remove('loading')

  if (eyesEl.current) {
    setRandomInterval(() => {
      eyesEl.current?.style.setProperty("--blinkPercent", '0%')
      setTimeout(() => {
        eyesEl.current?.style.setProperty("--blinkPercent", '100%')
      },100)
    }, 3500, 12500, 0.1)
  }

  }, [items.length])

  return (
      <div className="grid grid-cols-1 h-full empty:!hidden overflow-y-auto invisible-scroll pt-5 sm:pt-10" onScroll={onScroll} ref={listContainer}>

        <div className={`
            fixed -left-60 top-0 w-[calc(100%+480px)] z-20 h-30 bg-radial-[at_50%_150%] from-transparent from-0% via-transparent via-40% to-slate-900 to-60%
            pointer-events-none transition-opacity duration-500 opacity-0
          `} ref={topGradient}
        ></div>
        <div className="z-30 w-full fixed left-0 top-0 h-8 grid place-items-center grid-cols-1 grid-rows-1">
          <Droplets className="col-start-1 col-end-2 row-start-1 row-end-2 w-14 mt-4 text-sky-600 drop-drop-shadow opacity-0 loading transition-opacity duration-[3s] [&:not(.loading)]:opacity-100" ref={dropLogoBlur} />
          <Droplets className="col-start-1 col-end-2 row-start-1 row-end-2 w-14 mt-4 text-sky-600 opacity-0 loading transition-opacity duration-1000 [&:not(.loading)]:opacity-100" ref={dropLogo} />
        </div>

        {items.length > 0 ? (
            <ul className="self-end grid grid-cols-1 place-items-center gap-5 sm:gap-8 pt-10 pb-25 sm:pb-29" ref={listEl}>
              {items.map((item, i) => (
                <TrackerItem key={item.id} item={item} data={data} itemIndex={i + 1}>
                  {item.title}
                </TrackerItem>
              ))}
            </ul>
            )
            :
            (
              <div className="fixed inset-0">
                <div className="relative size-full grid place-items-center">
                  <div className="text-xl text-slate-600 font-medium">
                    <p
                      className="text-center text-3xl mb-2 motion-safe:animate-[left-right_5s_ease-in-out_infinite] [--blinkPercent:100%] [mask-image:_linear-gradient(to_top,black_var(--blinkPercent),_transparent_var(--blinkPercent))]"
                      ref={eyesEl}
                    >
                        👀
                    </p>
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