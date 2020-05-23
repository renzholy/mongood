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
