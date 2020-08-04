import React, { useCallback, useState, useEffect } from 'react'
import {
  ContextualMenu,
  DialogType,
  getTheme,
  Dialog,
  DialogFooter,
  DefaultButton,
} from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'

export function DatabaseContextualMenu(props: {
  hidden: boolean
  onDismiss(): void
  target?: MouseEvent
  database: string
  collection?: string
  onDrop(database?: string): void
}) {
  const connection = useSelector((state) => state.root.connection)
  const [isSucceed, setIsSucceed] = useState<boolean>()
  const [isDeleting, setIsDeleting] = useState(false)
  const [hidden, setHidden] = useState(true)
  const dispatch = useDispatch()
  const handleDrop = useCallback(async () => {
    try {
      setIsDeleting(true)
      await runCommand(
        connection,
        props.database,
        props.collection ? { drop: props.collection } : { dropDatabase: 1 },
      )
      setIsSucceed(true)
      setHidden(true)
      dispatch(actions.root.setTrigger())
      props.onDrop(props.collection ? props.database : undefined)
    } catch {
      setIsSucceed(false)
    } finally {
      setIsDeleting(false)
    }
  }, [connection, props, dispatch])
  const theme = getTheme()
  useEffect(() => {
    setIsSucceed(undefined)
  }, [props.target])

  return (
    <>
      <Dialog
        hidden={hidden}
        dialogContentProps={{
          type: DialogType.normal,
          title: props.collection ? 'Drop Collection' : 'Drop Database',
          subText: props.collection
            ? `${props.database}.${props.collection}`
            : props.database,
          showCloseButton: true,
          isMultiline: true,
          styles: {
            innerContent: {
              maxHeight: 410,
              overflow: 'scroll',
            },
          },
          onDismiss() {
            setHidden(true)
          },
        }}
        modalProps={{
          styles: {
            main: {
              minHeight: 0,
              borderTop: `4px solid ${theme.palette.red}`,
              backgroundColor: theme.palette.neutralLighterAlt,
            },
          },
          onDismiss() {
            setHidden(true)
          },
        }}>
        <DialogFooter>
          <DefaultButton
            disabled={isDeleting}
            iconProps={
              {
                true: { iconName: 'CheckMark' },
                false: { iconName: 'Error' },
              }[String(isSucceed) as 'true' | 'false']
            }
            onClick={() => {
              handleDrop()
            }}
            text="Drop"
          />
        </DialogFooter>
      </Dialog>
      <ContextualMenu
        target={props.target}
        hidden={props.hidden}
        onDismiss={props.onDismiss}
        items={[
          {
            key: '0',
            text: props.collection ? 'Drop Collection' : 'Drop Database',
            iconProps: {
              iconName: 'Delete',
              styles: { root: { color: theme.palette.red } },
            },
            onClick() {
              setHidden(false)
            },
          },
        ]}
      />
    </>
  )
}
