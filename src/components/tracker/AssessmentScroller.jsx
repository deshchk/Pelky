import { useEffect, useRef, useState } from "react"
import { newID } from "@/utils"

function AssessmentScroller({color, borderColor, item, setToast, setItems}) {

  const scroller = useRef(null)
  const scrollerOverlay = useRef(null)
  const middleEl = useRef(null)

  const [currentAssessment, setCurrentAssessment] = useState(null)

  useEffect(() => {
    middleEl.current && middleEl.current.scrollIntoView({block: 'center', behavior: 'instant'})
  }, [])

  function saveAssessment(assessment) {
    console.log('saved: ', assessment)
    scrollerOverlay.current.classList.remove('animate')
    middleEl.current.scrollIntoView({block: 'center', behavior: 'instant'})
    handleSuccess()
  }

  function handleSuccess() {
    const toastID = newID()
    const toast = {
      id: toastID,
      message: 'Saved!',
      time: 3000,
      type: 'success',
      size: 'small'
    }

    setToast(toasts => toasts.concat([toast]))
    setItems(prev => prev.map(i => i.id === item.id ? {...i, lastAssessed: true} : {...i, lastAssessed: false} ))

    setTimeout(() => {
      setToast(toasts => toasts.toSpliced(toasts.indexOf(toast), 1))
    }, toast.time)
  }

  const timeoutAnimate = useRef(null)
  const timeoutSave = useRef(null)
  function onScroll(e) {
    const itemSize = e.target.scrollHeight/11
    const scrolledIndex = Math.floor((e.target.scrollTop + itemSize/2) / itemSize)
    const currentValue = 10-scrolledIndex-5

    const colorVar = `--color-${color.split(' ')[0].slice(3)}`
    const tint = ['--color-red-500', '--color-green-500']
    const colorPercent = Math.abs(scrolledIndex - 5)/5*100

    if (currentAssessment === currentValue) {
      clearTimeout(timeoutAnimate.current)
      clearTimeout(timeoutSave.current)
      scrollerOverlay.current.classList.remove('animate')
      timeoutAnimate.current = setTimeout(() => {
        if (currentAssessment === currentValue) {
          scrollerOverlay.current.classList.add('animate')
        }
        timeoutSave.current = setTimeout(() => {
          saveAssessment(currentAssessment)
        }, 1550)
      }, 1000)
    } else {
      setCurrentAssessment(prev => prev !== currentValue ? currentValue : prev)
    }

    if (scrolledIndex !== 5) {
      scroller.current.style.backgroundColor = `
        color-mix(in oklab, var(${colorVar}) ${100-colorPercent}%, var(${scrolledIndex > 5 ? tint[0] : tint[1]}) ${colorPercent-20}%)
      `.trim()
    } else {
      scroller.current.style.backgroundColor = `var(${colorVar})`
    }
  }

  return (
    <>
      <div className={`relative w-24 border-l grid ${borderColor}`}>
        <div className={`assessment-scroller invisible-scroll ${color}`} onScroll={onScroll} ref={scroller}>
          {Array.from(Array.from(Array(11).keys()).map(key => key - 5)).reverse().map(mark => (
            <div key={mark.toString()} ref={mark === 0 ? middleEl : null} className={`
              grid place-items-center snap-center ${mark === 0 && 'snap-always'} font-medium
              ${item.priority === 'max' ? 'text-2xl' : 'text-xl'}
            `.trim()}
            >
              <span className="relative z-10">{mark}</span>
            </div>
          ))}
        </div>
        <div className="assessment-scroller-overlay" ref={scrollerOverlay}>
          <div className="assessment-progress-bar"></div>
        </div>
      </div>
    </>
  )
}

export default AssessmentScroller