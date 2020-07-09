/* eslint-disable no-nested-ternary */

import React, { useEffect } from 'react'
import {
  Stack,
  IIconProps,
  getTheme,
  IContextualMenuProps,
} from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'

import { actions } from '@/stores'
import { FilterInput } from './FilterInput'

export function DocumentFilterStack() {
  const dispatch = useDispatch()
  const theme = getTheme()
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const index = useSelector((state) => state.docs.index)
  const filter = useSelector((state) => state.docs.filter)
  const sort = useSelector((state) => state.docs.sort)
  useEffect(() => {
    dispatch(actions.docs.setFilter(index?.partialFilterExpression || {}))
    dispatch(actions.docs.setSort({}))
  }, [index])
  useEffect(() => {
    dispatch(actions.docs.setIndex(undefined))
  }, [database, collection])

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
          autoFocus={true}
          value={filter}
          onChange={(value) => {
            dispatch(actions.docs.setFilter((value as {}) || {}))
          }}
        />
      </Stack>
    )
  }

  const keys = Object.keys(index.key)
  return (
    <Stack
      horizontal={true}
      tokens={{ childrenGap: 10, padding: 10 }}
      styles={{ root: { height: 52 } }}>
      {'textIndexVersion' in index ? (
        <FilterInput<string>
          autoFocus={true}
          prefix="Text Search"
          onChange={(value) => {
            dispatch(actions.docs.setFilter({ $text: { $search: value } }))
          }}
        />
      ) : (
        keys.map((key, i) => {
          const k = index.key[key as keyof typeof index.key]
          const isSortKey = k === 1 || k === -1
          const iconProps: IIconProps | undefined = isSortKey
            ? {
                iconName:
                  sort[key] === 1
                    ? 'SortUp'
                    : sort[key] === -1
                    ? 'SortDown'
                    : 'Sort',
                styles: {
                  root: {
                    color: theme.palette.themePrimary,
                  },
                },
              }
            : undefined
          const menuProps: IContextualMenuProps | undefined = isSortKey
            ? {
                items: [
                  {
                    key: 'o',
                    text: 'Natural',
                    iconProps: {
                      iconName: 'Sort',
                    },
                    checked: sort[key] === undefined,
                    canCheck: true,
                    onClick() {
                      dispatch(
                        actions.docs.setSort({
                          ...sort,
                          [key]: undefined,
                        }),
                      )
                    },
                  },
                  {
                    key: '1',
                    text: 'Ascending',
                    iconProps: {
                      iconName: 'SortUp',
                    },
                    checked: sort[key] === 1,
                    canCheck: true,
                    onClick() {
                      dispatch(
                        actions.docs.setSort({
                          ...sort,
                          [key]: 1,
                        }),
                      )
                    },
                  },
                  {
                    key: '2',
                    text: 'Descending',
                    iconProps: {
                      iconName: 'SortDown',
                    },
                    checked: sort[key] === -1,
                    canCheck: true,
                    onClick() {
                      dispatch(
                        actions.docs.setSort({
                          ...sort,
                          [key]: -1,
                        }),
                      )
                    },
                  },
                ],
              }
            : undefined
          const disableFilter = i > 0 && !filter[keys[i - 1]]
          if (
            index.partialFilterExpression?.[
              key as keyof typeof index.partialFilterExpression
            ]
          ) {
            return (
              <FilterInput
                key={key}
                autoFocus={i === 0}
                disabled={disableFilter}
                prefix={`${key}:`}
                iconProps={iconProps}
                menuProps={menuProps}
                value={
                  index.partialFilterExpression[
                    key as keyof typeof index.partialFilterExpression
                  ]
                }
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
              autoFocus={i === 0}
              disabled={disableFilter}
              prefix={`${key}:`}
              iconProps={iconProps}
              menuProps={menuProps}
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
    </Stack>
  )
}
