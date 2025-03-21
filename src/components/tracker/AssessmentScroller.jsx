import { useCallback, useEffect, useRef, useState } from "react"
import { handleSmallToast, loadItemsInNeed, newID } from "@/utils"
import { getSortedItems, saveAssessments } from "@/data"
import useDialog from "@/hooks/useDialog"

function AssessmentScroller(props) {
  const {
    colorClasses,
    borderColorClasses,
    item,
    items,
    setItems,
    changingName,
    assessments,
    setAssessments,
    setToastData,
    setDialogData,
    setAnimationsInProgress,
    setAssessmentOptions,
    cancelingAssessment,
    addingAssessmentNote,
    itemEl,
    itemLoader,
    itemExtended
  } = props

  const scroller = useRef(null)
  const scrollerOverlay = useRef(null)
  const middleEl = useRef(null)

  const colorVar = useRef(`--color-${colorClasses.split(' ')[0].slice(3)}`)
  const loading = useRef(true)
  const currentNote = useRef("")

  const [currentAssessment, setCurrentAssessment] = useState(null)

  function saveCurrentAssessment(assessment) {
    console.log(currentNote.current)
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
    saveAssessments(newAssessments(assessments))

    setAssessmentOptions(false)

    if (scrollerOverlay.current) {
      scrollerOverlay.current?.classList.remove('animate')
      middleEl.current?.scrollIntoView({block: 'center', behavior: 'instant'})

      loadItemsInNeed(
        getSortedItems(items, newAssessments(assessments)).indexOf(item) !== items.indexOf(item),
        itemEl, itemLoader, setAnimationsInProgress
      )

      setItems(prev => prev.map(i => i.id === item.id ? {...i, lastAssessed: true} : {...i, lastAssessed: false} ))
      handleSmallToast('success', currentNote.current ? 2 : 1, setToastData)
    }
  }

  function cancelCurrentAssessment() {
    timeoutAnimate.current && clearTimeout(timeoutAnimate.current)
    timeoutSave.current && clearTimeout(timeoutSave.current)

    handleSmallToast('error', 2, setToastData)
    middleEl.current?.scrollIntoView({block: 'center', behavior: 'instant'})
    scrollerOverlay.current?.classList.remove('animate')

    cancelingAssessment.current = false
  }

  const noteDialog = useDialog(setDialogData,{
    type: 'add-note-dialog',
    item: item,
    assessment: currentAssessment
  })

  async function noteCurrentAssessment() {
    timeoutAnimate.current && clearTimeout(timeoutAnimate.current)
    timeoutSave.current && clearTimeout(timeoutSave.current)

    scrollerOverlay.current?.classList.remove('animate')

    const promise = await noteDialog()

    if (promise) {
      currentNote.current = promise
      saveCurrentAssessment(currentAssessment)
    } else {
      saveCurrentAssessment(currentAssessment)
    }

    middleEl.current?.scrollIntoView({block: 'center', behavior: 'instant'})
    addingAssessmentNote.current = false
  }

  const timeoutAnimate = useRef(null)
  const timeoutSave = useRef(null)

  const onScroll = useCallback((e) => {
    if (loading.current || changingName.current || itemExtended.current) return

    const itemSize = e.target.scrollHeight/11
    const scrolledIndex = Math.floor((e.target.scrollTop + itemSize/2) / itemSize)
    const currentValue = 10-scrolledIndex-5

    const tint = ['--color-red-500', '--color-green-500']
    const colorPercent = Math.abs(scrolledIndex - 5)/5*100

    if (currentAssessment === currentValue) {
      clearTimeout(timeoutAnimate.current)
      clearTimeout(timeoutSave.current)
      scrollerOverlay.current.classList.remove('animate')
      setAssessmentOptions(true)
      timeoutAnimate.current = setTimeout(() => {

        if (currentAssessment === currentValue && !cancelingAssessment.current) {
          scrollerOverlay.current?.classList.add('animate')
          setAnimationsInProgress(true)
          timeoutSave.current = setTimeout(() => {
            if (!cancelingAssessment.current) {
              saveCurrentAssessment(currentAssessment)
            }
          }, 2550)
        }
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
  }, [changingName, currentAssessment, setAnimationsInProgress, setAssessmentOptions])

  useEffect(() => {
    loading.current = true
    middleEl.current && middleEl.current.scrollIntoView({block: 'center', behavior: 'instant'})
    setTimeout(() => {
      loading.current = false
      middleEl.current && middleEl.current.scrollIntoView({block: 'center', behavior: 'instant'})
    }, 100)
  }, [])

  useEffect(() => {
    colorVar.current = `--color-${colorClasses.split(' ')[0].slice(3)}`
    scroller.current.style.backgroundColor = `var(${colorVar.current})`
  }, [colorClasses])

  useEffect(() => {
    if (cancelingAssessment.current) {
      cancelCurrentAssessment()
    }
  }, [cancelingAssessment.current])

  useEffect(() => {
    if (addingAssessmentNote.current) {
      noteCurrentAssessment()
    }
  }, [addingAssessmentNote.current])



  return (
    <div className={`[container-type:size] relative w-24 border-l flex size-full ${borderColorClasses} pointer-events-none [&.scrollable]:pointer-events-auto ${!itemExtended.current ? 'scrollable' : ''}`}>
      <div className={`w-full h-[100cqh] assessment-scroller invisible-scroll [&.stopped]:!overflow-hidden ${colorClasses} ${itemExtended.current ? 'stopped' : ''}`} onScroll={onScroll} ref={scroller}>
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].reverse().map(mark => (
          <div key={mark} ref={mark === 0 ? middleEl : null} className={`
            grid place-items-center snap-center ${mark === 0 && 'snap-always'} font-medium text-xl
          `.trim()}>
            <span className="relative z-20">{mark}</span>
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