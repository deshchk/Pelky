import TrackerList from "@/components/tracker/TrackerList"
import { memo, useEffect, useRef } from "react"

function Content({items, setItems, assessments, setAssessments, setToastData, setDialogData}) {
  const mainEl = useRef(null)

  useEffect(() => {
    mainEl.current.scrollTo({top: mainEl.current.scrollHeight, behavior: 'instant'})
  }, [items])

  const listProps = {
    setItems,
    assessments,
    setAssessments,
    setToastData,
    setDialogData
  }

  return (
    <main className="min-h-dvh min-w-screen p-4 sm:p-8 flex flex-col justify-end gap-4 pb-24 sm:pb-28" ref={mainEl}>
      <TrackerList items={items.filter(item => item.priority === 'min')} data={listProps} />
      <TrackerList items={items.filter(item => item.priority === 'mid')} data={listProps} />
      <TrackerList items={items.filter(item => item.priority === 'max')} data={listProps} />
    </main>
  )
}

export default memo(Content)