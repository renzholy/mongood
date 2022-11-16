import { useEffect, useCallback, useState, useMemo } from 'react'
import { SearchBox, Nav, getTheme, INavLink } from '@fluentui/react'
import { pullAll, compact, some, difference, union } from 'lodash-es'
import { actions } from 'stores'
import { runCommand } from 'utils/fetcher'
import { useCommandDatabases } from 'hooks/use-command'
import useRouterQuery from 'hooks/use-router-query'
import { useConnection } from 'hooks/use-connections'
import ConnectionButton from './connection-button'
import { useAppSelector, useAppDispatch } from 'hooks/use-app'

const splitter = '/'

export default function DatabaseNav() {
  const theme = getTheme()
  const [{ conn, database, collection }, setRoute] = useRouterQuery()
  const expandedDatabases = useAppSelector(
    (state) => state.root.expandedDatabases,
  )
  const collectionsMap = useAppSelector((state) => state.root.collectionsMap)
  const [keyword, setKeyword] = useState('')
  const { data } = useCommandDatabases()
  const dispatch = useAppDispatch()
  const connection = useConnection(conn)
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
  const databases = useMemo(() => {
    const _databases = data?.databases.map(({ name }) => name) || []
    const systemDatabases = _databases.filter(
      (d) => d === 'admin' || d === 'local' || d === 'config',
    )
    return [
      ...systemDatabases.sort(),
      ...pullAll(_databases.sort(), systemDatabases),
    ]
  }, [data])
  const handleListCollectionOfDatabases = useCallback(
    async (_databases: string[]) => {
      for (const _database of _databases) {
        try {
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
        } catch {}
      }
    },
    [listCollections, dispatch],
  )
  useEffect(() => {
    handleListCollectionOfDatabases(expandedDatabases)
  }, [expandedDatabases, handleListCollectionOfDatabases])
  useEffect(() => {
    handleListCollectionOfDatabases(databases)
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
    dispatch(actions.root.setExpandedDatabases([]))
    dispatch(actions.root.resetCollectionsMap())
  }, [conn, dispatch])

  return (
    <div
      style={{
        backgroundColor: theme.palette.neutralLighterAlt,
        width: 210,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
        }}
      >
        <Nav
          groups={[{ links }]}
          selectedKey={`${database}${splitter}${collection}`}
          onLinkClick={(_ev, item) => {
            if (!item?.links && item?.key) {
              const [_database, _collection] = item.key.split(splitter)
              if (database === _database && collection === _collection) {
                setRoute({ conn })
              } else {
                setRoute({
                  conn,
                  database: _database,
                  collection: _collection,
                })
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
          onRenderLink={(l) =>
            l ? (
              <div
                style={{
                  flex: 1,
                  textAlign: 'start',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {l.name}
              </div>
            ) : null
          }
        />
      </div>
      <div
        style={{
          flexShrink: 0,
          backgroundColor: theme.palette.neutralLight,
        }}
      >
        <ConnectionButton
          style={{
            width: '100%',
          }}
        />
      </div>
    </div>
  )
}
