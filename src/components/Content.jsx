import TrackerList from "@/components/tracker/TrackerList"
import { memo, useRef } from "react"

function Content({items, setItems, assessments, setAssessments, setToastData, setDialogData}) {
  const mainEl = useRef(null)

  const listProps = {
    items,
    setItems,
    assessments,
    setAssessments,
    setToastData,
    setDialogData,
  }



  return (
    <main className="min-h-dvh min-w-screen p-4 sm:p-8 flex flex-col justify-end pb-25 sm:pb-29" ref={mainEl}>
      <TrackerList items={items} data={listProps} />
    </main>
  )
}

export default memo(Content)