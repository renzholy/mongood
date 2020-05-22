import React, { useState, useEffect } from 'react'
import { SearchBox, Nav, getTheme, INavLink } from '@fluentui/react'
import { useDispatch, useSelector } from 'react-redux'
import useSWR from 'swr'
import { useHistory } from 'umi'

import { actions } from '@/stores'
import { runCommand, listDatabases } from '@/utils/fetcher'

const splitter = '/'

export function DatabaseNav(props: { database?: string; collection?: string }) {
  const theme = getTheme()
  const { filter } = useSelector((state) => state.root)
  const { data } = useSWR(`listDatabases/${JSON.stringify(filter)}`, () =>
    listDatabases(filter),
  )
  const [links, setLinks] = useState<INavLink[]>([])
  const dispatch = useDispatch()
  const history = useHistory()
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
          selectedKey={`${props.database}${splitter}${props.collection}`}
          onLinkClick={(_ev, item) => {
            if (!item?.links && item?.key) {
              history.push(`/docs/${item.key}`)
            }
          }}
          onLinkExpandClick={(_ev, item) => {
            if (item && !item.isExpanded) {
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
