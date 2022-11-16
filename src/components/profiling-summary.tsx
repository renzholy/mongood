import useSWRInfinite from 'swr/infinite'
import { useCallback, useMemo } from 'react'
import { IColumn, getTheme, Stack } from '@fluentui/react'
import { useAppDispatch } from 'hooks/use-app'
import { runCommand } from 'utils/fetcher'
import { useCommandDatabases, useCommandIsMaster } from 'hooks/use-command'
import { mapToColumn } from 'utils/table'
import { generateConnectionWithDirectHost, getHostsOfMongoURI } from 'utils'
import { formatNumber } from 'utils/formatter'
import { actions } from 'stores'
import useRouterQuery from 'hooks/use-router-query'
import { useConnection } from 'hooks/use-connections'
import Table from './pure/table'
import LargeMessage from './pure/large-message'
import TableCell from './pure/table-cell'
import ProfilingSummaryBottomStack from './profiling-summary-bottom-stack'
import Divider from './pure/divider'
import RefreshButton from './pure/refresh-button'

type Data = { database: string } & { [host: string]: number }

const KEY_NAME = 'database'

export default function ProfilingSummary() {
  const [{ conn }, setRoute] = useRouterQuery()
  const connection = useConnection(conn)
  const { data: databases } = useCommandDatabases()
  const { data: hosts } = useCommandIsMaster()
  const handleGetKey = useCallback(
    (index: number): string[] | null => {
      const database = databases?.databases[index]?.name
      return connection && database && hosts
        ? [
            connection,
            database,
            ...(hosts.hosts || getHostsOfMongoURI(connection)),
          ]
        : null
    },
    [connection, databases, hosts],
  )
  const profileCountFetcher = useCallback(
    async (_connection: string, _database: string, ..._hosts: string[]) => {
      const obj = { [KEY_NAME]: _database } as Data
      for (const h of _hosts) {
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
  const { data, isValidating, mutate } = useSWRInfinite<Data>(
    handleGetKey,
    profileCountFetcher,
    {
      initialSize: databases?.databases.length,
      revalidateAll: true,
    },
  )
  const columns = useMemo<IColumn[]>(() => {
    const cs = (hosts?.hosts || getHostsOfMongoURI(connection)).map((h) => [
      h,
      160,
    ]) as [string, number][]
    return mapToColumn([[KEY_NAME, 0], ...cs])
  }, [hosts, connection])
  const dispatch = useAppDispatch()
  const theme = getTheme()
  const handleViewProfiling = useCallback(
    (item: Data, host?: string) => {
      dispatch(
        actions.root.setExpandedDatabases(
          item[KEY_NAME] ? [item[KEY_NAME]] : [],
        ),
      )
      setRoute({ conn, database: item[KEY_NAME], collection: 'system.profile' })
      if (host) {
        dispatch(actions.profiling.setHost(host))
      }
    },
    [conn, dispatch, setRoute],
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
          }}
        >
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
        }}
      >
        <Stack.Item grow={true}>
          <div />
        </Stack.Item>
        <RefreshButton isRefreshing={isValidating} onRefresh={mutate} />
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
