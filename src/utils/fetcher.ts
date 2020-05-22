import { EJSON } from 'bson'

export async function runCommand<T>(
  database: string,
  command: object,
  opts: { canonical?: boolean } = {},
): Promise<T> {
  const response = await fetch('/api/runCommand', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ database, command: JSON.stringify(command) }),
  })
  return opts.canonical
    ? response.json()
    : (EJSON.parse(await response.text()) as T)
}

export async function listDatabases(filter: {
  name?: unknown
}): Promise<{
  Databases: {
    Empty: boolean
    Name: string
    SizeOnDisk: number
  }[]
  TotalSize: number
}> {
  const response = await fetch('/api/listDatabases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filter: JSON.stringify(filter) }),
  })
  return EJSON.parse(await response.text()) as {
    Databases: {
      Empty: boolean
      Name: string
      SizeOnDisk: number
    }[]
    TotalSize: number
  }
}
