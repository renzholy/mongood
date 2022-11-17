import { mongodbUri } from './mongo-uri'

export function generateConnectionWithDirectHost(
  host: string,
  connection?: string,
): string | undefined {
  if (!connection) {
    return undefined
  }
  try {
    const parsed = mongodbUri.parse(connection)
    const [_host, _port] = host.split(':')
    return mongodbUri.format({
      ...parsed,
      scheme: 'mongodb',
      hosts: [{ host: _host, port: parseInt(_port, 10) }],
      options: {
        ...parsed?.options,
        connect: 'direct',
      },
    })
  } catch {
    return undefined
  }
}

export function getHostsOfMongoURI(uri?: string): string[] {
  if (!uri) {
    return []
  }
  const parsed = mongodbUri.parse(uri)
  return parsed.hosts.map((h) => (h.port ? `${h.host}:${h.port}` : h.host))
}
