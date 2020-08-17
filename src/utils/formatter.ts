import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { TIMEZONE_OFFSET_KEY } from '@/pages/settings'

dayjs.extend(utc)

const Number = Intl.NumberFormat()

const timezoneOffset = parseInt(
  localStorage.getItem(TIMEZONE_OFFSET_KEY) || '0',
  10,
)

export function formatNumber(num: number): string {
  return Number.format(num)
}

export function formatDate(date: Date | number): string {
  return dayjs(date).utcOffset(timezoneOffset).local().format()
}
