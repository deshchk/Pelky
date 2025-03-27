import { deleteItemAndAssessments, getSortedItems } from "@/data"

export async function deleteItem(item, assessments, setItems, promise) {
  if (!assessments.find(ass => ass.item_id === item.id)) {
    setItems(prev => prev.filter(i => i.id !== item.id))
    await deleteItemAndAssessments(item.id)
  } else {
    const res = await promise()
    if (res) {
      setItems(prev => prev.filter(i => i.id !== item.id))
      await deleteItemAndAssessments(item.id)
    }
  }
}

export async function pinItem(item, assessments, setItems) {
  setItems(prev => getSortedItems(prev.map(i => i.id === item.id ? {...i, pinned: !i.pinned} : {...i}), assessments))
}