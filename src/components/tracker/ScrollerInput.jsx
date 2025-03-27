import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { handleSmallToast, newID } from "@/utils"
import useDialog from "@/hooks/useDialog"

export default function ScrollerInput ({item, scale, scaleDirection, setters, options}) {
  const {
    setAnimationsInProgress,
    setSwipingBlocked,
    setToastData,
    setDialogData,
    setAssessments,
  } = setters

  const {
    cancelAssessment, noteAssessment, setShowAssessmentOptions
  } = options

  const scrollerWrapper = useRef(null)
  const wrapperWrapper = useRef(null)

  const getMinMax = () => {
    switch (scaleDirection) {
      case 'positive':
        return { min: 0, max: scale };
      case 'negative':
        return { min: -scale, max: 0 };
      case 'both':
      default:
        return { min: -scale, max: scale };
    }
  }

  const { min, max } = getMinMax()
  const scaleValues = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const getMarkIndex = scrollTop => Math.floor((scrollTop + scrollerWrapper.current?.clientHeight/2) / scrollerWrapper.current?.clientHeight)
  const tint = ['--color-red-500', '--color-green-500']


  const [animating, setAnimating] = useState(false)
  const countdownTimeout = useRef(null)
  const savingTimeout = useRef(null)
  const dontHandleScroll = useRef(true)
  const refresher = useRef(null)

  const currentAssessment = useRef(null)
  const currentNote = useRef('')


  function resetScroller() {
    setAnimationsInProgress(false)
    setAnimating(false)

    setShowAssessmentOptions(false)
    cancelAssessment.current = false
    noteAssessment.current = false

    refresher.current = newID()
  }


  function cancelCurrentAssessment() {
    countdownTimeout.current && clearTimeout(countdownTimeout.current)
    savingTimeout.current && clearTimeout(savingTimeout.current)

    handleSmallToast('error', 2, setToastData)
    resetScroller()
  }


  const noteDialog = useDialog(setDialogData,{
    type: 'add-note-dialog',
    item: item,
    assessment: currentAssessment.current
  })

  async function noteCurrentAssessment() {
    countdownTimeout.current && clearTimeout(countdownTimeout.current)
    savingTimeout.current && clearTimeout(savingTimeout.current)

    const promise = await noteDialog()
    if (promise) currentNote.current = promise

    saveCurrentAssessment(currentAssessment.current)
    resetScroller()
  }


  function handleScroll(e) {
    if (dontHandleScroll.current) return
    setSwipingBlocked(true)

    const currentIndex = getMarkIndex(e.target.scrollTop)
    const currentValue = scaleValues[currentIndex]
    // const zeroScrollTop = ((scaleValues.length/2) * scrollerWrapper.current?.clientHeight) - scrollerWrapper.current?.clientHeight/2
    const colorPercent = Math.abs(currentIndex - Math.abs(min))/max*100

    wrapperWrapper.current.style.backgroundColor = `
        color-mix(in oklab, transparent ${100-colorPercent}%, var(${currentIndex > scaleValues.length/2 ? tint[0] : tint[1]}) ${colorPercent}%)
      `.trim()

    clearTimeout(countdownTimeout.current)
    clearTimeout(savingTimeout.current)
    setAnimating(false)
    setShowAssessmentOptions(true)
    currentAssessment.current = currentValue

    countdownTimeout.current = setTimeout(() => {
      if (!cancelAssessment.current) {
        setAnimating(true)
        setAnimationsInProgress(true)
        setSwipingBlocked(false)
      }
    }, 1000)
    savingTimeout.current = setTimeout(() => {
      if (!cancelAssessment.current) {
        saveCurrentAssessment(currentAssessment.current)

        resetScroller()
      }
    }, 3600)
  }



  function saveCurrentAssessment(assessment) {
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
                note: currentNote.current || null
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
            note: currentNote.current || null
          },
          past: []
        })

    setAssessments(prev => newAssessments(prev))

    setShowAssessmentOptions(false)

    handleSmallToast('success', currentNote.current ? 2 : 1, setToastData)
    resetScroller()
  }



  useLayoutEffect(() => {
    dontHandleScroll.current = true
    if (scrollerWrapper.current && !animating) {
      wrapperWrapper.current.style.backgroundColor = 'transparent'
      scrollerWrapper.current.scrollTo({
        top: ((scaleValues.length/2) * scrollerWrapper.current.clientHeight) - scrollerWrapper.current.clientHeight/2,
        behavior: 'instant'
      })
      setTimeout(() => {
        dontHandleScroll.current = false
      }, 50)
    }
  }, [refresher.current, item.pinned, item.reminderDays, item.index, animating, cancelAssessment.current, noteAssessment.current, scaleValues.length])

  useEffect(() => {
    const ac = new AbortController()
    scrollerWrapper.current?.addEventListener("scroll", handleScroll, { passive: false, signal: ac.signal })
    setTimeout(() => {
      dontHandleScroll.current = false
    }, 69)
    return () => ac.abort()
  }, [])

  useEffect(() => {
    if (cancelAssessment.current) {
      cancelCurrentAssessment()
    }
  }, [cancelAssessment])

  useEffect(() => {
    if (noteAssessment.current) {
      noteCurrentAssessment()
    }
  }, [noteAssessment])

  return (
      <div className="relative h-full w-18 border-l border-dashed border-slate-700 text-xl bg-slate-900" ref={wrapperWrapper}>
        <div
          ref={scrollerWrapper}
          className="scroller-input invisible-scroll"
        >
          {
            scaleValues.reverse().map(mark => (
              <div
                key={String(mark)}
                className={`h-[100cqh] grid place-items-center snap-center ${mark === 0 ? 'snap-always' : ''}`}
              >
                {mark}
              </div>
            ))
          }
        </div>
        <div
          className="absolute inset-0 grid pointer-events-none z-10"
          style={{
            gridTemplateRows: animating ? '1fr' : '0fr',
            transition: animating ? 'grid-template-rows 2.5s linear' : 'none',
          }}
        >
          <div className="bg-black/35"></div>
        </div>
      </div>
  )
}