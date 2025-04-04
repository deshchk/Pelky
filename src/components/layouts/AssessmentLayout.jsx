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
        className="relative z-10 grid place-items-center h-fit px-10"
        style={{
          paddingInline: collapseTitle ? '1.25rem' : '2.5rem',
          paddingTop: collapseTitle ? '1.25rem' : '5rem',
          paddingBottom: collapseTitle ? '1rem' : '2rem',
          boxShadow: collapseTitle ? '0 0 20px 20px var(--color-slate-900)' : '0 0 0 0 var(--color-slate-900)',
          transition: 'padding .3s ease-out, box-shadow .2s linear',
        }}
      >
        <div className="flex flex-col gap-1">
          <small className={`text-center tracking-wide uppercase font-semibold text-slate-400 ${collapseTitle ? 'text-[11px]' : 'text-xs'} transition-all`}>Assessments of</small>
          <span className={`text-center font-medium ${collapseTitle ? 'line-clamp-1 text-ellipsis text-base' : 'text-lg'} transition-all`}>{item.title}</span>
        </div>

        <Chevron
          className="w-7 motion-safe:animate-[bobbing_2.5s_ease-in-out_infinite] overflow-hidden"
          style={{
            marginTop: collapseTitle ? '0' : '2.5rem',
            height: collapseTitle ? '0' : '1.75rem',
            transition: 'height .1s ease-in-out, margin-top .1s ease-in-out',
          }}
        />
      </div>

      <AssessmentList {...listProps} />
    </div>
  )
}

export default AssessmentLayout