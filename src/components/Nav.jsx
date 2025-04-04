import { useContext, useMemo } from "react"
import { useLocation, useNavigate } from "react-router"
import { AppContext } from "@/services/ctxs"
import { getSortedItems } from "@/services/data"
import { handleBigToast, nbsps, newID } from "@/services/utils"
import useDialog from "@/hooks/useDialog"
import Stars from "@/assets/stars.svg?react"
import Chevron from "@/assets/chevron.svg?react"
import Logo from "@/assets/logo.svg?react"


function Nav() {
  const { data, setter } = useContext(AppContext)

  const location = useLocation()
  const navigate = useNavigate()

  const addDialog = useDialog(
    setter.dialog,
    useMemo(() => ({
      type: 'new-item-dialog',
      items: data.items
    }),[data.items])
  )

  async function addItem(){
    const promise = await addDialog()

    if (promise) {
      if (!data.items.some(item => item.title.replace(/\s/g, "").toLowerCase() === promise.title.replace(/\s/g, "").toLowerCase())) {
        const newItemID = newID()

        const newItem = {
          id: newItemID,
          title: nbsps(promise.title),
          pinned: false,
          group: null,
          reminderDays: promise.selectedDays,
          scale: {
            type: promise.scaleType,
            max: promise.scaleMax
          },
          status: {
            lastAssessed: false,
            newestItem: true,
          },
        }

        setter.items(
          prev => getSortedItems(prev.concat([newItem]).map(i => i.id !== newItem.id
            ? {...i, index: prev.concat([newItem]).length-getSortedItems(prev.concat([newItem]), data.assessments).indexOf(i), status: {...i.status, newestItem: false}}
            : {...i, index: prev.concat([newItem]).length-getSortedItems(prev.concat([newItem]), data.assessments).indexOf(i)}), data.assessments)
        )

        const newAssessmentItem = {
          item_id: newItemID,
          group_id: null,
          entries: []
        }

        setter.assessments(prev => prev.concat([newAssessmentItem]))

      } else {
        handleBigToast('error', 1, setter.toast)
      }
    }
  }

  function goBack() {
    navigate('/', { replace: true })
    setTimeout(() => {
      setter.items(prev => getSortedItems([...prev], data.assessments))
    })
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-slate-900">
        <ul className="py-6 flex justify-center mb-6">
          {!location.pathname.includes('ass') ?
            <li className="relative" onClick={addItem}>
              <div className="size-15 relative">
                <Logo className="size-13 absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-40"/>
                <div className="size-17 absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-slate-900/90 rounded-full blur-[2px] z-30"/>
                <div className="absolute z-10 motion-safe:animate-[ai-blob-1_8s_ease-in-out_infinite]"/>
                <div className="absolute z-10 motion-safe:animate-[ai-blob-2_8s_ease-in-out_infinite]"/>
                <div className="absolute z-20 motion-safe:animate-[ai-blob-3_5s_ease-in-out_infinite]"/>
              </div>
              {data.items.length === 0 &&
                  <Stars className="absolute -top-1.5 -left-5 size-8 scale-x-[-1] text-yellow-500"/>}
            </li>
            :
            <li className="h-14 flex gap-2 items-center text-slate-200 font-medium pl-3 pr-6 bg-slate-800 rounded-full" onClick={goBack}>
              <Chevron className="size-7 stroke-2 rotate-90" />
              Back
            </li>
          }
        </ul>
      </nav>
    </>
  )
}

export default Nav