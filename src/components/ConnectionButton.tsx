import React, { useEffect, useCallback, useState, useMemo } from 'react'
import {
  CommandButton,
  ContextualMenuItemType,
  IContextualMenuItem,
  IStyle,
} from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'
import { compact } from 'lodash'

import { actions } from '@/stores'
import { useConnections } from '@/hooks/use-connections'
import { ConnectionEditModal } from './ConnectionEditModal'

export function ConnectionButton(props: { style?: IStyle }) {
  const connection = useSelector((state) => state.root.connection)
  const dispatch = useDispatch()
  const { selfAdded, builtIn } = useConnections()
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    if ((builtIn?.length || selfAdded.length) && !connection) {
      dispatch(
        actions.root.setConnection([...selfAdded, ...(builtIn || [])][0]?.uri),
      )
    }
  }, [connection, selfAdded, builtIn, dispatch])
  useEffect(() => {
    if (selfAdded.length === 0 && builtIn?.length === 0) {
      setIsOpen(true)
    }
  }, [connection, selfAdded, builtIn])
  const connectionToItem = useCallback(
    ({ uri, text, secondaryText }) => ({
      key: uri,
      text,
      secondaryText,
      canCheck: true,
      checked: connection === uri,
      onClick() {
        dispatch(actions.root.setConnection(uri))
      },
    }),
    [connection, dispatch],
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
        ...selfAdded.map(connectionToItem),
        selfAdded.length
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
          [...(builtIn || []), ...selfAdded].find(
            ({ uri }) => uri === connection,
          )?.text || 'Connection'
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
