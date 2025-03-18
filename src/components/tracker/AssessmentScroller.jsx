import { useCallback, useEffect, useRef, useState } from "react"
import { newID } from "@/utils"
import { getSortedItems, saveAssessments } from "@/data"

function AssessmentScroller(props) {
  const {
    colorClasses,
    borderColorClasses,
    item,
    items,
    setItems,
    assessments,
    setAssessments,
    setToastData,
    setAnimationsInProgress,
    itemEl,
    itemLoader
  } = props

  const scroller = useRef(null)
  const scrollerOverlay = useRef(null)
  const middleEl = useRef(null)

  const colorVar = useRef(`--color-${colorClasses.split(' ')[0].slice(3)}`)
  const loading = useRef(false)

  const [currentAssessment, setCurrentAssessment] = useState(null)

  const handleSuccess = useCallback(() => {
    const toastID = newID()
    const toast = {
      id: toastID,
      message: 'Saved!',
      time: 3000,
      type: 'success',
      size: 'small'
    }

    setToastData(toasts => toasts.concat([toast]))
    setItems(prev => prev.map(i => i.id === item.id ? {...i, lastAssessed: true} : {...i, lastAssessed: false} ))

    setTimeout(() => {
      setToastData(toasts => toasts.toSpliced(toasts.indexOf(toast), 1))
    }, toast.time)
  }, [item.id, setItems, setToastData])

  const saveAssessment = (assessment) => {
    const newAssessments = (prev) => prev.some(ass => ass.item_id === item.id) ?
      prev.map(ass =>
        ass.item_id === item.id ? ({
          ...ass,
          last: {
            id: newID(),
            value: assessment,
            date: new Intl.DateTimeFormat("en-AU", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "numeric", minute: "numeric"
            }).format(new Date()).toUpperCase(),
            note: null
          },
          past: [...ass.past, ass.last]
        }) : ass
      )
      :
      prev.concat({
        item_id: item.id,
        group_id: null,
        last: {
          id: newID(),
          value: assessment,
          date: new Intl.DateTimeFormat("en-AU", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "numeric", minute: "numeric"
          }).format(new Date()).toUpperCase(),
          note: null
        },
        past: []
      })

    setAssessments(prev => newAssessments(prev))
    saveAssessments(newAssessments(assessments))

    scrollerOverlay.current.classList.remove('animate')
    middleEl.current.scrollIntoView({block: 'center', behavior: 'instant'})

    if (
      getSortedItems(items, newAssessments(assessments)).indexOf(item) !== items.indexOf(item)
    ) {
      setTimeout(() => {
        itemEl.current.classList.add('loading-animation')
        itemLoader.current.classList.remove('loading-animation')
      },100)
      setTimeout(() => {
        setAnimationsInProgress(false)
        itemLoader.current.classList.add('loading-animation')
        itemEl.current.classList.remove('loading-animation')
      },800)
    }

    handleSuccess()
  }

  const timeoutAnimate = useRef(null)
  const timeoutSave = useRef(null)

  const onScroll = useCallback((e) => {
    if (loading.current) return

    const itemSize = e.target.scrollHeight/11
    const scrolledIndex = Math.floor((e.target.scrollTop + itemSize/2) / itemSize)
    const currentValue = 10-scrolledIndex-5

    const tint = ['--color-red-500', '--color-green-500']
    const colorPercent = Math.abs(scrolledIndex - 5)/5*100

    if (currentAssessment === currentValue) {
      clearTimeout(timeoutAnimate.current)
      clearTimeout(timeoutSave.current)
      scrollerOverlay.current.classList.remove('animate')
      timeoutAnimate.current = setTimeout(() => {
        if (currentAssessment === currentValue) {
          scrollerOverlay.current.classList.add('animate')
          setAnimationsInProgress(true)
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
        color-mix(in oklab, var(${colorVar.current}) ${100-colorPercent}%, var(${scrolledIndex > 5 ? tint[0] : tint[1]}) ${colorPercent-20}%)
      `.trim()
    } else {
      scroller.current.style.backgroundColor = `var(${colorVar.current})`
    }
  }, [currentAssessment, saveAssessment])

  useEffect(() => {
    loading.current = true
    middleEl.current && middleEl.current.scrollIntoView({block: 'center', behavior: 'instant'})
    setTimeout(() => {
      loading.current = false
    }, 100)
  }, [])

  useEffect(() => {
    colorVar.current = `--color-${colorClasses.split(' ')[0].slice(3)}`
    scroller.current.style.backgroundColor = `var(${colorVar.current})`
  }, [colorClasses])



  return (
    <div className={`[container-type:size] relative w-24 border-l flex size-full ${borderColorClasses}`}>
      <div className={`w-full h-[100cqh] assessment-scroller invisible-scroll ${colorClasses}`} onScroll={onScroll} ref={scroller}>
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].reverse().map(mark => (
          <div key={mark} ref={mark === 0 ? middleEl : null} className={`
            grid place-items-center snap-center ${mark === 0 && 'snap-always'} font-medium text-xl
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
  )
}

export default AssessmentScroller