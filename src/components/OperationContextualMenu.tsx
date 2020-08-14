import { ContextualMenu, DirectionalHint, getTheme } from '@fluentui/react'
import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { actions } from '@/stores'

export function OperationContextualMenu(props: {
  target: MouseEvent | undefined
}) {
  const dispatch = useDispatch()
  const theme = getTheme()
  const [isMenuHidden, setIsMenuHidden] = useState(true)
  useEffect(() => {
    setIsMenuHidden(!props.target)
  }, [props.target])

  return (
    <ContextualMenu
      target={props.target}
      directionalHint={DirectionalHint.rightTopEdge}
      hidden={isMenuHidden}
      onDismiss={() => {
        setIsMenuHidden(true)
      }}
      items={[
        {
          key: '0',
          text: 'View',
          iconProps: { iconName: 'View' },
          onClick() {
            setIsMenuHidden(true)
            dispatch(actions.operations.setIsOpen(true))
          },
        },
        {
          key: '1',
          text: 'Kill',
          iconProps: {
            iconName: 'StatusCircleBlock',
            styles: { root: { color: theme.palette.red } },
          },
          onClick() {
            dispatch(actions.operations.setHidden(false))
          },
        },
      ]}
    />
  )
}
