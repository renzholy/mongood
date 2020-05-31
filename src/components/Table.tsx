/* eslint-disable react/jsx-props-no-spreading */

import React, { useState, useCallback, useEffect } from 'react'
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
  getTheme,
  MessageBar,
  MessageBarType,
  IColumn,
} from '@fluentui/react'
import _ from 'lodash'

import { MongoData } from '@/utils/mongo-shell-data'
import { DocumentModal } from './DocumentModal'
import { TableRow } from './TableRow'

export function Table<T extends { [key: string]: MongoData }>(props: {
  items?: T[]
  order?: string[]
  error: any
  isValidating: boolean
}) {
  const theme = getTheme()
  const [invokedItem, setInvokedItem] = useState<T>()
  const [columns, setColumns] = useState<IColumn[]>([])
  const { items, error, isValidating } = props
  useEffect(() => {
    // calc columns order
    const keys: { [key: string]: number } = {}
    const order = props.order?.reverse() || []
    props.items?.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (!keys[key]) {
          const index = order.indexOf(key)
          keys[key] = index >= 0 ? (index + 1) * 10 : 0
        }
        keys[key] += 1
      })
    })
    setColumns(
      _.sortBy(Object.entries(keys), '1')
        .reverse()
        .map(([key]) => ({
          key,
          name: key,
          minWidth: 240,
        })),
    )
  }, [props.items, props.order])
  const onRenderDetailsHeader = useCallback(
    (detailsHeaderProps?: IDetailsHeaderProps) => (
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
    ),
    [isValidating, theme],
  )
  const onItemInvoked = useCallback((item: T) => {
    setInvokedItem(item)
  }, [])

  if (error) {
    return (
      <div
        style={{
          borderTop: `1px solid ${theme.palette.red}`,
          display: 'flex',
          justifyContent: 'center',
        }}>
        {error.message ? (
          <MessageBar
            messageBarType={MessageBarType.error}
            styles={{ root: { margin: 10 } }}>
            {error.message}
          </MessageBar>
        ) : null}
      </div>
    )
  }
  if (items?.length === 0) {
    return (
      <div
        style={{
          borderTop: `1px solid ${theme.palette.neutralLight}`,
          display: 'flex',
          justifyContent: 'center',
        }}>
        <MessageBar
          messageBarType={MessageBarType.info}
          styles={{ root: { margin: 10 } }}>
          No Data
        </MessageBar>
      </div>
    )
  }
  return (
    <div style={{ position: 'relative', height: 0, flex: 1 }}>
      <DocumentModal
        value={invokedItem}
        onChange={(_invokedItem) => {
          setInvokedItem(_invokedItem)
        }}
      />
      <ScrollablePane
        styles={{
          root: { maxWidth: '100%' },
          stickyBelow: { display: 'none' },
        }}>
        <DetailsList
          columns={columns}
          selectionMode={SelectionMode.none}
          constrainMode={ConstrainMode.unconstrained}
          layoutMode={DetailsListLayoutMode.justified}
          onShouldVirtualize={() => false}
          items={items || []}
          onRenderItemColumn={(item, _index, column) => (
            <TableRow value={item} column={column} />
          )}
          onRenderDetailsHeader={onRenderDetailsHeader}
          onItemInvoked={onItemInvoked}
        />
      </ScrollablePane>
    </div>
  )
}
