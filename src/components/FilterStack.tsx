/* eslint-disable no-nested-ternary */

import React, { useEffect } from 'react'
import { Stack, IIconProps } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'
import _ from 'lodash'

import { actions } from '@/stores'
import { nextSorter } from '@/utils/sorter'
import { FilterInput } from './FilterInput'

export function FilterStack() {
  const dispatch = useDispatch()
  const { database, collection } = useSelector((state) => state.root)
  const { index, filter, sort } = useSelector((state) => state.docs)
  useEffect(() => {
    dispatch(actions.docs.setFilter(index?.partialFilterExpression || {}))
    dispatch(actions.docs.setSort({}))
  }, [index])

  if (!database || !collection) {
    return <div style={{ height: 52 }} />
  }

  if (!index) {
    return (
      <Stack
        horizontal={true}
        tokens={{ childrenGap: 10, padding: 10 }}
        styles={{ root: { height: 52 } }}>
        <FilterInput
          onChange={(value) => {
            dispatch(actions.docs.setFilter(value as {}))
          }}
        />
      </Stack>
    )
  }

  const keys = Object.keys(index.key)
  const extraPartialKeys = index.partialFilterExpression
    ? _.difference(Object.keys(index.partialFilterExpression), keys)
    : []
  return (
    <Stack
      horizontal={true}
      tokens={{ childrenGap: 10, padding: 10 }}
      styles={{ root: { height: 52 } }}>
      {'textIndexVersion' in index ? (
        <FilterInput
          prefix="Text Search"
          onChange={(value) => {
            dispatch(actions.docs.setFilter({ $text: { $search: value } }))
          }}
        />
      ) : (
        keys.map((key, i) => {
          const disableSort =
            i > 0 && !filter[keys[i - 1]] && sort[keys[i - 1]] === undefined
          const iconProps: IIconProps = {
            iconName:
              sort[key] === 1 ? 'Up' : sort[key] === -1 ? 'Down' : 'Sort',
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
                  dispatch(actions.docs.setSort(nextSorter(i, index.key, sort)))
                },
          }
          const disableFilter = i > 0 && !filter[keys[i - 1]]
          if (index.partialFilterExpression?.[key]) {
            return (
              <FilterInput
                key={key}
                disabled={disableFilter}
                prefix={`${key}:`}
                iconProps={iconProps}
                value={index.partialFilterExpression[key]}
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
          }
          return (
            <FilterInput
              key={key}
              disabled={disableFilter}
              prefix={`${key}:`}
              iconProps={iconProps}
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
        })
      )}
      {extraPartialKeys.map((key) => {
        return (
          <FilterInput
            key={key}
            disabled={true}
            prefix={`${key}:`}
            value={index.partialFilterExpression?.[key]}
            onChange={() => {}}
          />
        )
      })}
    </Stack>
  )
}
