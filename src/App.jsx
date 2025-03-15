import ToastsContainer from "@/components/atoms/ToastsContainer"
import DialogContainer from "@/components/atoms/DialogContainer"
import Content from "@/components/Content"
import Nav from "@/components/Nav"
import { DialogContext, ToastContext } from "@/ctxs"
import { useState } from "react"
import { itemsData, assessmentsData, getSortedItems } from "@/data"


function App() {
  const [items, setItems] = useState(getSortedItems(itemsData, assessmentsData))
  const [assessments, setAssessments] = useState(assessmentsData)

  const [toastData, setToastData] = useState([])
  const [dialogData, setDialogData] = useState(null)

  const contentProps = {
    items,
    setItems,
    assessments,
    setAssessments,
    setToastData,
    setDialogData
  }

  const navProps = {
    items,
    setItems,
    setToastData,
    setDialogData
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