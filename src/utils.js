import { errorCodes, successCodes } from "@/data"

export const nbsps = el => el.replace(/(\s)([aAwWiIzZoOuU])(\s)/g, '$1$2\xa0')

export const firstUpper = string => string.charAt(0).toUpperCase() + string.slice(1)

export const newID = () => {
  let result = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const todayString = new Intl.DateTimeFormat("en-US", {weekday: "long"}).format(new Date()).toLowerCase()
export const todayNum = days.indexOf(todayString) // 0-6

export const isItToday = (date) => date ? date.split(',')[0] === new Intl.DateTimeFormat("en-AU", {
  day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date()) : false

export const formatWhenDate = date => {
  const preparedDate = new Date(date.split(',')[0].split('/').reverse().join('-'))

  const dateByDay = new Intl.DateTimeFormat("en-AU", {dateStyle: 'full'}).format(new Date(preparedDate)).split(' ')[0]
  const fullDate = new Intl.DateTimeFormat("en-AU", {day: 'numeric', month: 'long', year: 'numeric'}).format(preparedDate)
  const daysDiff = Math.floor(Math.abs(preparedDate - new Date()) / (1000 * 60 * 60 * 24))

  return daysDiff === 0 ? 'Today' : daysDiff === 1 ? 'Yesterday' : daysDiff < 7 ? dateByDay : fullDate
}

export const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const setRandomInterval = (callback, minDelay, maxDelay, density = 0.5) => {
  density = Math.max(0, Math.min(1, density))
  let timeout

  const runInterval = () => {
    const timeoutFunction = () => {
      callback()
      runInterval()
    }

    let randomValue

    if (density <= 0.5) {
      const power = 1 + 8 * (0.5 - density)
      randomValue = Math.pow(Math.random(), power)
    } else {
      const power = 1 + 8 * (density - 0.5)
      randomValue = Math.pow(Math.random(), power)
    }

    const delay = Math.floor(randomValue * (maxDelay - minDelay + 1)) + minDelay;
    timeout = setTimeout(timeoutFunction, delay)
  }
  runInterval()

  return {
    clear() { clearTimeout(timeout) },
  }
}





export const getLastAssessment = (item_id, assessments) => assessments.find(ass => ass.item_id === item_id)?.last.value
export const getLastPastAssessment = (item_id, assessments) => {
  const pastAssessments = assessments.find(ass => ass.item_id === item_id).past || []
  return pastAssessments[pastAssessments.length-1].value
}
export const getLastPastAssDiff = (item_id, assessments) => getLastAssessment(item_id, assessments) - getLastPastAssessment(item_id, assessments)





export function loadItemsInNeed(condition, itemEl, itemLoader, setAnimationsInProgress) {
  if (condition) {
    itemEl.current.classList.add('loading-animation')
    itemLoader.current.classList.remove('loading-animation')
    setTimeout(() => {
      setAnimationsInProgress(false)
      itemLoader.current.classList.add('loading-animation')
      itemEl.current.classList.remove('loading-animation')
    },1000)
  }
}

export const handleBigToast = (type, messageCode, setToastData, time = 5000) => {
  const toastID = newID()
  const toast = {
    id: toastID,
    message: type === 'error' ? errorCodes[messageCode] : successCodes[messageCode],
    time: time,
    type: type,
  }

  setToastData(toasts => toasts.concat([toast]))

  setTimeout(() => {
    setToastData(toasts => toasts.toSpliced(toasts.indexOf(toast), 1))
  }, toast.time)
}

export const handleSmallToast = (type, messageCode, setToastData, time = 3000) => {
  const toastID = newID()
  const toast = {
    id: toastID,
    message: type === 'error' ? errorCodes[messageCode] : successCodes[messageCode],
    time: time,
    type: type,
    size: 'small'
  }

  setToastData(toasts => toasts.concat([toast]))

  setTimeout(() => {
    setToastData(toasts => toasts.toSpliced(toasts.indexOf(toast), 1))
  }, toast.time)
}