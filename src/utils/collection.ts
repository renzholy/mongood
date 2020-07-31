/* eslint-disable no-param-reassign */

import { IframeRuntime } from './mongosh/iframe-runtime'
import { RunCommandServiceProvider } from './mongosh/service-provider'

export async function toCommand(
  connection: string,
  database: string,
  str: string,
): Promise<object> {
  const serviceProvider = new RunCommandServiceProvider(connection, database)
  const runtime = new IframeRuntime(serviceProvider)
  const result = await runtime.evaluate(str)
  await runtime.destroy()
  return result.value
}
