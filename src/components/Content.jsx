import TrackerList from "@/components/tracker/TrackerList"
import { memo } from "react"

function Content(props) {
  return (
    <main className="h-dvh min-w-full flex flex-col">
      <TrackerList items={props.items} data={props} />
    </main>
  )
}

export default memo(Content)