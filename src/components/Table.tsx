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
  HoverCard,
  Text,
  HoverCardType,
  MessageBar,
  MessageBarType,
  IColumn,
  Modal,
  IconButton,
  DefaultButton,
} from '@fluentui/react'
import Editor, { monaco } from '@monaco-editor/react'
import _ from 'lodash'

import { stringify, MongoData } from '@/utils/mongo-shell-data'

monaco.init().then((_monaco) => {
  _monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: [1005, 1128, 7028],
  })
})

export function Table<T extends { [key: string]: MongoData }>(props: {
  items?: T[]
  error: any
  isValidating: boolean
}) {
  const theme = getTheme()
  const [invokedItem, setInvokedItem] = useState<T>()
  const [columns, setColumns] = useState<IColumn[]>([])
  const { items, error, isValidating } = props
  useEffect(() => {
    const keys: { [key: string]: number } = {}
    props.items?.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (!keys[key]) {
          keys[key] = key === '_id' ? 1 : 0
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
    (item: T, _index?: number, column?: IColumn) => {
      const str = stringify(item[column?.key as keyof typeof item], 2)
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
      <Modal
        styles={{
          scrollableContent: {
            width: '50vw',
            height: '50vh',
            borderTop: `4px solid ${theme.palette.themePrimary}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        isOpen={!!invokedItem}
        onDismiss={() => {
          setInvokedItem(undefined)
        }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
          }}>
          <Text
            variant="xLarge"
            block={true}
            styles={{
              root: {
                height: 32,
                alignItems: 'center',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              },
            }}>
            {stringify(invokedItem?._id)}
          </Text>
          <IconButton
            styles={{ root: { marginLeft: 10 } }}
            iconProps={{ iconName: 'Cancel' }}
            onClick={() => {
              setInvokedItem(undefined)
            }}
          />
        </div>
        <Editor
          language="javascript"
          value={stringify(invokedItem, 2)}
          options={{
            wordWrap: 'on',
            scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row-reverse',
            padding: 10,
          }}>
          <DefaultButton primary={true}>Update One</DefaultButton>
        </div>
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
          onItemInvoked={onItemInvoked}
        />
      </ScrollablePane>
    </div>
  )
}
