import { useEffect, useState } from "react"
import { Outlet, useLoaderData } from "react-router"
import { saveItems, saveAssessments, getSortedItems } from "@/services/data"
import { AppContext, DialogContext, ToastContext } from "@/services/ctxs"
import ToastsContainer from "@/components/toasts/ToastsContainer"
import DialogContainer from "@/components/dialogs/DialogContainer"
import Nav from "@/components/Nav"

function AppLayout() {
  const [loading, setLoading] = useState(true)

  const { itemsData, assessmentsData } = useLoaderData()

  const [items, setItems] = useState([])
  const [assessments, setAssessments] = useState([])
  const [toastData, setToastData] = useState([])
  const [dialogData, setDialogData] = useState(null)

  useEffect(() => {
    setItems(itemsData)
    setAssessments(assessmentsData)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      saveItems(getSortedItems(items, assessments)).then(() => {
        // console.log('items saved')
      })
    }
  }, [assessments, items, loading])

  useEffect(() => {
    if (!loading) {
      saveAssessments(assessments).then(() => {
        // console.log('assessments saved')
      })
    }
  }, [assessments, loading])

  return (
    <>
      <ToastContext.Provider value={{ data: toastData, push: setToastData }}>
        <ToastsContainer />
      </ToastContext.Provider>

      <DialogContext.Provider value={{ data: dialogData, push: setDialogData }}>
        <DialogContainer />
      </DialogContext.Provider>

      <AppContext.Provider value={{
        data: {
          items,
          assessments,
        },
        setter: {
          items: setItems,
          assessments: setAssessments,
          dialog: setDialogData,
          toast: setToastData
        }
      }}>
        <main className="h-dvh min-w-full flex flex-col pb-34">
          {!loading &&
            <Outlet/>
          }
        </main>

        <Nav />
      </AppContext.Provider>
    </>
  )
}

export default AppLayout