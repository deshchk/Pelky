import ToastsContainer from "@/components/atoms/ToastsContainer"
import DialogContainer from "@/components/atoms/DialogContainer"
import Content from "@/components/Content"
import Nav from "@/components/Nav"
import { DialogContext, ToastContext } from "@/ctxs"
import { useEffect, useRef, useState } from "react"
import { loadData, saveItems, saveAssessments, getSortedItems } from "@/data"
import Loader from "@/assets/loader.svg?react"


function App() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [assessments, setAssessments] = useState([])

  const [animationsInProgress, setAnimationsInProgress] = useState(false)

  const [toastData, setToastData] = useState([])
  const [dialogData, setDialogData] = useState(null)



  const contentProps = {
    items,
    setItems,
    assessments,
    setAssessments,
    setToastData,
    setDialogData,
    animationsInProgress,
    setAnimationsInProgress
  }

  const navProps = {
    items,
    setItems,
    setToastData,
    setDialogData,
    assessments,
    setAssessments,
  }

  const initialLoad = useRef(true)



  useEffect(() => {
    const fetchData = async () => {
      const data = await loadData()
      setItems(data.items)
      setAssessments(data.assessments)
      setLoading(false)
    }

    fetchData()

    setTimeout(() => {
      initialLoad.current = false
    }, 50)
  }, [])

  useEffect(() => {
    if (!loading) {
      saveItems(items)
    }
  }, [items, loading])

  useEffect(() => {
    if (!loading) {
      saveAssessments(assessments)
    }
  }, [assessments, loading])



  useEffect(() => {
    if (!initialLoad.current && !animationsInProgress) {
      const sorted = getSortedItems(items, assessments)

      if (JSON.stringify(sorted) !== JSON.stringify(items)) {
        setItems(sorted)
      }
    }
  }, [items, assessments, animationsInProgress])



  if (loading) {
    return (
      <div className="fixed inset-0 grid place-items-center">
        <Loader className="text-sky-800 size-12" />
      </div>
    )
  }

  return (
    <>
      <ToastContext.Provider value={{ data: toastData, push: setToastData }}>
        <ToastsContainer />
      </ToastContext.Provider>

      <DialogContext.Provider value={{ data: dialogData, push: setDialogData }}>
        <DialogContainer />
      </DialogContext.Provider>

      <Content {...contentProps} />
      <Nav {...navProps} />
    </>
  )
}

export default App