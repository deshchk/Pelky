export const nbsps = el => el.replace(/(\s)([aAwWiIzZoOuU])(\s)/g, '$1$2\xa0')

export const newID = () => {
  let result = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}