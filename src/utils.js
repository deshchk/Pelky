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

export const isItToday = (date) => date.split(',')[0] === new Intl.DateTimeFormat("en-AU", {
  day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date())

export const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}


export const getLastAssessment = (item_id, assessments) => assessments.find(ass => ass.item_id === item_id)?.last.value
export const getLastPastAssessment = (item_id, assessments) => {
  const pastAssessments = assessments.find(ass => ass.item_id === item_id).past || []
  return pastAssessments[pastAssessments.length-1].value
}
export const getLastPastAssDiff = (item_id, assessments) => getLastAssessment(item_id, assessments) - getLastPastAssessment(item_id, assessments)