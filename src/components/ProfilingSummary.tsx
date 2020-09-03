/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import { useSWRInfinite } from 'swr'
import React, { useCallback, useMemo } from 'react'
import { IColumn, getTheme } from '@fluentui/react'
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
import { ProfilingSummaryControlStack } from './ProfilingSummaryControlStack'

type Data = { database: string } & { [host: string]: number }

const KEY_NAME = 'database'

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
      { [KEY_NAME]: _database } as Data,
    )
  }, [])
  const { data, isValidating, revalidate } = useSWRInfinite<Data>(
    handleGetKey,
    fetcher,
    {
      initialSize: databases?.databases.length,
    },
  )
  const columns = useMemo<IColumn[]>(() => {
    const cs = (hosts?.hosts.map((h) => [h, 160]) || []) as [string, number][]
    return mapToColumn([[KEY_NAME, 0], ...cs])
  }, [hosts])
  const dispatch = useDispatch()
  const theme = getTheme()
  const handleViewProfiling = useCallback(
    (item: Data, host?: string) => {
      dispatch(
        actions.root.setExpandedDatabases(
          item[KEY_NAME] ? [item[KEY_NAME]] : [],
        ),
      )
      dispatch(actions.root.setDatabase(item[KEY_NAME]))
      dispatch(actions.root.setCollection('system.profile'))
      if (host) {
        dispatch(actions.profiling.setHost(host))
      }
    },
    [dispatch],
  )
  const handleRenderItemColumn = useCallback(
    (item?: Data, _index?: number, column?: IColumn) => {
      if (!item || !column?.key) {
        return null
      }
      if (column.key === KEY_NAME) {
        return <TableCell value={item[column.key]} />
      }
      return (
        <span
          style={{ cursor: 'pointer', color: theme.palette.themePrimary }}
          onClick={() => {
            handleViewProfiling(item, column.key)
          }}>
          {formatNumber(item[column.key])}
        </span>
      )
    },
    [handleViewProfiling, theme.palette.themePrimary],
  )

  if (!data) {
    return <LargeMessage iconName="HourGlass" title="Loading" />
  }
  return (
    <>
      <ProfilingSummaryControlStack
        isValidating={isValidating}
        revalidate={revalidate}
      />
      <Table
        items={data}
        columns={columns}
        onRenderItemColumn={handleRenderItemColumn}
        onItemInvoked={handleViewProfiling}
      />
    </>
  )
}
