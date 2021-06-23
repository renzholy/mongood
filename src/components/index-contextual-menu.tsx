import { useEffect, useState } from 'react'
import { ContextualMenu, getTheme, DirectionalHint } from '@fluentui/react'
import { useDispatch } from 'react-redux'

import { actions } from '@/stores'

export function IndexContextualMenu(props: { target?: MouseEvent }) {
  const theme = getTheme()
  const dispatch = useDispatch()
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
            dispatch(actions.indexes.setIsViewOpen(true))
          },
        },
        {
          key: '1',
          text: 'View Detail',
          iconProps: { iconName: 'EntryView' },
          onClick() {
            setIsMenuHidden(true)
            dispatch(actions.indexes.setIsDetailOpen(true))
          },
        },
        {
          key: '2',
          text: 'Drop',
          iconProps: {
            iconName: 'Delete',
            styles: { root: { color: theme.palette.red } },
          },
          onClick() {
            setIsMenuHidden(true)
            dispatch(actions.indexes.setIsDialogHidden(false))
          },
        },
      ]}
    />
  )
}
