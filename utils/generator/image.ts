import { hsl } from 'd3-color'
import { trim } from 'lodash'
import { DateTime } from 'luxon'

export enum Holiday {
  Birthday = 'birthday',
  Thanksgiving = 'thanksgiving',
  Halloween = 'halloween',
  Christmas = 'christmas',
  NewYearsEve = 'newyearseve',
}

const getNumberOfPoeticTopics = (year: number) => {
  if (year === 2) {
    return 6
  }
  return 7
}

const compareDates = (a: DateTime, b: DateTime) => (a < b ? -1 : a > b ? 1 : 0)

const getNewYearsEve = (dateTime: DateTime) =>
  DateTime.fromObject({ year: dateTime.year, month: 12, day: 31 })

const getBirthday = (dateTime: DateTime) =>
  DateTime.fromObject({ year: dateTime.year, month: 4, day: 9 })

const getHalloween = (dateTime: DateTime) =>
  DateTime.fromObject({ year: dateTime.year, month: 10, day: 31 })

const getChristmas = (dateTime: DateTime) =>
  DateTime.fromObject({ year: dateTime.year, month: 12, day: 25 })

const getThanksGiving = (dateTime: DateTime) =>
  getNthTargetDayOfMonth({
    year: dateTime.year,
    month: 11,
    day: 4,
    n: 4,
  })

// this logic lovingly inspired by
// https://github.com/amaidah/luxon-business-days/blob/master/src/holidays.js
function getNthTargetDayOfMonth({
  n,
  day,
  month,
  year,
}: {
  n: number
  day: number
  month: number
  year: number
}) {
  const firstDayOfMonth = DateTime.fromObject({
    day: 1,
    month,
    year,
  })

  // is target day before or after first day
  const offsetThreshold = firstDayOfMonth.weekday - day
  let offsetFromTargetDay = null
  if (offsetThreshold > 0) {
    // get to target day if target is after first day
    offsetFromTargetDay = 7 - offsetThreshold
  } else {
    // reverse threshold to get to target from first day
    offsetFromTargetDay = offsetThreshold * -1
  }

  const firstOccurenceOfTargetDay = firstDayOfMonth.plus({
    days: offsetFromTargetDay,
  })

  const nthDay = firstOccurenceOfTargetDay.plus({
    days: (n - 1) * 7,
  })

  return nthDay
}

export const nameFromKey = (prefix: string, key: string) =>
  `${prefix}_${key.toLowerCase()}.png`

const getWeekday = (dateStr: string) => DateTime.fromISO(dateStr).weekday

export const resolveTopic = (
  year: number,
  topic: string,
  releasedAt: string
): string => {
  const numPoetic = getNumberOfPoeticTopics(year)
  // choose one of the poetic images by day number
  if (topic === 'Poetic')
    return `poetic${(getWeekday(releasedAt) % numPoetic) + 1}`

  return topic
}

const getSaturationForYear = (year: number) => {
  return 1 - (year - 1) * 0.01
}

export const getBackground = (year: number, releasedAt: string): string => {
  // basically, the background can be a color OR a special image
  // if it's a holiday, return the holiday key
  // and if it's a normal day, derive the HSL value, making sure to skip the holidays
  // in the calculation

  const now = DateTime.fromISO(releasedAt).startOf('day')

  const birthdayOffset = compareDates(now, getBirthday(now))
  if (birthdayOffset === 0) return Holiday.Birthday

  const halloweenOffset = compareDates(now, getHalloween(now))
  if (halloweenOffset === 0) return Holiday.Halloween

  const thanksgivingOffset = compareDates(now, getThanksGiving(now))
  if (thanksgivingOffset === 0) return Holiday.Thanksgiving

  const christmasOffset = compareDates(now, getChristmas(now))
  if (christmasOffset === 0) return Holiday.Christmas

  const newYearsEveOffset = compareDates(now, getNewYearsEve(now))
  if (newYearsEveOffset === 0) return Holiday.NewYearsEve

  // sum how many holidays the current date is _after_
  const offset = [
    birthdayOffset,
    halloweenOffset,
    thanksgivingOffset,
    christmasOffset,
    newYearsEveOffset,
  ]
    .filter((offset) => offset >= 0)
    .reduce((memo, offset) => memo + offset, 0)

  // adjust the ordinal day by this offset, so it goes from 1-360
  const day = now.ordinal - offset

  // idk, hue math
  const hue = 359 - ((day + 119) % 360)
  const saturation = getSaturationForYear(year)

  // return as hex
  return hsl(hue, saturation, 0.9).formatHex()
}

export const formatBeard = (text: string) =>
  toPascalCase(
    trim(text).toLowerCase().replace('n/a', 'Clean').replace('na', 'Clean')
  )
export const formatMood = (text: string) => toPascalCase(trim(text))
export const formatTag = (text: string) => trim(text)
export const formatLocation = (text: string) =>
  trim(text).replace(/ /gi, '').replace(/,/gi, '')
export const formatTopic = (text: string) =>
  trim(text)
    .replace(/ /gi, '')
    .replace(/^Object$/, 'Objects')

const toPascalCase = (text: string) =>
  text
    .split(' ')
    .map(
      (word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
    )
    .join(' ')
export const formatInstrument = (text: string) =>
  toPascalCase(trim(text))
    .replace(/ /gi, '')
    .replace('Ukulele', 'Uke')
    .replace(/^Synth$/, 'Synths')
    .replace(/^Drum$/, 'Drums')
