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
  MarqueeSelection,
  Selection,
} from '@fluentui/react'
import _ from 'lodash'

import { MongoData } from '@/utils/mongo-shell-data'
import { DisplayMode } from '@/types.d'
import { calcHeaders } from '@/utils/table'
import { TableCell } from './TableCell'
import { LargeMessage } from './LargeMessage'
import { DocumentRow } from './DocumentRow'

export const Table = React.memo(
  <T extends { [key: string]: MongoData }>(props: {
    displayMode?: DisplayMode
    items?: T[]
    order?: string[]
    onItemInvoked?(item: T): void
    onItemContextMenu?(ev?: MouseEvent, item?: T): void
    selection?: Selection
    error: Error
    isValidating: boolean
  }) => {
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
    const onRenderTableItemColumn = useCallback(
      (item, _index, column) => (
        <TableCell value={item[column?.key as keyof typeof item]} />
      ),
      [],
    )
    const onRenderDocumentItemColumn = useCallback(
      (item) => <DocumentRow value={item} />,
      [],
    )
    const getKey = useCallback((item) => {
      return item?._id?.$oid || item._id
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
            <MarqueeSelection
              selection={props.selection!}
              isEnabled={!!props.selection}>
              {!props.displayMode || props.displayMode === DisplayMode.TABLE ? (
                <DetailsList
                  getKey={getKey}
                  columns={columns}
                  constrainMode={ConstrainMode.unconstrained}
                  layoutMode={DetailsListLayoutMode.justified}
                  items={items || []}
                  onRenderItemColumn={onRenderTableItemColumn}
                  onRenderDetailsHeader={onRenderDetailsHeader}
                  onItemInvoked={props.onItemInvoked}
                  onItemContextMenu={(item, _index, ev) => {
                    props.onItemContextMenu?.(ev as MouseEvent, item)
                  }}
                  selectionMode={
                    props.selection
                      ? SelectionMode.multiple
                      : SelectionMode.none
                  }
                  selection={props.selection}
                  enterModalSelectionOnTouch={true}
                  selectionPreservedOnEmptyClick={true}
                />
              ) : null}
              {props.displayMode === DisplayMode.DOCUMENT ? (
                <DetailsList
                  getKey={getKey}
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
                  onRenderItemColumn={onRenderDocumentItemColumn}
                  onRenderDetailsHeader={onRenderDetailsHeader}
                  onItemInvoked={props.onItemInvoked}
                  onItemContextMenu={(item, _index, ev) => {
                    props.onItemContextMenu?.(ev as MouseEvent, item)
                  }}
                  selectionMode={
                    props.selection
                      ? SelectionMode.multiple
                      : SelectionMode.none
                  }
                  selection={props.selection}
                  enterModalSelectionOnTouch={true}
                  selectionPreservedOnEmptyClick={true}
                />
              ) : null}
            </MarqueeSelection>
          </ScrollablePane>
        )}
      </div>
    )
  },
  _.isEqual,
)
