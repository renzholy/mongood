import React from 'react'
import prettyMilliseconds from 'pretty-ms'
import { sortBy } from 'lodash'
import bytes from 'bytes'

import { useCommandServerStatus } from '@/hooks/use-command'
import { formatNumber } from '@/utils/formatter'
import { StatsArea } from './StatsArea'
import { LargeMessage } from './LargeMessage'

export function ServerStatus() {
  const { data: serverStatus, error } = useCommandServerStatus()

  if (error) {
    return (
      <LargeMessage iconName="Error" title="Error" content={error.message} />
    )
  }
  if (!serverStatus) {
    return <LargeMessage iconName="HourGlass" title="Loading" />
  }
  return (
    <div
      style={{
        overflowY: 'scroll',
      }}>
      <div style={{ padding: 10, margin: '0 auto', width: 'fit-content' }}>
        <StatsArea title="Host: " subtitle={serverStatus.host} />
        <StatsArea title="Version: " subtitle={serverStatus.version} />
        <StatsArea
          title="Uptime: "
          subtitle={prettyMilliseconds(serverStatus.uptimeMillis, {
            secondsDecimalDigits: 0,
          })}
        />
        {serverStatus.repl ? (
          <StatsArea
            title="Replica: "
            subtitle={serverStatus.repl.setName}
            data={sortBy(serverStatus.repl.hosts, (host) =>
              host === serverStatus.repl!.primary ? 0 : 1,
            ).reduce((prev, curr, index) => {
              // eslint-disable-next-line no-param-reassign
              prev[
                `${Array.from({ length: index })
                  .map(() => ' ')
                  .join('')}${
                  curr === serverStatus.repl!.primary ? 'Primary' : 'Secondary'
                }`
              ] = curr
              return prev
            }, {} as { [key: string]: string })}
          />
        ) : null}
        <StatsArea
          title="Connections"
          data={{
            Available: formatNumber(serverStatus.connections.available),
            Current: formatNumber(serverStatus.connections.current),
            'Total Created': formatNumber(
              serverStatus.connections.totalCreated,
            ),
          }}
        />
        <StatsArea
          title="Network"
          data={{
            In: bytes(serverStatus.network.bytesIn, {
              unitSeparator: ' ',
            }),
            Out: bytes(serverStatus.network.bytesOut, {
              unitSeparator: ' ',
            }),
            Requests: formatNumber(serverStatus.network.numRequests),
          }}
        />
        <StatsArea
          title="Operation Counters"
          data={{
            Insert: formatNumber(serverStatus.opcounters.insert),
            Query: formatNumber(serverStatus.opcounters.query),
            Update: formatNumber(serverStatus.opcounters.update),
            Delete: formatNumber(serverStatus.opcounters.delete),
            'Get More': formatNumber(serverStatus.opcounters.getmore),
            Command: formatNumber(serverStatus.opcounters.command),
          }}
        />
        {serverStatus.opcountersRepl && serverStatus.repl ? (
          <StatsArea
            title="Replica Operation Counters"
            data={{
              Insert: formatNumber(serverStatus.opcountersRepl.insert),
              Query: formatNumber(serverStatus.opcountersRepl.query),
              Update: formatNumber(serverStatus.opcountersRepl.update),
              Delete: formatNumber(serverStatus.opcountersRepl.delete),
              'Get More': formatNumber(serverStatus.opcountersRepl.getmore),
              Command: formatNumber(serverStatus.opcountersRepl.command),
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
