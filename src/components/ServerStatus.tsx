import React from 'react'
import prettyMilliseconds from 'pretty-ms'
import { sortBy } from 'lodash'
import bytes from 'bytes'

import { useCommandServerStatus } from '@/hooks/use-command'
import { Number } from '@/utils/formatter'
import { StatsArea } from './StatsArea'

export function ServerStatus() {
  const { data } = useCommandServerStatus(true)
  const serverStatus = data!

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
            Available: Number.format(serverStatus.connections.available),
            Current: Number.format(serverStatus.connections.current),
            'Total Created': Number.format(
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
            Requests: Number.format(serverStatus.network.numRequests),
          }}
        />
        <StatsArea
          title="Operation Counters"
          data={{
            Insert: Number.format(serverStatus.opcounters.insert),
            Query: Number.format(serverStatus.opcounters.query),
            Update: Number.format(serverStatus.opcounters.update),
            Delete: Number.format(serverStatus.opcounters.delete),
            'Get More': Number.format(serverStatus.opcounters.getmore),
            Command: Number.format(serverStatus.opcounters.command),
          }}
        />
        {serverStatus.opcountersRepl && serverStatus.repl ? (
          <StatsArea
            title="Replica Operation Counters"
            data={{
              Insert: Number.format(serverStatus.opcountersRepl.insert),
              Query: Number.format(serverStatus.opcountersRepl.query),
              Update: Number.format(serverStatus.opcountersRepl.update),
              Delete: Number.format(serverStatus.opcountersRepl.delete),
              'Get More': Number.format(serverStatus.opcountersRepl.getmore),
              Command: Number.format(serverStatus.opcountersRepl.command),
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
