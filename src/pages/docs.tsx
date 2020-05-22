import React, { useState, useEffect } from 'react'
import { INavLink, Nav, getTheme, SearchBox } from '@fluentui/react'
import useSWR from 'swr'
import { useDispatch, useSelector } from 'react-redux'

import { listDatabases, runCommand } from '@/utils/fetcher'
import { Table } from '@/components/Table'
import { IndexesStack } from '@/components/IndexesStack'
import { FilterStack } from '@/components/FilterStack'
import { actions } from '@/stores'

const splitter = '/'

export default () => {
  const theme = getTheme()
  const filter = useSelector((state) => state.root.filter)
  const { data } = useSWR(`listDatabases/${JSON.stringify(filter)}`, () =>
    listDatabases(filter),
  )
  const [links, setLinks] = useState<INavLink[]>([])
  const dispatch = useDispatch()
  const { database, collection } = useSelector((state) => state.root)
  useEffect(() => {
    setLinks(
      data
        ? data.Databases.map((_database) => ({
            key: _database.Name,
            name: _database.Name,
            links: [
              {
                name: '...',
                url: '',
              },
            ],
            url: '',
          }))
        : [],
    )
  }, [data])

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div
        style={{
          backgroundColor: theme.palette.neutralLighterAlt,
          width: 200,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <SearchBox
          placeholder="Search Database"
          styles={{ root: { margin: 10 } }}
          onChange={(_ev, newValue) => {
            dispatch(
              actions.root.setFilter(
                newValue ? { name: { $regex: newValue } } : {},
              ),
            )
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
                dispatch(actions.root.setDatabase(_database))
                dispatch(actions.root.setCollection(_collection))
              }
            }}
            onLinkExpandClick={(_ev, item) => {
              if (item) {
                runCommand<{ cursor: { firstBatch: { name: string }[] } }>(
                  item.name,
                  {
                    listCollections: 1,
                  },
                ).then(({ cursor: { firstBatch } }) => {
                  setLinks(
                    links.map((link) => {
                      return link.name === item.name
                        ? {
                            ...link,
                            links: firstBatch.map(({ name }) => ({
                              key: `${link.name}${splitter}${name}`,
                              name,
                              url: '',
                            })),
                          }
                        : link
                    }),
                  )
                })
              }
            }}
          />
        </div>
      </div>
      <div
        style={{ flex: 1, width: 0, display: 'flex', flexDirection: 'column' }}>
        {database && collection ? (
          <>
            <IndexesStack />
            <FilterStack />
            <Table />
          </>
        ) : null}
      </div>
    </div>
  )
}
