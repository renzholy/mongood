import { useEffect, useCallback, useState, useMemo } from 'react'
import {
  CommandButton,
  ContextualMenuItemType,
  IContextualMenuItem,
  IStyle,
} from '@fluentui/react'
import { compact } from 'lodash'

import { useConnection, useConnections } from '@/hooks/use-connections'
import { Connection } from '@/types'
import { useRouterQuery } from '@/hooks/use-router-query'
import { ConnectionEditModal } from './connection-edit-modal'

export function ConnectionButton(props: { style?: IStyle }) {
  const [{ conn }, setRoute] = useRouterQuery()
  const connection = useConnection(conn)
  const { selfAdded, builtIn } = useConnections()
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    if ((builtIn?.length || selfAdded?.length) && conn === undefined) {
      setRoute({
        conn: 0,
      })
    }
  }, [builtIn?.length, conn, selfAdded?.length, setRoute])
  useEffect(() => {
    if (selfAdded?.length === 0 && builtIn?.length === 0) {
      setIsOpen(true)
    }
  }, [connection, selfAdded, builtIn])
  const connectionToItem = useCallback(
    ({ uri, name }: Connection, index: number) => ({
      key: uri,
      name,
      canCheck: true,
      checked: connection === uri,
      onClick() {
        setRoute({ conn: index })
      },
    }),
    [connection, setRoute],
  )
  const items = useMemo<IContextualMenuItem[]>(
    () =>
      compact([
        {
          key: 'create',
          text: 'Edit Connections',
          onClick() {
            setIsOpen(true)
          },
        },
        { key: 'divider1', itemType: ContextualMenuItemType.Divider },
        ...(selfAdded?.map((a, index) =>
          connectionToItem(a, index + (builtIn?.length || 0)),
        ) || []),
        selfAdded?.length
          ? { key: 'divider0', itemType: ContextualMenuItemType.Divider }
          : undefined,
        ...(builtIn?.map(connectionToItem) || []),
      ]),
    [builtIn, connectionToItem, selfAdded],
  )

  return (
    <>
      <ConnectionEditModal
        isOpen={isOpen}
        onDismiss={() => {
          setIsOpen(false)
        }}
      />
      <CommandButton
        text={
          [...(builtIn || []), ...(selfAdded || [])].find(
            ({ uri }) => uri === connection,
          )?.name || 'Connection'
        }
        styles={{
          root: props.style,
          label: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            textAlign: 'start',
            whiteSpace: 'nowrap',
          },
          textContainer: {
            flex: 1,
            width: 0,
          },
        }}
        iconProps={{ iconName: 'Database' }}
        menuIconProps={{ hidden: true }}
        menuProps={{
          items,
        }}
      />
    </>
  )
}
