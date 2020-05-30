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
  ContextualMenu,
  getTheme,
  HoverCard,
  Text,
  HoverCardType,
  MessageBar,
  MessageBarType,
  IColumn,
  Modal,
} from '@fluentui/react'
import Editor from '@monaco-editor/react'
import _ from 'lodash'

import { stringify } from '@/utils/mongo-shell-data'

export function Table<T extends object>(props: {
  items?: T[]
  error: any
  isValidating: boolean
}) {
  const theme = getTheme()
  const [event, setEvent] = useState<MouseEvent>()
  const [selectedItem, setSelectedItem] = useState<T>()
  const [columns, setColumns] = useState<IColumn[]>([])
  const { items, error, isValidating } = props
  useEffect(() => {
    const keys: { [key: string]: number } = { _id: 1 }
    props.items?.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (!keys[key]) {
          keys[key] = 0
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
          isResizable: true,
        })),
    )
  }, [props.items])
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
    (item?: any, _index?: number, column?: IColumn) => {
      const str = stringify(item[column?.key!], 2)
      return str.length >= 40 ? (
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
    (item?: any, _index?: number, ev?: Event) => {
      setEvent(ev as MouseEvent)
      setSelectedItem(item)
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
              window.navigator.clipboard.writeText(stringify(selectedItem, 2))
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
      <Modal
        styles={{ main: { width: '50vw', height: '50vh' } }}
        isOpen={!!selectedItem}
        onDismiss={() => {
          setSelectedItem(undefined)
        }}>
        <Editor
          width="50vw"
          height="50vh"
          language="javascript"
          value={`doc = ${stringify(selectedItem, 2)}`}
          options={{
            minimap: { enabled: false },
          }}
        />
      </Modal>
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
          onRenderItemColumn={onRenderItemColumn}
          onRenderDetailsHeader={onRenderDetailsHeader}
          onItemContextMenu={onItemContextMenu}
        />
      </ScrollablePane>
    </div>
  )
}
