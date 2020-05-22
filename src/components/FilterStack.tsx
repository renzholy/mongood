/* eslint-disable no-nested-ternary */

import React, { useEffect } from 'react'
import { Stack } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'

import { actions } from '@/stores'
import { nextSorter } from '@/utils/sorter'
import { FilterInput } from './FilterInput'
import { Pagination } from './Pagination'

export function FilterStack() {
  const dispatch = useDispatch()
  const { index, filter, sort } = useSelector((state) => state.docs)
  useEffect(() => {
    dispatch(actions.docs.setFilter({}))
    dispatch(actions.docs.setSort({}))
  }, [index])

  if (!index) {
    return (
      <Stack
        horizontal={true}
        tokens={{ childrenGap: 20, padding: 10 }}
        styles={{ root: { height: 52 } }}>
        <FilterInput
          disabled={true}
          placeholder="querying without an index is not allowed"
          onChange={(value) => {
            dispatch(actions.docs.setFilter(value as { [key: string]: object }))
          }}
        />
        <Pagination />
      </Stack>
    )
  }

  const keys = Object.keys(index.key)

  return (
    <Stack
      horizontal={true}
      tokens={{ childrenGap: 20, padding: 10 }}
      styles={{ root: { height: 52 } }}>
      {keys.map((key, i) => {
        const disableFilter = i > 0 && !filter[keys[i - 1]]
        const disableSort =
          i > 0 && !filter[keys[i - 1]] && sort[keys[i - 1]] === undefined
        return (
          <FilterInput
            key={key}
            disabled={disableFilter}
            prefix={`${key}:`}
            iconProps={{
              iconName:
                sort[key] === 1
                  ? 'Ascending'
                  : sort[key] === -1
                  ? 'Descending'
                  : 'Sort',
              styles: {
                root: {
                  userSelect: 'none',
                  pointerEvents: 'unset',
                  cursor: disableSort ? 'not-allowed' : 'pointer',
                },
              },
              onClick: disableSort
                ? undefined
                : () => {
                    dispatch(
                      actions.docs.setSort(nextSorter(i, index.key, sort)),
                    )
                  },
            }}
            onChange={(value) => {
              dispatch(
                actions.docs.setFilter({
                  ...filter,
                  [key]: value,
                }),
              )
            }}
          />
        )
      })}
      <Pagination />
    </Stack>
  )
}
