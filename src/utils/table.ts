/* eslint-disable no-bitwise */

import { sortBy } from 'lodash'
import { IColumn, ColumnActionsMode } from '@fluentui/react'

import { MongoData } from '@/types'
import { stringify } from './ejson'

export function calcHeaders<T extends { [key: string]: MongoData }>(
  items: T[],
  order: string[] = [],
  onlyOrder: boolean = false,
): { key: string; minWidth: number }[] {
  const keys: { [key: string]: { order: number; minWidth: number } } = {}
  items.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (!keys[key] && order) {
        const index = order.indexOf(key)
        if (index >= 0 || !onlyOrder) {
          keys[key] = {
            order: index >= 0 ? (order.length - index) << 10 : 0,
            minWidth: Math.max(
              100,
              Math.min(240, stringify(item[key]).length << 3),
            ),
          }
        }
      }
      if (keys[key]) {
        keys[key].order += 1
      }
    })
  })
  return sortBy(Object.entries(keys), (k) => k[1].order)
    .reverse()
    .map(([k, { minWidth }]) => ({ key: k, minWidth }))
}

export function mapToColumn(
  headers: { key: string; minWidth: number }[],
): IColumn[] {
  return headers.map(({ key, minWidth }) => ({
    key,
    name: key,
    minWidth,
    columnActionsMode: ColumnActionsMode.disabled,
    isResizable: true,
  }))
}
