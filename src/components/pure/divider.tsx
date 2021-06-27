import { getTheme } from '@fluentui/react'

export default function Divider() {
  const theme = getTheme()

  return (
    <div
      style={{
        width: '100%',
        height: 0,
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: theme.palette.neutralLight,
      }}
    />
  )
}
