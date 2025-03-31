import { deleteItemAndAssessments, getSortedItems } from "@/services/data"

export async function deleteItem(item, assessments, setItems, promise) {
  function saveChanges() {
    setItems(prev => prev.filter(i => i.id !== item.id).map(i => i.index > item.index
      ? {...i, index: i.index-1}
      : i
    ))
  }

  if (!assessments.find(ass => ass.item_id === item.id && (ass.entries.length > 0))) {
    saveChanges()
    await deleteItemAndAssessments(item.id)
  } else {
    const res = await promise()
    if (res) {
      saveChanges()
      await deleteItemAndAssessments(item.id)
    }
  }
}

export function pinItem(item, assessments, setItems) {
  const newIndex = (currentArray, object) => {
    const newArray = getSortedItems(currentArray.map(x => x.id === item.id ? {...x, pinned: !x.pinned} : x), assessments)
    return currentArray.length-newArray.indexOf(newArray.find(y => y.id === object.id))
  }

  setItems(prev => getSortedItems(
    prev.map(i => i.id === item.id ?
      {...i, pinned: !i.pinned,
        index: newIndex(prev, i)
      } :
      {...i,
        index: newIndex(prev, i)
      }
    ), assessments)
  )
}