import { EJSON } from 'bson'

export async function runCommand<T>(
  connection: string | undefined,
  database: string,
  command: object,
  opts: { canonical?: boolean } = {},
): Promise<T> {
  const response = await fetch(
    `/api/runCommand?d=${database}&c=${Object.keys(command)[0]}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connection,
        database,
        command: JSON.stringify(command),
      }),
    },
  )
  if (response.ok) {
    return opts.canonical
      ? response.json()
      : (EJSON.parse(await response.text()) as T)
  }
  throw new Error(await response.text())
}

export async function listConnections(): Promise<string[]> {
  const response = await fetch('/api/listConnections', {
    method: 'POST',
  })
  if (response.ok) {
    return response.json()
  }
  throw new Error(await response.text())
}
