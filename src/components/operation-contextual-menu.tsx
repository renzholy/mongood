import { ContextualMenu, DirectionalHint, getTheme } from '@fluentui/react'
import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from 'hooks/use-app'
import { actions } from 'stores'

export default function OperationContextualMenu(props: {
  target: MouseEvent | undefined
}) {
  const dispatch = useAppDispatch()
  const theme = getTheme()
  const isMenuHidden = useAppSelector((state) => state.operations.isMenuHidden)
  useEffect(() => {
    dispatch(actions.operations.setIsMenuHidden(!props.target))
  }, [dispatch, props.target])

  return (
    <ContextualMenu
      target={props.target}
      directionalHint={DirectionalHint.rightTopEdge}
      hidden={isMenuHidden}
      onDismiss={() => {
        dispatch(actions.operations.setIsMenuHidden(true))
      }}
      items={[
        {
          key: '0',
          text: 'View',
          iconProps: { iconName: 'View' },
          onClick() {
            dispatch(actions.operations.setIsMenuHidden(true))
            dispatch(actions.operations.setIsEditorOpen(true))
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
            dispatch(actions.operations.setIsDialogHidden(false))
          },
        },
      ]}
    />
  )
}
