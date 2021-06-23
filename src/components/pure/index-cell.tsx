/* eslint-disable react/no-danger */

import React from 'react'
import type { IndexSpecification } from 'mongodb'
import { IColumn, getTheme } from '@fluentui/react'
import bytes from 'bytes'
import { formatNumber, formatDate } from 'utils/formatter'
import { IndexFeatures } from './index-features'
import { IndexInfo } from './index-info'

export function IndexCell(props: {
  item: IndexSpecification
  column: IColumn
  size?: number
  accesses?: { ops: number; since: Date }
}) {
  const theme = getTheme()

  switch (props.column.key) {
    case 'name': {
      return (
        <span style={{ color: theme.palette.neutralPrimary }}>
          {props.item.name}
        </span>
      )
    }
    case 'size': {
      return props.size !== undefined ? <>{bytes(props.size)}</> : null
    }
    case 'ops': {
      return props.accesses ? <>{formatNumber(props.accesses.ops)}</> : null
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
