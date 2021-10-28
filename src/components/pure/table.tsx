/* eslint-disable react/jsx-props-no-spreading */

import { useCallback } from 'react'
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
} from '@fluentui/react'
import LargeMessage from './large-message'

export default function Table<T>(props: {
  items: T[]
  columns: IColumn[]
  onItemInvoked?(item: T): void
  onItemContextMenu?(ev?: MouseEvent, item?: T): void
  onRenderItemColumn(
    item?: T,
    _index?: number,
    column?: IColumn,
  ): React.ReactNode
  getKey?(item: T, index?: number): string
  selection?: Selection
}) {
  const theme = getTheme()
  const handleRenderDetailsHeader = useCallback(
    (detailsHeaderProps?: IDetailsHeaderProps) => (
      <Sticky>
        <DetailsHeader
          {...(detailsHeaderProps as IDetailsHeaderProps)}
          styles={{
            root: {
              paddingTop: 0,
              paddingBottom: 0,
            },
          }}
        />
      </Sticky>
    ),
    [],
  )
  const handleItemInvoked = useCallback(
    (item: T) => {
      props.onItemInvoked?.(item)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.onItemInvoked],
  )

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
        }}
      >
        <MarqueeSelection
          selection={props.selection!}
          isEnabled={!!props.selection}
        >
          <DetailsList
            columns={props.columns}
            getKey={props.getKey}
            onShouldVirtualize={() => false}
            constrainMode={ConstrainMode.unconstrained}
            layoutMode={DetailsListLayoutMode.justified}
            items={props.items}
            onRenderItemColumn={props.onRenderItemColumn}
            onRenderDetailsHeader={handleRenderDetailsHeader}
            onItemInvoked={handleItemInvoked}
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
