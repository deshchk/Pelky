import { isItToday, todayNum } from "@/utils"

export const itemsData = JSON.parse(localStorage.getItem('items')) || [
  {
    id: 1,
    title: 'radość',
    pinned: false,
    group: null,
    reminderDays: [0,3],
    status: {
      lastAssessed: false,
      settingReminder: false,
    },
  },
  {
    id: 2,
    title: 'smutek',
    pinned: true,
    group: null,
    reminderDays: [2,1],
    status: {
      lastAssessed: false,
      settingReminder: false,
    },
  },
  {
    id: 3,
    title: 'satysfakcja z życia',
    pinned: false,
    group: null,
    reminderDays: [5,3,4,6],
    status: {
      lastAssessed: false,
      settingReminder: false,
    },
  },
  {
    id: 4,
    title: 'satysfakcja z pracy',
    pinned: false,
    group: null,
    reminderDays: [6,5],
    status: {
      lastAssessed: false,
      settingReminder: false,
    },
  },
  {
    id: 5,
    title: 'kreatywność',
    pinned: false,
    group: null,
    reminderDays: [3],
    status: {
      lastAssessed: false,
      settingReminder: false,
    },
  },
  {
    id: 6,
    title: 'produktywność',
    pinned: true,
    group: null,
    reminderDays: [1,5],
    status: {
      lastAssessed: false,
      settingReminder: false,
    },
  },
]

export const assessmentsData = JSON.parse(localStorage.getItem('assessments')) || []

export const getSortedItems = (items, assessments) => items.toSorted((a, b) => {
  // Helper functions
  const isTodoItem = item =>
    item.reminderDays.includes(todayNum) &&
    !assessments.some(ass => ass.item_id === item.id && isItToday(ass.last.date))

  const getPastCount = item =>
    assessments.find(ass => ass.item_id === item.id)?.past.length +
    (assessments.find(ass => ass.item_id === item.id)?.last.id && 1) || 0

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