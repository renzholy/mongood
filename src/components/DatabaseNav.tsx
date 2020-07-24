/* eslint-disable no-nested-ternary */

import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { SearchBox, Nav, getTheme, INavLink, IconButton } from '@fluentui/react'
import { useDispatch, useSelector } from 'react-redux'
import useSWR from 'swr'
import { pullAll, compact, some, difference, union } from 'lodash'
import useAsyncEffect from 'use-async-effect'

import { actions } from '@/stores'
import { runCommand } from '@/utils/fetcher'
import { DatabaseContextualMenu } from './DatabaseContextualMenu'

const splitter = '/'

export function DatabaseNav() {
  const theme = getTheme()
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const expandedDatabases = useSelector((state) => state.root.expandedDatabases)
  const collectionsMap = useSelector((state) => state.root.collectionsMap)
  const trigger = useSelector((state) => state.root.trigger)
  const [keyword, setKeyword] = useState('')
  const { data } = useSWR(
    `listDatabases/${connection}/${trigger}`,
    () =>
      runCommand<{
        databases: {
          empty: boolean
          name: string
          sizeOnDisk: number
        }[]
      }>(connection, 'admin', { listDatabases: 1 }),
    { revalidateOnFocus: false },
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
      ...pullAll(_databases.sort(), systemDatabases),
    ])
  }, [data])
  const handleListCollectionOfDatabases = useCallback(
    async (_databases: string[]) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const _database of _databases) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const collections = await listCollections(_database)
          const systemCollections = collections.filter((c) =>
            c.startsWith('system.'),
          )
          dispatch(
            actions.root.setCollectionsMap({
              database: _database,
              collections: [
                ...systemCollections.sort(),
                ...pullAll(collections.sort(), systemCollections),
              ],
            }),
          )
          // eslint-disable-next-line no-empty
        } catch {}
      }
    },
    [listCollections, dispatch],
  )
  useAsyncEffect(async () => {
    await handleListCollectionOfDatabases(expandedDatabases)
  }, [expandedDatabases, handleListCollectionOfDatabases])
  useAsyncEffect(async () => {
    await handleListCollectionOfDatabases(databases)
  }, [databases, handleListCollectionOfDatabases])
  const links = useMemo<INavLink[]>(
    () =>
      databases.length
        ? compact(
            databases.map((_database) => {
              const databaseMatched = _database.includes(keyword)
              const collectionMatched = some(
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
                    ? collectionsMap[_database].length
                      ? collectionsMap[_database]
                          .filter(
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
                          }))
                      : [
                          {
                            name: 'No Collection',
                            url: '',
                            disabled: true,
                          },
                        ]
                    : [
                        {
                          name: 'Loading',
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
  }, [connection, dispatch])
  const [isMenuHidden, setIsMenuHidden] = useState(true)
  const target = useRef<MouseEvent>()
  const [ns, setNs] = useState('')

  return (
    <div
      style={{
        backgroundColor: theme.palette.neutralLighterAlt,
        width: 210,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <DatabaseContextualMenu
        hidden={isMenuHidden}
        onDismiss={() => {
          setIsMenuHidden(true)
        }}
        target={target.current}
        database={ns.split(splitter)[0]}
        collection={ns.split(splitter)[1]}
      />
      <SearchBox
        placeholder="Database & Collection"
        styles={{ root: { margin: 10, flexShrink: 0 } }}
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
                    ? difference(expandedDatabases, [item.key])
                    : union(expandedDatabases, [item.key]),
                ),
              )
            }
          }}
          onRenderLink={(l) => {
            return l ? (
              <div
                style={{
                  flex: 1,
                  textAlign: 'start',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                onContextMenu={(ev) => {
                  target.current = ev.nativeEvent
                  if (l.key) {
                    setNs(l.key)
                  }
                  setIsMenuHidden(false)
                  ev.preventDefault()
                }}>
                {l.name}
              </div>
            ) : null
          }}
        />
      </div>
      <IconButton
        styles={{ root: { flexShrink: 0, alignSelf: 'flex-end', margin: 10 } }}
        iconProps={{ iconName: 'Add' }}
      />
    </div>
  )
}
