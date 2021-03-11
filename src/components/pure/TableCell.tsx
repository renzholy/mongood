/* eslint-disable react/no-danger */

import { useMemo, memo } from 'react'

import { stringify } from '@/utils/ejson'
import { useColorize } from '@/hooks/use-colorize'
import { MongoData } from '@/types'
import { MongoDataHoverCard } from './MongoDataHoverCard'

export const TableCell = memo(
  (props: { value: MongoData }) => {
    const str = useMemo(() => stringify(props.value), [props.value])
    const html = useColorize(str)

    return str.length > 36 ? (
      <MongoDataHoverCard value={props.value}>
        <span
          style={{ verticalAlign: 'middle' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </MongoDataHoverCard>
    ) : (
      <span
        style={{ verticalAlign: 'middle' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  },
  (prevProps, nextProps) => prevProps.value === nextProps.value,
)
