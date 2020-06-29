import React, { useCallback, useState, useEffect } from 'react'
import {
  ContextualMenu,
  DialogType,
  getTheme,
  Dialog,
  DialogFooter,
  DefaultButton,
} from '@fluentui/react'
import { useSelector } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { IndexSpecification } from 'mongodb'

export function IndexContextualMenu(props: {
  hidden: boolean
  onDismiss(): void
  target?: MouseEvent
  value: IndexSpecification
  onView: () => void
  onDrop: () => void
}) {
  const { connection, database, collection } = useSelector(
    (state) => state.root,
  )
  const [isSucceed, setIsSucceed] = useState<boolean>()
  const [isDroping, setIsDroping] = useState(false)
  const [hidden, setHidden] = useState(true)
  const theme = getTheme()
  useEffect(() => {
    setIsSucceed(undefined)
  }, [props.target])
  const handleDrop = useCallback(async () => {
    if (!database || !collection) {
      return
    }
    try {
      setIsDroping(true)
      await runCommand(connection, database, {
        dropIndexes: collection,
        index: props.value.name,
      })
      setIsSucceed(true)
      setHidden(true)
      props.onDrop()
    } catch {
      setIsSucceed(false)
    } finally {
      setIsDroping(false)
    }
  }, [database, collection, props.value])

  return (
    <>
      <Dialog
        hidden={hidden}
        dialogContentProps={{
          type: DialogType.normal,
          title: `Drop Index ${props.value.name}`,
          showCloseButton: true,
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
            disabled={isDroping}
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
            text: 'View',
            iconProps: { iconName: 'View' },
            onClick: props.onView,
          },
          {
            key: '1',
            text: 'Drop',
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
