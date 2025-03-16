import TrackerList from "@/components/tracker/TrackerList"
import { memo } from "react"

function Content(props) {
  return (
    <main className="min-h-dvh min-w-screen p-4 sm:p-8 flex flex-col justify-end pb-25 sm:pb-29">
      <TrackerList items={props.items} data={props} />
    </main>
  )
}

export default memo(Content)