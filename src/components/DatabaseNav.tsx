import React, { useState, useEffect } from 'react'
import { SearchBox, Nav, getTheme, INavLink } from '@fluentui/react'
import { useDispatch, useSelector } from 'react-redux'
import useSWR from 'swr'
import _ from 'lodash'

import { actions } from '@/stores'
import { runCommand } from '@/utils/fetcher'

const splitter = '/'

export function DatabaseNav() {
  const theme = getTheme()
  const filter = useSelector((state) => state.root.filter)
  const { data } = useSWR(`listDatabases/${JSON.stringify(filter)}`, () =>
    runCommand<{
      databases: {
        empty: boolean
        name: string
        sizeOnDisk: number
      }[]
    }>('admin', { listDatabases: 1, filter }),
  )
  const [links, setLinks] = useState<INavLink[]>([])
  const dispatch = useDispatch()
  const { database, collection } = useSelector((state) => state.root)
  useEffect(() => {
    setLinks(
      data
        ? data.databases.map(({ name }) => ({
            key: name,
            name,
            links: [
              {
                name: '...',
                url: '',
                disabled: true,
              },
            ],
            url: '',
          }))
        : [],
    )
  }, [data])

  return (
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
        value={filter.name?.$regex}
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
          groups={[
            {
              links: links.length
                ? links
                : [
                    {
                      name: _.isEmpty(filter) ? '' : 'No Database',
                      url: '',
                      disabled: true,
                    },
                  ],
            },
          ]}
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
  )
}
