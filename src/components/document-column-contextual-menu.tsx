import { ContextualMenu, IColumn } from '@fluentui/react'
import { useAppSelector, useAppDispatch } from 'hooks/use-app'
import { actions } from 'stores'

export default function DocumentColumnContextualMenu(props: {
  value?: IColumn
  hidden: boolean
  onDismiss(): void
  target?: MouseEvent
}) {
  const dispatch = useAppDispatch()
  const projection = useAppSelector((state) => state.docs.projection)

  return (
    <ContextualMenu
      target={props.target}
      hidden={props.hidden}
      onDismiss={props.onDismiss}
      items={[
        {
          key: '0',
          text: `Omit column: ${props.value?.name}`,
          iconProps: { iconName: 'Hide3' },
          onClick() {
            if (props.value) {
              dispatch(
                actions.docs.setProjection({
                  ...projection,
                  [props.value.key]: 0,
                }),
              )
            }
          },
        },
      ]}
    />
  )
}
