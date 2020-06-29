/* eslint-disable react/jsx-props-no-spreading */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
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
  MarqueeSelection,
  Selection,
} from '@fluentui/react'

import { MongoData } from '@/utils/mongo-shell-data'
import { DisplayMode } from '@/types.d'
import { calcHeaders } from '@/utils/table'
import { TableRow } from './TableRow'
import { LargeMessage } from './LargeMessage'
import { DocumentRow } from './DocumentRow'

export function Table<T extends { [key: string]: MongoData }>(props: {
  displayMode?: DisplayMode
  items?: T[]
  order?: string[]
  onItemInvoked?(item: T): void
  onItemContextMenu?(items: T[], ev?: Event): void
  error: Error
  isValidating: boolean
}) {
  const theme = getTheme()
  const [columns, setColumns] = useState<IColumn[]>([])
  const { items, error, isValidating } = props
  useEffect(() => {
    if (!props.items) {
      return
    }
    setColumns(
      calcHeaders(props.items, props.order).map((key) => ({
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
  const [selectedItems, setSelectedItems] = useState<T[]>([])
  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged() {
          setSelectedItems(selection.getSelection() as T[])
        },
      }),
    [],
  )

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
          <MarqueeSelection selection={selection}>
            {!props.displayMode || props.displayMode === DisplayMode.TABLE ? (
              <DetailsList
                columns={columns}
                constrainMode={ConstrainMode.unconstrained}
                layoutMode={DetailsListLayoutMode.justified}
                items={items || []}
                onRenderItemColumn={(item, _index, column) => (
                  <TableRow value={item} column={column} />
                )}
                onRenderDetailsHeader={onRenderDetailsHeader}
                onItemInvoked={props.onItemInvoked}
                onItemContextMenu={(_item, _index, ev) => {
                  props.onItemContextMenu?.(selectedItems, ev)
                }}
                selectionMode={SelectionMode.multiple}
                selection={selection}
                enterModalSelectionOnTouch={true}
              />
            ) : null}
            {props.displayMode === DisplayMode.DOCUMENT ? (
              <DetailsList
                columns={[
                  {
                    key: '',
                    name: 'Documents',
                    minWidth: 0,
                    isMultiline: true,
                  },
                ]}
                constrainMode={ConstrainMode.unconstrained}
                layoutMode={DetailsListLayoutMode.justified}
                items={items || []}
                onRenderItemColumn={(item) => <DocumentRow value={item} />}
                onRenderDetailsHeader={onRenderDetailsHeader}
                onItemInvoked={props.onItemInvoked}
                onItemContextMenu={(_item, _index, ev) => {
                  props.onItemContextMenu?.(selectedItems, ev)
                }}
                selectionMode={SelectionMode.multiple}
                selection={selection}
                enterModalSelectionOnTouch={true}
              />
            ) : null}
          </MarqueeSelection>
        </ScrollablePane>
      )}
    </div>
  )
}
