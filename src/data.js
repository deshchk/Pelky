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

export const assessmentsData = JSON.parse(localStorage.getItem('assessments')) || [
  {
    item_id: 3,
    group_id: null,
    last: {
      id: 1,
      value: 5,
      date: "13/03/2025, 5:23 PM",
      note: null
    },
    past: []
  },
  {
    item_id: 2,
    group_id: null,
    last: {
      id: 2,
      value: 1,
      date: "12/03/2025, 10:03 AM",
      note: null
    },
    past: []
  },
  {
    item_id: 5,
    group_id: null,
    last: {
      id: 3,
      value: -2,
      date: "13/03/2025, 5:24 PM",
      note: null
    },
    past: []
  },
]

export const getSortedItems = (items, assessments) => items.toSorted((a, b) => {
  // Helper functions
  const isTodoItem = (item) =>
      item.reminderDays.includes(todayNum) &&
      !assessments.some(ass => ass.item_id === item.id && isItToday(ass.last.date))

  const getPastCount = (item) =>
      assessments.find(ass => ass.item_id === item.id)?.past.length || 0

  // Priority grouping
  const aTodo = isTodoItem(a)
  const bTodo = isTodoItem(b)

  // 1. To be assessed items first
  if (aTodo !== bTodo) return aTodo ? -1 : 1;

  // 2. Pinned items second (only if not to be assessed)
  if (!aTodo && !bTodo && a.pinned !== b.pinned) return a.pinned ? -1 : 1

  // 3. Sort by past assessments count (descending)
  return getPastCount(b) - getPastCount(a)
}).reverse()