import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router"
import { loadData, fetchAssessment } from "@/services/data"
import Loading from "@/components/layouts/Loading"
import AppLayout from "@/components/layouts/AppLayout"
import TrackerList from "@/components/tracker/TrackerList"
import AssessmentLayout from "@/components/layouts/AssessmentLayout"
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    HydrateFallback: Loading,
    loader: async () => {
      const data = await loadData()
      return { itemsData: data.items, assessmentsData: data.assessments }
    },
    children: [
      {
        index: true,
        Component: TrackerList,
        HydrateFallback: Loading,
      },{
        path: "/ass/:item_id",
        loader: async ({params}) => {
          return { assessments: await fetchAssessment(params.item_id) }
        },
        Component: AssessmentLayout,
        HydrateFallback: Loading,
      }
    ]
  },
], {
  future: {
    v7_partialHydration: true,
  },
})

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)