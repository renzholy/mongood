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

import { MongoData } from '@/utils/mongo-shell-data'
import { DisplayMode } from '@/types.d'
import { TableRow } from './TableRow'
import { LargeMessage } from './LargeMessage'
import { DocumentRow } from './DocumentRow'

export function Table<T extends { [key: string]: MongoData }>(props: {
  displayMode?: DisplayMode
  items?: T[]
  order?: string[]
  onItemInvoked?(item: T): void
  onItemContextMenu?(item?: T, index?: number, ev?: Event): void | boolean
  error: Error
  isValidating: boolean
}) {
  const theme = getTheme()
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
          {!props.displayMode || props.displayMode === DisplayMode.TABLE ? (
            <DetailsList
              columns={columns}
              selectionMode={SelectionMode.none}
              constrainMode={ConstrainMode.unconstrained}
              layoutMode={DetailsListLayoutMode.justified}
              items={items || []}
              onRenderItemColumn={(item, _index, column) => (
                <TableRow value={item} column={column} />
              )}
              onRenderDetailsHeader={onRenderDetailsHeader}
              onItemInvoked={props.onItemInvoked}
              onItemContextMenu={props.onItemContextMenu}
            />
          ) : null}
          {props.displayMode === DisplayMode.DOCUMENT ? (
            <DetailsList
              columns={[
                {
                  key: '',
                  name: '',
                  minWidth: 0,
                  isMultiline: true,
                },
              ]}
              isHeaderVisible={false}
              selectionMode={SelectionMode.none}
              constrainMode={ConstrainMode.unconstrained}
              layoutMode={DetailsListLayoutMode.justified}
              items={items || []}
              onRenderItemColumn={(item) => <DocumentRow value={item} />}
              onRenderDetailsHeader={onRenderDetailsHeader}
              onItemInvoked={props.onItemInvoked}
              onItemContextMenu={props.onItemContextMenu}
            />
          ) : null}
        </ScrollablePane>
      )}
    </div>
  )
}
