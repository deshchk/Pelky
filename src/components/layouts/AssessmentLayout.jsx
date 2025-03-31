import { useContext } from "react"
import { useLoaderData } from "react-router"
import { AppContext } from "@/services/ctxs"
import AssessmentList from "@/components/tracker/AssessmentList"
import Chevron from "@/assets/chevron.svg?react"

function AssessmentLayout() {
  const { assessments } = useLoaderData()
  const { data, setter } = useContext(AppContext)

  const item = data.items.find((item) => item.id === assessments.item_id)

  const listProps = { item, assessments, setter }

  return (
    <div className="grid grid-cols-1 h-full empty:!hidden overflow-y-auto invisible-scroll">
      <div className="grid gap-10 place-items-center h-fit px-10 pt-20 pb-14">
        <div className="flex flex-col gap-1">
          <small className="text-xs text-center tracking-wide uppercase font-semibold text-slate-400">Assessments of</small>
          <span className="text-xl text-center font-medium">{item.title}</span>
        </div>

        <Chevron className="size-7 motion-safe:animate-[bobbing_2.5s_ease-in-out_infinite]"/>
      </div>

      <AssessmentList {...listProps} />
    </div>
  )
}

export default AssessmentLayout