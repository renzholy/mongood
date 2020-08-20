/* eslint-disable react/no-danger */

import React from 'react'
import type { IndexSpecification } from 'mongodb'
import { IColumn } from '@fluentui/react'
import bytes from 'bytes'

import { stringify } from '@/utils/ejson'
import { useColorize } from '@/hooks/use-colorize'
import { formatNumber, formatDate } from '@/utils/formatter'
import { IndexFeatures } from './IndexFeatures'
import { IndexInfo } from './IndexInfo'

export function IndexCell(props: {
  item: IndexSpecification
  column: IColumn
  size?: number
  accesses?: { ops: number; since: Date }
}) {
  const name = useColorize(stringify(props.item.name))

  switch (props.column.key) {
    case 'name': {
      return <span dangerouslySetInnerHTML={{ __html: name }} />
    }
    case 'size': {
      return props.size !== undefined ? <>{bytes(props.size)}</> : null
    }
    case 'ops': {
      return props.accesses ? <>{formatNumber(props.accesses.ops)}/s</> : null
    }
    case 'since': {
      return props.accesses ? (
        <time>{formatDate(props.accesses.since)}</time>
      ) : null
    }
    case 'keys': {
      return <IndexInfo value={props.item} />
    }
    case 'features': {
      return <IndexFeatures value={props.item} />
    }
    default: {
      return null
    }
  }
}
