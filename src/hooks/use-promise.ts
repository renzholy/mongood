import { useState, useCallback, useEffect } from 'react'

export function usePromise<T extends unknown[], O>(
  handler: (...input: T) => Promise<O | undefined>,
) {
  const [resolved, setResolved] = useState<O>()
  const [rejected, setRejected] = useState<Error>()
  const [pending, setPending] = useState(false)
  const call = useCallback(
    async (...input: T) => {
      try {
        setPending(true)
        setResolved(await handler(...input))
        setRejected(undefined)
      } catch (err) {
        setRejected(err)
        setResolved(undefined)
      } finally {
        setPending(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handler],
  )
  const reset = useCallback(() => {
    setResolved(undefined)
    setRejected(undefined)
    setPending(false)
  }, [])
  useEffect(() => {
    setResolved(undefined)
    setRejected(undefined)
  }, [handler])

  return {
    resolved,
    rejected,
    pending,
    call,
    reset,
  }
}
