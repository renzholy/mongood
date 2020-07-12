import _ from 'lodash'

import { MongoData } from '@/types'

export function calcHeaders<T extends { [key: string]: MongoData }>(
  items: T[],
  order?: string[],
): { key: string; minWidth: number }[] {
  const keys: { [key: string]: { order: number; minWidth: 240 } } = {}
  items?.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (!keys[key] && order) {
        const index = order.indexOf(key)
        keys[key] = {
          order: index >= 0 ? (order.length - index) * 10 : 0,
          minWidth: 240,
        }
      }
      keys[key].order += 1
    })
  })
  return _.sortBy(Object.entries(keys), (k) => k[1].order)
    .reverse()
    .map(([k, { minWidth }]) => ({ key: k, minWidth }))
}
