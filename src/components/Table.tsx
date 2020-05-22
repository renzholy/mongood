/* eslint-disable react/jsx-props-no-spreading */

import React, { useState, useCallback } from 'react'
import {
  DetailsList,
  SelectionMode,
  DetailsListLayoutMode,
  ConstrainMode,
  Sticky,
  ScrollablePane,
  DetailsHeader,
  IDetailsHeaderProps,
  ProgressIndicator,
  ContextualMenu,
  getTheme,
  HoverCard,
  Text,
  HoverCardType,
} from '@fluentui/react'
import useSWR from 'swr'
import { useSelector } from 'react-redux'
import _ from 'lodash'

import { runCommand } from '@/utils/fetcher'
import { stringify } from '@/utils/mongo-shell-data'

export function Table() {
  const theme = getTheme()
  const { database, collection } = useSelector((state) => state.root)
  const { index, filter, sort, skip, limit } = useSelector(
    (state) => state.docs,
  )
  const [event, setEvent] = useState<MouseEvent>()
  const [item, setItem] = useState<any>()
  const { data, isValidating } = useSWR(
    database && collection
      ? `find/${database}/${collection}/${skip}/${limit}/${JSON.stringify(
          filter,
        )}/${JSON.stringify(sort)}`
      : null,
    () => {
      return runCommand<{ cursor: { firstBatch: unknown[] } }>(
        database,
        {
          find: collection,
          filter,
          sort,
          hint: _.isEmpty(filter) ? undefined : index?.name,
          skip,
          limit,
        },
        { canonical: true },
      )
    },
    {
      refreshInterval: 60 * 1000,
      errorRetryCount: 0,
    },
  )
  const onRenderPlainCard = useCallback((str: string) => {
    return (
      <div
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          maxWidth: 500,
          maxHeight: 500,
          overflowY: 'scroll',
        }}>
        <Text>
          <pre style={{ whiteSpace: 'pre' }}>{str}</pre>
        </Text>
      </div>
    )
  }, [])

  if (!data || data.cursor.firstBatch.length === 0) {
    return (
      <div
        style={{
          borderTop: `1px solid ${theme.palette.neutralLight}`,
        }}
      />
    )
  }
  return (
    <div style={{ position: 'relative', height: 0, flex: 1 }}>
      <ContextualMenu
        items={[
          {
            key: 'copy',
            text: 'Copy Document',
            onClick: () => {
              window.navigator.clipboard.writeText(stringify(item))
            },
          },
        ]}
        hidden={!event}
        target={event}
        onItemClick={() => {
          setEvent(undefined)
        }}
        onDismiss={() => {
          setEvent(undefined)
        }}
      />
      <ScrollablePane
        styles={{
          root: { maxWidth: '100%' },
          stickyBelow: { display: 'none' },
        }}>
        <DetailsList
          selectionMode={SelectionMode.none}
          constrainMode={ConstrainMode.unconstrained}
          layoutMode={DetailsListLayoutMode.fixedColumns}
          items={data.cursor.firstBatch || []}
          onRenderItemColumn={(_item, _index, colume) => {
            const str = stringify(_item[colume?.key!])
            return str.length > 100 ? (
              <HoverCard
                type={HoverCardType.plain}
                plainCardProps={{
                  onRenderPlainCard,
                  renderData: str,
                }}
                styles={{
                  host: { cursor: 'pointer' },
                }}
                instantOpenOnClick={true}>
                {str}
              </HoverCard>
            ) : (
              str
            )
          }}
          onRenderDetailsHeader={(detailsHeaderProps) => (
            <Sticky>
              <ProgressIndicator
                progressHidden={!isValidating}
                barHeight={1}
                styles={{ itemProgress: { padding: 0 } }}
              />
              <DetailsHeader
                {...(detailsHeaderProps as IDetailsHeaderProps)}
                styles={{
                  root: {
                    paddingTop: 0,
                    borderTop: isValidating
                      ? 0
                      : `1px solid ${theme.palette.neutralLight}`,
                    paddingBottom: -1,
                  },
                }}
              />
            </Sticky>
          )}
          onItemContextMenu={(_item, _index, ev) => {
            setEvent(ev as MouseEvent)
            setItem(_item)
          }}
        />
      </ScrollablePane>
    </div>
  )
}
