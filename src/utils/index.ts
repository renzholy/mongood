import mongodbUri from 'mongodb-uri'

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
