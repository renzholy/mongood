/* eslint-disable react/jsx-props-no-spreading */

import React, { useCallback, useMemo } from 'react'
import {
  DetailsList,
  SelectionMode,
  DetailsListLayoutMode,
  ConstrainMode,
  Sticky,
  ScrollablePane,
  DetailsHeader,
  IDetailsHeaderProps,
  getTheme,
  IColumn,
  MarqueeSelection,
  Selection,
  ColumnActionsMode,
} from '@fluentui/react'
import { get } from 'lodash'

import { DisplayMode, MongoData } from '@/types'
import { calcHeaders } from '@/utils/table'
import { DocumentCell } from './DocumentCell'
import { LargeMessage } from './LargeMessage'
import { ColorizedData } from './ColorizedData'

export function Table<T extends { [key: string]: MongoData }>(props: {
  displayMode: DisplayMode
  items: T[]
  order?: string[]
  onItemInvoked?(item: T): void
  onItemContextMenu?(ev?: MouseEvent, item?: T): void
  selection?: Selection
  index2dsphere?: string
}) {
  const theme = getTheme()
  const columns = useMemo<IColumn[]>(() => {
    if (!props.items || props.items.length === 0) {
      return []
    }
    return props.displayMode === DisplayMode.TABLE
      ? calcHeaders(props.items, props.order).map(({ key, minWidth }) => ({
          key,
          name: key,
          minWidth,
          columnActionsMode: ColumnActionsMode.disabled,
          isResizable: true,
        }))
      : [
          {
            key: '',
            name: 'Documents',
            minWidth: 0,
            isMultiline: true,
          },
        ]
  }, [props.displayMode, props.items, props.order])
  const handleRenderDetailsHeader = useCallback(
    (detailsHeaderProps?: IDetailsHeaderProps) => (
      <Sticky>
        <DetailsHeader
          {...(detailsHeaderProps as IDetailsHeaderProps)}
          styles={{
            root: {
              paddingTop: 0,
              borderTop: `1px solid ${theme.palette.neutralLight}`,
              paddingBottom: -1,
            },
          }}
        />
      </Sticky>
    ),
    [theme],
  )
  const handleRenderItemColumn = useCallback(
    (item?: { [key: string]: MongoData }, _index?: number, column?: IColumn) =>
      props.displayMode === DisplayMode.DOCUMENT ? (
        <ColorizedData value={item} />
      ) : (
        <DocumentCell
          value={item?.[column?.key as keyof typeof item]}
          subStringLength={
            // eslint-disable-next-line no-bitwise
            column?.currentWidth ? undefined : column?.minWidth! >> 2
          }
          index2dsphere={
            props.index2dsphere &&
            column?.key &&
            props.index2dsphere.startsWith(column?.key)
              ? get(item, props.index2dsphere)
              : undefined
          }
        />
      ),
    [props.index2dsphere, props.displayMode],
  )

  const handleGetKey = useCallback((item: T, index?: number) => {
    return item._id ? JSON.stringify(item._id) : JSON.stringify(item) + index
  }, [])

  if (props.items.length === 0) {
    return (
      <LargeMessage
        style={{
          borderTop: `1px solid ${theme.palette.neutralLight}`,
        }}
        iconName="Database"
        title="No Data"
      />
    )
  }
  return (
    <div style={{ position: 'relative', height: 0, flex: 1 }}>
      <ScrollablePane
        styles={{
          root: { maxWidth: '100%' },
          stickyBelow: { display: 'none' },
        }}>
        <MarqueeSelection
          selection={props.selection!}
          isEnabled={!!props.selection}>
          <DetailsList
            columns={columns}
            getKey={handleGetKey}
            usePageCache={true}
            onShouldVirtualize={() => false}
            useReducedRowRenderer={true}
            constrainMode={ConstrainMode.unconstrained}
            layoutMode={DetailsListLayoutMode.justified}
            items={props.items}
            onRenderItemColumn={handleRenderItemColumn}
            onRenderDetailsHeader={handleRenderDetailsHeader}
            onItemInvoked={props.onItemInvoked}
            onItemContextMenu={(item, _index, ev) => {
              props.onItemContextMenu?.(ev as MouseEvent, item)
            }}
            selectionMode={
              props.selection ? SelectionMode.multiple : SelectionMode.none
            }
            selection={props.selection}
            enterModalSelectionOnTouch={true}
            selectionPreservedOnEmptyClick={true}
          />
        </MarqueeSelection>
      </ScrollablePane>
    </div>
  )
}
