import { useContext, useState } from "react"
import { useLoaderData } from "react-router"
import { AppContext } from "@/services/ctxs"
import AssessmentList from "@/components/tracker/AssessmentList"
import Chevron from "@/assets/chevron.svg?react"

function AssessmentLayout() {
  const { assessments } = useLoaderData()
  const { data, setter } = useContext(AppContext)

  const [collapseTitle, setCollapseTitle] = useState(false)

  const item = data.items.find((item) => item.id === assessments.item_id)

  const listProps = { item, assessments, collapseTitle, setter: {...setter, collapseTitle: setCollapseTitle} }

  return (
    <div className="grid grid-cols-1 h-full empty:!hidden overflow-y-auto invisible-scroll">
      <div
        className="grid place-items-center h-fit px-10"
        style={{
          paddingTop: collapseTitle ? '2.5rem' : '5rem',
          paddingBottom: collapseTitle ? '1rem' : '3.5rem',
          transition: 'padding .2s linear',
        }}
      >
        <div className="flex flex-col gap-1">
          <small className="text-xs text-center tracking-wide uppercase font-semibold text-slate-400">Assessments of</small>
          <span className="text-xl text-center font-medium">{item.title}</span>
        </div>

        <Chevron
          className="w-7 motion-safe:animate-[bobbing_2.5s_ease-in-out_infinite] overflow-hidden"
          style={{
            marginTop: collapseTitle ? '0' : '2.5rem',
            height: collapseTitle ? '0' : '1.75rem',
            transition: 'height .2s ease-in-out, margin-top .2s ease-in-out',
          }}
        />
      </div>

      <AssessmentList {...listProps} />
    </div>
  )
}

export default AssessmentLayout