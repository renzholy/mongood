import { getTheme, Stack, Text } from '@fluentui/react'
import { isEmpty, chunk, map } from 'lodash'
import StatsCard from './stats-card'

export default function StatsArea(props: {
  title: string
  subtitle?: string
  data?: { [title: string]: string }
}) {
  const theme = getTheme()

  return (
    <>
      <Text
        variant="xxLarge"
        block={true}
        styles={{
          root: { padding: 10, color: theme.palette.neutralPrimary },
        }}
      >
        {props.title}
        <span style={{ color: theme.palette.neutralSecondary }}>
          {props.subtitle}
        </span>
      </Text>
      {isEmpty(props.data)
        ? null
        : chunk(
            map(props.data, (content, title) => ({ content, title })),
            3,
          ).map((data, index) => (
            <Stack
              key={index.toString()}
              tokens={{ padding: 10, childrenGap: 20 }}
              horizontal={true}
              styles={{ root: { overflowX: 'scroll' } }}
            >
              {data.map(({ content, title }) => (
                <StatsCard key={title} title={`${title}:`} content={content} />
              ))}
            </Stack>
          ))}
    </>
  )
}
