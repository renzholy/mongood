import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Selection, IColumn, ColumnActionsMode } from '@fluentui/react'
import { get } from 'lodash'
import { runCommand } from 'utils/fetcher'
import { stringify } from 'utils/ejson'
import { MongoData, DisplayMode } from 'types'
import { useCommandFind, useCommandFindById } from 'hooks/use-command'
import usePromise from 'hooks/use-promise'
import { calcHeaders, mapToColumn } from 'utils/table'
import useRouterQuery from 'hooks/use-router-query'
import { useConnection } from 'hooks/use-connections'
import Table from './pure/table'
import EditorModal from './pure/editor-modal'
import DocumentRowContextualMenu from './document-row-contextual-menu'
import DocumentColumnContextualMenu from './document-column-contextual-menu'
import PromiseButton from './pure/promise-button'
import LargeMessage from './pure/large-message'
import MongoDataColorized from './pure/mongo-data-colorized'
import DocumentCell from './pure/document-cell'

type Document = { [key: string]: MongoData }

export default function DocumentsList() {
  const displayMode = useSelector((state) => state.docs.displayMode)
  const [{ conn, database, collection }] = useRouterQuery()
  const connection = useConnection(conn)
  const index = useSelector((state) => state.docs.index)
  const { data, error, revalidate } = useCommandFind()
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isRowMenuHidden, setIsRowMenuHidden] = useState(true)
  const [isColumnMenuHidden, setIsColumnMenuHidden] = useState(true)
  const [invokedItem, setInvokedItem] = useState<Document>()
  const [editedItem, setEditedItem] = useState<Document>()
  const [column, setColumn] = useState<IColumn>()
  const handleUpdate = useCallback(
    async () =>
      database && collection
        ? runCommand(connection, database, {
            findAndModify: collection,
            query: { _id: (invokedItem as { _id: unknown })._id },
            update: editedItem,
          })
        : undefined,
    [connection, database, collection, invokedItem, editedItem],
  )
  const promiseUpdate = usePromise(handleUpdate)
  useEffect(() => {
    if (promiseUpdate.resolved) {
      revalidate()
      setIsUpdateOpen(false)
    }
  }, [promiseUpdate.resolved, revalidate])
  const rowTarget = useRef<MouseEvent>()
  const columnTarget = useRef<MouseEvent>()
  const selection = useMemo(() => new Selection<Document>(), [])
  const title = useMemo(() => stringify(invokedItem?._id), [invokedItem])
  const onItemInvoked = useCallback((item: Document) => {
    setInvokedItem(item)
    setIsUpdateOpen(true)
  }, [])
  const { data: invoked } = useCommandFindById(invokedItem?._id)
  useEffect(() => {
    setEditedItem(invoked?.cursor.firstBatch[0])
  }, [invoked?.cursor.firstBatch])
  const onItemContextMenu = useCallback(
    (ev: MouseEvent) => {
      if (selection.getSelectedCount() === 1) {
        const [item] = selection.getSelection()
        setInvokedItem(item)
      } else {
        setInvokedItem(undefined)
      }
      rowTarget.current = ev
      setIsRowMenuHidden(false)
    },
    [selection],
  )
  const order = useMemo(
    () => [
      '_id',
      ...Object.keys(index?.key || {}).map((key) => key.split('.')[0]),
      ...Object.keys(index?.weights || {}).map((key) => key.split('.')[0]),
    ],
    [index],
  )
  const index2dsphere = useMemo(
    () =>
      index?.['2dsphereIndexVersion']
        ? Object.entries(index.key).find(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_key, value]) => value === '2dsphere',
          )?.[0]
        : undefined,
    [index],
  )
  const handleRenderItemColumn = useCallback(
    (item?: Document, _index?: number, _column?: IColumn) =>
      displayMode === DisplayMode.DOCUMENT ? (
        <MongoDataColorized value={item} />
      ) : (
        <DocumentCell
          value={item?.[_column?.key as keyof typeof item]}
          subStringLength={
            // eslint-disable-next-line no-bitwise
            _column?.currentWidth ? undefined : _column?.minWidth! >> 2
          }
          index2dsphere={
            index2dsphere &&
            _column?.key &&
            index2dsphere.startsWith(_column?.key)
              ? get(item, index2dsphere)
              : undefined
          }
        />
      ),
    [index2dsphere, displayMode],
  )
  useEffect(() => {
    selection.setAllSelected(false)
  }, [selection, data])
  const columns = useMemo<IColumn[]>(() => {
    if (!data || data.cursor.firstBatch.length === 0) {
      return []
    }
    return displayMode === DisplayMode.TABLE
      ? mapToColumn(calcHeaders(data.cursor.firstBatch, order)).map((c) => ({
          ...c,
          columnActionsMode:
            c.key === '_id'
              ? ColumnActionsMode.disabled
              : ColumnActionsMode.clickable,
          onColumnContextMenu(_column, ev) {
            if (_column?.key === '_id') {
              return
            }
            columnTarget.current = ev?.nativeEvent
            setColumn(_column)
            setIsColumnMenuHidden(false)
          },
          onColumnClick(ev, _column) {
            columnTarget.current = ev.nativeEvent
            setColumn(_column)
            setIsColumnMenuHidden(false)
          },
        }))
      : [
          {
            key: '',
            name: 'Documents',
            minWidth: 0,
            isMultiline: true,
            columnActionsMode: ColumnActionsMode.disabled,
          },
        ]
  }, [displayMode, data, order])
  const handleGetKey = useCallback(
    (item: Document, i?: number) =>
      item._id ? JSON.stringify(item._id) : JSON.stringify(item) + i,
    [],
  )

  if (error) {
    return (
      <LargeMessage iconName="Error" title="Error" content={error.message} />
    )
  }
  if (!data) {
    return <LargeMessage iconName="HourGlass" title="Loading" />
  }
  return (
    <>
      <EditorModal<Document>
        title={title ? `View Document: ${title}` : 'View Document'}
        value={editedItem}
        onChange={setEditedItem}
        isOpen={isUpdateOpen}
        onDismiss={() => {
          setIsUpdateOpen(false)
        }}
        onDismissed={() => {
          setEditedItem(invokedItem)
        }}
        footer={(disabled) => (
          <PromiseButton
            text="Update"
            primary={true}
            disabled={disabled}
            promise={promiseUpdate}
            style={{ flexShrink: 0 }}
          />
        )}
      />
      <DocumentRowContextualMenu
        hidden={isRowMenuHidden}
        onDismiss={() => {
          setIsRowMenuHidden(true)
        }}
        target={rowTarget.current}
        selectedItems={selection.getSelection()}
        onEdit={
          invokedItem
            ? () => {
                setIsRowMenuHidden(true)
                setIsUpdateOpen(true)
              }
            : undefined
        }
      />
      <DocumentColumnContextualMenu
        value={column}
        hidden={isColumnMenuHidden}
        onDismiss={() => {
          setIsColumnMenuHidden(true)
        }}
        target={columnTarget.current}
      />
      <Table
        items={data.cursor.firstBatch}
        columns={columns}
        getKey={handleGetKey}
        onItemInvoked={onItemInvoked}
        onItemContextMenu={onItemContextMenu}
        selection={selection}
        onRenderItemColumn={handleRenderItemColumn}
      />
    </>
  )
}
