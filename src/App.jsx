import ToastsContainer from "@/components/atoms/ToastsContainer"
import DialogContainer from "@/components/atoms/DialogContainer"
import Content from "@/components/Content"
import Nav from "@/components/Nav"
import { DialogContext, ToastContext } from "@/ctxs"
import { useState } from "react"

function App() {
  const [items, setItems] = useState(JSON.parse(localStorage.getItem('items')) || [
    {
      id: 1,
      title: 'radość',
      priority: 'min',
      lastAssessed: false,
      settingReminder: false,
      reminderTime: "18:00",
      reminderDays: []
    },
    {
      id: 2,
      title: 'smutek',
      priority: 'min',
      lastAssessed: false,
      settingReminder: false,
      reminderTime: "18:00",
      reminderDays: []
    },
    {
      id: 3,
      title: 'satysfakcja z życia',
      priority: 'mid',
      lastAssessed: false,
      settingReminder: false,
      reminderTime: "18:00",
      reminderDays: [5]
    },
    {
      id: 4,
      title: 'satysfakcja z pracy',
      priority: 'mid',
      lastAssessed: false,
      settingReminder: false,
      reminderTime: "18:00",
      reminderDays: []
    },
    {
      id: 5,
      title: 'kreatywność',
      priority: 'max',
      lastAssessed: false,
      settingReminder: false,
      reminderTime: "18:00",
      reminderDays: [5]
    },
    {
      id: 6,
      title: 'produktywność',
      priority: 'max',
      lastAssessed: false,
      settingReminder: false,
      reminderTime: "18:00",
      reminderDays: []
    },
  ])

  const [assessments, setAssessments] = useState(JSON.parse(localStorage.getItem('assessments')) || [
    {
      id: 3,
      last: 5,
      previous: [4,2,5],
    },
  ])

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