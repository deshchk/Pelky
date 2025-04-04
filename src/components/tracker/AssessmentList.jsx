import { useEffect, useRef } from "react"
import { setRandomInterval } from "@/services/utils"
import AssessmentItem from "@/components/tracker/AssessmentItem"

function AssessmentList({ item, assessments, setter }) {
  const listContainer = useRef(null)
  const listEl = useRef(null)
  const eyesEl = useRef(null)

  const botGradientRadial = useRef(null)
  const botGradientLinear = useRef(null)

  const startPos = useRef({x: 0, y: 0})
  const listScrolling = useRef(false)
  const listScrollingTimeout = useRef(null)

  function onTouchStart(e) {
    startPos.current.x = e.touches[0].clientX
    startPos.current.y = e.touches[0].clientY
  }

  function onScroll(e) {
    const currentPos = e.touches ? {x: e.touches[0].clientX, y: e.touches[0].clientY} : {x: 0, y: 0}
    const diffX = Math.abs(currentPos.x - startPos.current.x)
    const diffY = Math.abs(currentPos.y - startPos.current.y)

    updateGradient()

    if (e.target.scrollHeight > e.target.clientHeight + 136 && e.target.scrollTop > 0) {
      setter.collapseTitle(true)
    } else if (e.target.scrollTop === 0) {
      setter.collapseTitle(false)
    }

    listScrollingTimeout.current && clearTimeout(listScrollingTimeout.current)
    listScrolling.current = true
    setTimeout(() => {
      if (diffY > diffX+2) {
        listScrolling.current = false
      }
    }, 100)
  }

  function updateGradient() {
    const botPercent = Math.min(100, Math.abs(listContainer.current.scrollHeight-(listContainer.current.clientHeight+listContainer.current.scrollTop)))
    botGradientRadial.current.style.setProperty("opacity", botPercent + "%")
    botGradientLinear.current.style.setProperty("opacity", Math.pow(botPercent, 2) + "%")
  }

  function onTouchEnd() {
    listScrolling.current = false
  }

  useEffect(() => {
    if (eyesEl.current) {
      setRandomInterval(() => {
        eyesEl.current?.style.setProperty("--blinkPercent", '0%')
        setTimeout(() => {
          eyesEl.current?.style.setProperty("--blinkPercent", '100%')
        },100)
      }, 3500, 12500, 0.01)
    }
  }, [assessments.entries.length])

  useEffect(() => {
    updateGradient()
    setTimeout(() => {
      listScrolling.current = false
    }, 100)
  }, [])

  return (
    <div ref={listContainer}
      className="grid grid-cols-1 h-full empty:!hidden overflow-y-auto invisible-scroll overscroll-none"
      onTouchStart={onTouchStart} onScroll={onScroll} onTouchEnd={onTouchEnd}
    >
      <div className="pointer-events-none fixed -left-60 bottom-41 w-[calc(100%+480px)] z-20 h-10">
        <div ref={botGradientRadial} className="absolute bottom-0 left-0 w-full h-10 bg-radial-[at_50%_150%] from-transparent from-0% via-transparent via-40% to-slate-900 to-60% opacity-0 transition-opacity duration-500 scale-y-[-1]"></div>
        <div ref={botGradientLinear} className="absolute bottom-0 left-0 w-full h-10 bg-linear-to-t from-slate-900 to-transparent opacity-0 transition-opacity duration-500"></div>
      </div>

      {assessments.entries.length > 0 ?
        (
          <ul
            className="self-end grid grid-cols-1 place-items-center py-10"
            ref={listEl}
          >
            {assessments.entries.map((ass, i) => (
              <AssessmentItem
                key={ass.id}
                item={item}
                ass={ass}
                listIndex={i + 1}
                listScrolling={listScrolling}
                setter={setter}
              />
            ))}
          </ul>
        )
        :
        (
          <div className="fixed inset-0">
            <div className="relative size-full grid place-items-center">
              <div className="text-xl text-slate-600 font-medium">
                <p ref={eyesEl}
                   className="text-center text-3xl mb-2 motion-safe:animate-[left-right_5s_ease-in-out_infinite] [--blinkPercent:100%] [mask-image:_linear-gradient(to_top,black_var(--blinkPercent),_transparent_var(--blinkPercent))]"
                > 👀 </p>
                <p>No assessments for this item yet</p>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default AssessmentList