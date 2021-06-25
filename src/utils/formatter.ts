import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { storage } from './storage'

dayjs.extend(utc)

const Number = Intl.NumberFormat()

export function formatNumber(num: number): string {
  return Number.format(num)
}

export function formatDate(date: Date | number): string {
  return storage.timezoneOffset.get === 0
    ? new Date(date).toISOString()
    : dayjs(date).utcOffset(storage.timezoneOffset.get).format()
}
