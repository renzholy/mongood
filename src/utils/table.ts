import _ from 'lodash'

import { MongoData } from '@/types'

export function calcHeaders<T extends { [key: string]: MongoData }>(
  items: T[],
  order?: string[],
): string[] {
  const keys: { [key: string]: number } = {}
  items?.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (!keys[key] && order) {
        const index = order.indexOf(key)
        keys[key] = index >= 0 ? (order.length - index) * 10 : 0
      }
      keys[key] += 1
    })
  })
  return _.sortBy(Object.entries(keys), (k) => k[1])
    .reverse()
    .map(([k]) => k)
}
