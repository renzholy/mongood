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
  IColumn,
} from '@fluentui/react'
import _ from 'lodash'
import { useSelector, useDispatch } from 'react-redux'

import { MongoData } from '@/utils/mongo-shell-data'
import { actions } from '@/stores'
import { DocumentUpdateModal } from './DocumentUpdateModal'
import { TableRow } from './TableRow'
import { DocumentInsertModal } from './DocumentInsertModal'
import { LargeMessage } from './LargeMessage'

export function Table<T extends { [key: string]: MongoData }>(props: {
  items?: T[]
  order?: string[]
  error: any
  isValidating: boolean
}) {
  const theme = getTheme()
  const [invokedItem, setInvokedItem] = useState<T>()
  const { isInsertOpen, isUpdateOpen } = useSelector((state) => state.docs)
  const dispatch = useDispatch()
  const [columns, setColumns] = useState<IColumn[]>([])
  const { items, error, isValidating } = props
  useEffect(() => {
    // calc columns order
    const keys: { [key: string]: number } = {}
    props.items?.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (!keys[key] && props.order) {
          const index = props.order.indexOf(key)
          keys[key] = index >= 0 ? (props.order.length - index) * 10 : 0
        }
        keys[key] += 1
      })
    })
    setColumns(
      _.sortBy(Object.entries(keys), (k) => k[1])
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
    dispatch(actions.docs.setIsUpdateOpen(true))
  }, [])

  if (error) {
    return (
      <LargeMessage
        style={{
          borderTop: `1px solid ${theme.palette.red}`,
        }}
        iconName="Error"
        title="Error"
        content={error.message}
      />
    )
  }
  return (
    <div style={{ position: 'relative', height: 0, flex: 1 }}>
      <DocumentInsertModal
        isOpen={isInsertOpen}
        onDismiss={() => {
          dispatch(actions.docs.setIsInsertOpen(false))
        }}
      />
      <DocumentUpdateModal
        value={invokedItem}
        isOpen={isUpdateOpen}
        onDismiss={() => {
          dispatch(actions.docs.setIsUpdateOpen(false))
        }}
      />
      {items?.length === 0 ? (
        <LargeMessage
          style={{
            borderTop: `1px solid ${theme.palette.neutralLight}`,
          }}
          iconName="Database"
          title="No Data"
        />
      ) : (
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
      )}
    </div>
  )
}
