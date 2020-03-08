export const applyDrag = (arr, dragResult) => {
  const { removedIndex, addedIndex, payload } = dragResult
  if (removedIndex === null && addedIndex === null) return arr

  const result = [...arr]
  let itemToAdd = payload

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0]
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd)
  }

  return result
}

export const generateItems = (count, creator) => {
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(creator(i))
  }
  return result
}

export const truncateLongPath = (path, length) => {
  if (path.length > length) {
    return '...' + path.substring(path.length - length, path.length)
  } else {
    return path
  }
}

export const getCurrentTime = () => {
  var date = new Date()
  var seperator1 = '-'
  var seperator2 = ':'
  var month = date.getMonth() + 1
  var strDate = date.getDate()
  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = '0' + strDate
  }
  var strHour = date.getHours()
  var strMinute = date.getMinutes()
  var strSecond = date.getSeconds()
  var strMilSecond = date.getMilliseconds()
  if (strHour >= 0 && strHour <= 9) {
    strHour = '0' + strHour
  }
  if (strMinute >= 0 && strMinute <= 9) {
    strMinute = '0' + strMinute
  }
  if (strSecond >= 0 && strSecond <= 9) {
    strSecond = '0' + strSecond
  }
  var currentTime =
    date.getFullYear() +
    seperator1 +
    month +
    seperator1 +
    strDate +
    ' ' +
    strHour +
    seperator2 +
    strMinute +
    seperator2 +
    strSecond +
    seperator2 +
    strMilSecond
  return currentTime
}
