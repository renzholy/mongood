/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import { useSWRInfinite } from 'swr'
import React, { useCallback, useMemo } from 'react'
import { IColumn } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { useCommandDatabases, useCommandIsMaster } from '@/hooks/use-command'
import { mapToColumn } from '@/utils/table'
import { generateConnectionWithDirectHost } from '@/utils'
import { formatNumber } from '@/utils/formatter'
import { actions } from '@/stores'
import { Table } from './Table'
import { LargeMessage } from './LargeMessage'
import { TableCell } from './TableCell'

export function ProfilingSummary() {
  const connection = useSelector((state) => state.root.connection)
  const { data: databases } = useCommandDatabases()
  const { data: hosts } = useCommandIsMaster()
  const handleGetKey = useCallback(
    (index: number): string[] | null => {
      const database = databases?.databases[index]?.name
      return connection && database && hosts
        ? [connection, database, ...hosts.hosts]
        : null
    },
    [connection, databases, hosts],
  )
  const fetcher = useCallback(async (_connection, _database, ..._hosts) => {
    const d = await Promise.all(
      _hosts.map((h) =>
        runCommand<{ n: number }>(
          generateConnectionWithDirectHost(h, _connection),
          _database,
          {
            count: 'system.profile',
            query: {},
          },
        ),
      ),
    )
    return _hosts.reduce(
      (obj, h, index) => {
        // eslint-disable-next-line no-param-reassign
        obj[h] = d[index]?.n
        return obj
      },
      { database: _database } as {
        [host: string]: string | number | undefined
      },
    )
  }, [])
  const { data } = useSWRInfinite<{ n: number }[]>(handleGetKey, fetcher, {
    initialSize: databases?.databases.length,
  })
  const columns = useMemo<IColumn[]>(() => {
    const cs = (hosts?.hosts.map((h) => [h, 200]) || []) as [string, number][]
    return mapToColumn([['database', 200], ...cs])
  }, [hosts])
  const dispatch = useDispatch()
  const handleRenderItemColumn = useCallback(
    (item?: any, _index?: number, column?: IColumn) => {
      if (column?.key === 'database') {
        return <TableCell value={item?.[column?.key!]} />
      }
      return (
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => {
            dispatch(
              actions.root.setExpandedDatabases(
                item?.database ? [item?.database] : [],
              ),
            )
            dispatch(actions.root.setDatabase(item?.database))
            dispatch(actions.root.setCollection('system.profile'))
            dispatch(actions.profiling.setConnection(column?.key))
          }}>
          {formatNumber(item?.[column?.key!])}
        </span>
      )
    },
    [dispatch],
  )

  if (!data) {
    return <LargeMessage iconName="HourGlass" title="Loading" />
  }
  return (
    <Table
      items={data}
      columns={columns}
      onRenderItemColumn={handleRenderItemColumn}
    />
  )
}
