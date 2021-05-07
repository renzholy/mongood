import { Modal, IconButton, getTheme, Text } from '@fluentui/react'

export function DefaultModal(props: {
  title: string
  isOpen: boolean
  onDismiss(): void
  onDismissed?(): void
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const theme = getTheme()

  return (
    <Modal
      styles={{
        scrollableContent: {
          minWidth: 800,
          minHeight: 600,
          width: '80vw',
          height: '80vh',
          borderTop: `4px solid ${theme.palette.themePrimary}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.neutralLighterAlt,
        },
      }}
      layerProps={{ eventBubblingEnabled: true }}
      isOpen={props.isOpen}
      onDismiss={props.onDismiss}
      onDismissed={props.onDismissed}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 10,
          paddingLeft: 20,
        }}>
        <Text
          variant="xLarge"
          block={true}
          styles={{
            root: {
              alignItems: 'center',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            },
          }}>
          {props.title}
        </Text>
        <IconButton
          styles={{ root: { marginLeft: 10 } }}
          iconProps={{ iconName: 'Cancel' }}
          onClick={props.onDismiss}
        />
      </div>
      {props.children}
      {props.footer ? (
        <div
          style={{
            height: 32,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row-reverse',
            padding: 10,
          }}>
          {props.footer}
        </div>
      ) : null}
    </Modal>
  )
}
