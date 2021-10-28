import { useEffect } from 'react'
import {
  Stack,
  IIconProps,
  getTheme,
  IContextualMenuProps,
} from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from 'stores'
import useRouterQuery from 'hooks/use-router-query'
import { useConnection } from 'hooks/use-connections'
import FilterInput from './pure/filter-input'

const height = 52

export default function DocumentFilterStack() {
  const dispatch = useDispatch()
  const theme = getTheme()
  const [{ conn, database, collection }] = useRouterQuery()
  const connection = useConnection(conn)
  const index = useSelector((state) => state.docs.index)
  const filter = useSelector((state) => state.docs.filter)
  const projection = useSelector((state) => state.docs.projection)
  const sort = useSelector((state) => state.docs.sort)
  useEffect(() => {
    dispatch(actions.docs.setFilter(index?.partialFilterExpression || {}))
    dispatch(
      actions.docs.setSort(index && index.name !== '_id_' ? {} : { _id: -1 }),
    )
  }, [index, dispatch])
  useEffect(() => {
    dispatch(actions.docs.setIndex(undefined))
    dispatch(actions.docs.setFilter({}))
    dispatch(actions.docs.setSort({ _id: -1 }))
    dispatch(actions.docs.setProjection({}))
  }, [connection, database, collection, dispatch])

  if (!database || !collection) {
    return <div style={{ height }} />
  }

  if (!index) {
    return (
      <Stack
        horizontal={true}
        tokens={{ childrenGap: 10, padding: 10 }}
        styles={{ root: { height } }}
      >
        <FilterInput
          prefix="filter:"
          value={filter}
          onChange={(value) => {
            dispatch(actions.docs.setFilter((value as {}) || {}))
          }}
        />
        <FilterInput
          prefix="sort:"
          value={sort}
          onChange={(value) => {
            dispatch(actions.docs.setSort((value as {}) || {}))
          }}
        />
        <FilterInput
          prefix="projection:"
          value={projection}
          onChange={(value) => {
            dispatch(actions.docs.setProjection((value as {}) || {}))
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
      styles={{ root: { height } }}
    >
      {'textIndexVersion' in index ? (
        <FilterInput<string>
          prefix="Text Search"
          onChange={(value) => {
            dispatch(actions.docs.setFilter({ $text: { $search: value } }))
          }}
        />
      ) : (
        keys.map((key) => {
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
          if (
            index.partialFilterExpression?.[
              key as keyof typeof index.partialFilterExpression
            ]
          ) {
            return (
              <FilterInput
                key={key}
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
