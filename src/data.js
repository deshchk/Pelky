import { isItToday, todayNum } from "@/utils"
import * as db from "@/services/indexedDB"

export const loadData = async () => {
  try {
    await db.initDB()

    let items = await db.getAllItems() || []
    let assessments = await db.getAllAssessments() || []

    return {
      items: getSortedItems(items, assessments),
      assessments
    }
  } catch (error) {
    console.error("Error loading data from IndexedDB:", error)

    // Fallback do localStorage
    return {
      items: JSON.parse(localStorage.getItem('items')) || [],
      assessments: JSON.parse(localStorage.getItem('assessments')) || []
    }
  }
}

// Function for saving all items
export const saveItems = async (items) => {
  try {
    await db.saveItems(items)
  } catch (error) {
    console.error("Error saving items to IndexedDB:", error)

    // Fallback do localStorage
    localStorage.setItem('items', JSON.stringify(items))
  }
}

// Function for saving all assessments
export const saveAssessments = async (assessments) => {
  try {
    await db.saveAssessments(assessments)
  } catch (error) {
    console.error("Error saving assessments to IndexedDB:", error)

    // Fallback do localStorage
    localStorage.setItem('assessments', JSON.stringify(assessments))
  }
}

// Function for deleting an item and its assessments
export const deleteItemAndAssessments = async (itemId) => {
  try {
    await db.deleteItem(itemId)
    await db.deleteAssessment(itemId)
  } catch (error) {
    console.error("Error deleting data from IndexedDB:", error)
  }
}



export const getSortedItems = (items, assessments) => items.toSorted((a, b) => {
  // Helper functions
  const isTodoItem = item =>
    item.reminderDays.includes(todayNum) &&
    !assessments.some(ass => ass.item_id === item.id && (ass.last && isItToday(ass.last.date)))

  const getPastCount = item => assessments.find(ass => ass.item_id === item.id) ?
      Number(
        assessments.find(ass => ass.item_id === item.id).past.length
          + (assessments.find(ass => ass.item_id === item.id).last ? 1 : 0)
      )
    : 0

  // Priority grouping
  const aTodo = isTodoItem(a)
  const bTodo = isTodoItem(b)

  // 0. To be assessed and pinned items first
  if (aTodo && bTodo && a.pinned !== b.pinned) return a.pinned ? -1 : 1

  // 1. To be assessed items first
  if (aTodo !== bTodo) return aTodo ? -1 : 1

  // 2. Pinned items second (only if not to be assessed)
  if (!aTodo && !bTodo && a.pinned !== b.pinned) return a.pinned ? -1 : 1

  // 3. Sort by past assessments count (descending)
  if (getPastCount(b) - getPastCount(a) !== 0) return getPastCount(b) - getPastCount(a)

  // 4. Sort alphabetically
  return a.title.localeCompare(b.title)
}).reverse()


export const errorCodes = {
  1: 'Item with this name already exists.',
  2: 'Canceled'
}

export const successCodes = {
  1: 'Saved!',
  2: 'Saved with a note'
}