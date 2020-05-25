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
  MessageBar,
  MessageBarType,
  IColumn,
} from '@fluentui/react'

import { stringify } from '@/utils/mongo-shell-data'

export function Table(props: {
  items?: any[]
  error: any
  isValidating: boolean
}) {
  const theme = getTheme()
  const [event, setEvent] = useState<MouseEvent>()
  const [item, setItem] = useState<any>()
  const { items, error, isValidating } = props
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
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {str}
          </pre>
        </Text>
      </div>
    )
  }, [])
  const onRenderItemColumn = useCallback(
    (_item?: any, _index?: number, column?: IColumn) => {
      const str = stringify(_item[column?.key!], 2)
      return str.length > 100 ? (
        <HoverCard
          type={HoverCardType.plain}
          plainCardProps={{
            onRenderPlainCard,
            renderData: str,
          }}
          styles={{
            host: {
              cursor: 'pointer',
              color: theme.palette.neutralSecondary,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            },
          }}
          instantOpenOnClick={true}>
          {str}
        </HoverCard>
      ) : (
        str
      )
    },
    [onRenderPlainCard, theme],
  )
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
  const onItemContextMenu = useCallback(
    (_item?: any, _index?: number, ev?: Event) => {
      setEvent(ev as MouseEvent)
      setItem(_item)
    },
    [],
  )

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
      <ContextualMenu
        items={[
          {
            key: 'copy',
            text: 'Copy Document',
            onClick: () => {
              window.navigator.clipboard.writeText(stringify(item, 2))
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
          onShouldVirtualize={() => false}
          items={items || []}
          onRenderItemColumn={onRenderItemColumn}
          onRenderDetailsHeader={onRenderDetailsHeader}
          onItemContextMenu={onItemContextMenu}
        />
      </ScrollablePane>
    </div>
  )
}
