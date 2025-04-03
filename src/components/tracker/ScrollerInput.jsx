import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { getSortedItems, loadData } from "@/services/data"
import { handleSmallToast, nbsps, newID } from "@/services/utils"
import useDialog from "@/hooks/useDialog"

export default function ScrollerInput ({options, item, listIndex, items, setters}) {
  const {
    setSwipingBlocked,
    setLoadingItem,
    setToastData,
    setDialogData,
    setItems,
    setAssessments,
  } = setters

  const {
    cancelAssessment, noteAssessment, setShowAssessmentOptions
  } = options

  const scrollerWrapper = useRef(null)
  const wrapperWrapper = useRef(null)

  const getMinMax = () => {
    if (item.scale) {
      switch (item.scale.type) {
        case 'positive':
          return { min: 0, max: item.scale.max }
        case 'negative':
          return { min: 0, max: item.scale.max }
        case 'both':
        default:
          return { min: -item.scale.max, max: item.scale.max }
      }
    } else {
      return { min: -10, max: 10 }
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
    setAnimating(false)
    setShowAssessmentOptions(false)
    setSwipingBlocked(false)

    refresher.current = newID()

    cancelAssessment.current = false
    noteAssessment.current = false
  }


  function cancelCurrentAssessment() {
    countdownTimeout.current && clearTimeout(countdownTimeout.current)
    savingTimeout.current && clearTimeout(savingTimeout.current)

    handleSmallToast('error', 2, setToastData)
    resetScroller()
  }

  const noteDialogProps = useCallback(() => ({
    type: 'add-note-dialog',
    item: item,
    assessment: currentAssessment.current
  }), [item, currentAssessment])

  const noteDialog = useDialog(setDialogData, noteDialogProps)

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
    setAnimating(false)
    setShowAssessmentOptions(true)

    const currentIndex = getMarkIndex(e.target.scrollTop)
    currentAssessment.current = scaleValues[currentIndex]

    const colorPercent = item.scale.type === 'both' || !item.scale ? Math.abs(currentIndex - Math.abs(min))/max*100 : (Math.abs(max-currentIndex)/max)*100
    wrapperWrapper.current.style.backgroundColor = `
      color-mix(in oklab, transparent ${100-colorPercent}%, var(${((item.scale.type === 'both' || !item.scale) && currentIndex > scaleValues.length/2) ? tint[0] : item.scale.type === 'negative' ? tint[0] : tint[1]}) ${colorPercent/2}%)
    `.trim()

    clearTimeout(countdownTimeout.current)
    clearTimeout(savingTimeout.current)

    countdownTimeout.current = setTimeout(() => {
      if (!cancelAssessment.current) {
        setAnimating(true)
      }
    }, 1000)
    savingTimeout.current = setTimeout(() => {
      if (!cancelAssessment.current) {
        saveCurrentAssessment(currentAssessment.current)
        resetScroller()
      }
    }, 3600)
  }

  function handleTouchEnd() {
    setTimeout(() => {
      setSwipingBlocked(false)
    }, 500)
  }



  async function saveCurrentAssessment(assessment) {
    const { assessments } = await loadData()

    const newAssessments = assessments.map(ass =>
      ass.item_id === item.id ? ({
        ...ass,
        entries: [{
          id: newID(),
          value: assessment,
          date: new Intl.DateTimeFormat("en-AU", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "numeric", minute: "numeric"
          }).format(new Date()).toUpperCase(),
          note: nbsps(currentNote.current) || null
        }].concat(ass.entries),
      }) : ass
    )

    function saveChanges() {
      const newIndex = (currentArray, object) => {
        const newArray = getSortedItems(currentArray, newAssessments)
        return currentArray.length-newArray.indexOf(newArray.find(y => y.id === object.id))
      }

      setAssessments(newAssessments)
      setItems(prev => getSortedItems(prev.map(i => i.id === item.id
        ? {...i, status: {...i.status, lastAssessed: true}, index: newIndex(prev, i)}
        : {...i, status: {...i.status, lastAssessed: false}, index: newIndex(prev, i)}
      ), newAssessments))
    }

    const nextItems = getSortedItems(items, newAssessments).toReversed()
    const nextIndex = nextItems.length-nextItems.indexOf(nextItems.find(i => i.id === item.id))

    if (Math.abs(nextIndex-item.index) > 1) {
      setLoadingItem(true)
      setTimeout(() => {
        saveChanges()
      }, 200)
    } else {
      saveChanges()
    }

    setShowAssessmentOptions(false)

    handleSmallToast('success', currentNote.current ? 2 : 1, setToastData)
    resetScroller()
  }



  useLayoutEffect(() => {
    if (scrollerWrapper.current && !animating) {
      dontHandleScroll.current = true
      wrapperWrapper.current.style.backgroundColor = 'transparent'
      scrollerWrapper.current.scrollTo({
        top: item.scale.type === 'both' || !item.scale ? ((scaleValues.length/2) * scrollerWrapper.current.clientHeight) - scrollerWrapper.current.clientHeight/2 : scrollerWrapper.current.scrollHeight,
        behavior: 'instant'
      })
      setTimeout(() => {
        dontHandleScroll.current = false
      }, 69)
    }
  }, [refresher.current, animating, item.pinned, item.reminderDays, item.index, listIndex, cancelAssessment.current, noteAssessment.current])

  useEffect(() => {
    const ac = new AbortController()
    scrollerWrapper.current?.addEventListener("scroll", handleScroll, { passive: false, signal: ac.signal })
    scrollerWrapper.current?.addEventListener("touchend", handleTouchEnd, { signal: ac.signal })
    return () => ac.abort()
  }, [])

  useEffect(() => {
    if (cancelAssessment.current) {
      cancelCurrentAssessment()
    }
  }, [cancelAssessment.current])

  useEffect(() => {
    if (noteAssessment.current) {
      noteCurrentAssessment()
    }
  }, [noteAssessment.current])

  return (
    <div className="relative h-full w-18 border-l border-slate-700 text-xl bg-slate-900" ref={wrapperWrapper}>
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