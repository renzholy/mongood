import { DocumentCard, DocumentCardTitle, getTheme } from '@fluentui/react'

export default function StatsCard(props: { title: string; content: string }) {
  const theme = getTheme()

  return (
    <DocumentCard
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
          minWidth: 210,
          maxWidth: 210,
          paddingTop: 20,
        },
      }}
    >
      <DocumentCardTitle title={props.title} showAsSecondaryTitle={true} />
      <DocumentCardTitle title={props.content} />
    </DocumentCard>
  )
}
