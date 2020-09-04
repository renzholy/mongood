import { useSWRInfinite } from 'swr'
import React, { useCallback, useMemo } from 'react'
import { IColumn, getTheme, IconButton, Stack } from '@fluentui/react'
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
import { ProfilingSummaryBottomStack } from './ProfilingSummaryBottomStack'
import { Divider } from './Divider'

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
        ? [connection, database, ...(hosts.hosts || [])]
        : null
    },
    [connection, databases, hosts],
  )
  const profileCountFetcher = useCallback(
    async (_connection: string, _database: string, ..._hosts: string[]) => {
      const obj = { [KEY_NAME]: _database } as Data
      // eslint-disable-next-line no-restricted-syntax
      for (const h of _hosts) {
        // eslint-disable-next-line no-await-in-loop
        const { n } = await runCommand<{ n: number }>(
          generateConnectionWithDirectHost(h, _connection),
          _database,
          {
            count: 'system.profile',
            query: {},
          },
        )
        obj[h] = n
      }
      return obj
    },
    [],
  )
  const { data, isValidating, revalidate } = useSWRInfinite<Data>(
    handleGetKey,
    profileCountFetcher,
    {
      initialSize: databases?.databases.length,
      revalidateAll: true,
    },
  )
  const columns = useMemo<IColumn[]>(() => {
    const cs = (hosts?.hosts?.map((h) => [h, 160]) || []) as [string, number][]
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
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
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

  return (
    <>
      <Stack
        horizontal={true}
        tokens={{ padding: 10 }}
        styles={{
          root: { height: 52, alignItems: 'center' },
        }}>
        <Stack.Item grow={true}>
          <div />
        </Stack.Item>
        <IconButton
          iconProps={{ iconName: 'Refresh' }}
          disabled={isValidating}
          onClick={revalidate}
        />
      </Stack>
      <Divider />
      {data ? (
        <Table
          items={data}
          columns={columns}
          onRenderItemColumn={handleRenderItemColumn}
          onItemInvoked={handleViewProfiling}
        />
      ) : (
        <LargeMessage iconName="HourGlass" title="Loading" />
      )}
      <Divider />
      <ProfilingSummaryBottomStack />
    </>
  )
}
