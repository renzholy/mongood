import React, { useEffect, useCallback, useState, useMemo } from 'react'
import { SearchBox, Nav, getTheme } from '@fluentui/react'
import { useDispatch, useSelector } from 'react-redux'
import useSWR from 'swr'
import _ from 'lodash'

import { actions } from '@/stores'
import { runCommand } from '@/utils/fetcher'

const splitter = '/'

export function DatabaseNav() {
  const theme = getTheme()
  const {
    connection,
    database,
    collection,
    expandedDatabases,
    collectionsMap,
  } = useSelector((state) => state.root)
  const [keyword, setKeyword] = useState('')
  const { data } = useSWR(`listDatabases/${connection}`, () =>
    runCommand<{
      databases: {
        empty: boolean
        name: string
        sizeOnDisk: number
      }[]
    }>(connection, 'admin', { listDatabases: 1 }),
  )
  const dispatch = useDispatch()
  const listCollections = useCallback(
    async (_database: string) => {
      const {
        cursor: { firstBatch },
      } = await runCommand<{ cursor: { firstBatch: { name: string }[] } }>(
        connection,
        _database,
        {
          listCollections: 1,
        },
      )
      return firstBatch.map(({ name }) => name)
    },
    [connection],
  )
  const [databases, setDatabases] = useState<string[]>([])
  useEffect(() => {
    const _databases = data?.databases.map(({ name }) => name) || []
    const systemDatabases = _databases.filter(
      (d) => d === 'admin' || d === 'local' || d === 'config',
    )
    setDatabases([
      ...systemDatabases.sort(),
      ..._.pullAll(_databases.sort(), systemDatabases),
    ])
  }, [data])
  useEffect(() => {
    databases.forEach(async (_database) => {
      const collections = await listCollections(_database)
      const systemCollections = collections.filter((c) =>
        c.startsWith('system.'),
      )
      dispatch(
        actions.root.setCollectionsMap({
          database: _database,
          collections: [
            ...systemCollections.sort(),
            ..._.pullAll(collections.sort(), systemCollections),
          ],
        }),
      )
    })
  }, [databases, listCollections])
  const links = useMemo(
    () =>
      databases.length
        ? _.compact(
            databases.map((_database) => {
              const databaseMatched = _database.includes(keyword)
              const collectionMatched = _.some(
                collectionsMap[_database],
                (_collection) => _collection.includes(keyword),
              )
              if (databaseMatched || collectionMatched) {
                return {
                  key: _database,
                  name: _database,
                  title: _database,
                  url: '',
                  isExpanded:
                    expandedDatabases.includes(_database) ||
                    (!!keyword && (databaseMatched || collectionMatched)),
                  links: collectionsMap[_database]
                    ?.filter(
                      (_collection) =>
                        databaseMatched ||
                        !keyword ||
                        _collection.includes(keyword),
                    )
                    .map((_collection) => ({
                      key: `${_database}${splitter}${_collection}`,
                      name: _collection,
                      title: _collection,
                      url: '',
                    })) || [
                    {
                      name: 'No Collection',
                      url: '',
                      disabled: true,
                    },
                  ],
                }
              }
              return undefined
            }),
          )
        : [
            {
              name: 'No Database',
              url: '',
              disabled: true,
            },
          ],
    [databases, expandedDatabases, collectionsMap, keyword],
  )
  useEffect(() => {
    dispatch(actions.root.setDatabase())
    dispatch(actions.root.setCollection())
    dispatch(actions.root.setExpandedDatabases([]))
    dispatch(actions.root.resetCollectionsMap())
  }, [connection])

  return (
    <div
      style={{
        backgroundColor: theme.palette.neutralLighterAlt,
        width: 210,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <SearchBox
        autoFocus={true}
        placeholder="Database & Collection"
        styles={{ root: { margin: 10 } }}
        value={keyword}
        onChange={(_ev, newValue) => {
          setKeyword(newValue || '')
        }}
      />
      <div
        style={{
          flex: 1,
          height: 0,
          overflowY: 'scroll',
        }}>
        <Nav
          groups={[{ links }]}
          selectedKey={`${database}${splitter}${collection}`}
          onLinkClick={(_ev, item) => {
            if (!item?.links && item?.key) {
              const [_database, _collection] = item.key.split(splitter)
              if (database === _database && collection === _collection) {
                dispatch(actions.root.setDatabase(undefined))
                dispatch(actions.root.setCollection(undefined))
              } else {
                dispatch(actions.root.setDatabase(_database))
                dispatch(actions.root.setCollection(_collection))
              }
            }
          }}
          onLinkExpandClick={(_ev, item) => {
            if (item?.key) {
              dispatch(
                actions.root.setExpandedDatabases(
                  item.isExpanded
                    ? _.difference(expandedDatabases, [item.key])
                    : _.union(expandedDatabases, [item.key]),
                ),
              )
            }
          }}
        />
      </div>
    </div>
  )
}
