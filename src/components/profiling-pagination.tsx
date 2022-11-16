import { useCallback } from 'react'
import { useAppSelector, useAppDispatch } from 'hooks/use-app'
import { actions } from 'stores'
import {
  useCommandSystemProfileCount,
  useCommandSystemProfileFind,
} from 'hooks/use-command'
import Pagination from './pure/pagination'

export default function ProfilingPagination() {
  const skip = useAppSelector((state) => state.profiling.skip)
  const limit = useAppSelector((state) => state.profiling.limit)
  const {
    data,
    isValidating: isValidatingCount,
    mutate: mutateCount,
  } = useCommandSystemProfileCount()
  const { isValidating, mutate } = useCommandSystemProfileFind()
  const dispatch = useAppDispatch()
  const count = data?.n || 0
  const handleLimit = useCallback(
    (l: number) => {
      dispatch(actions.profiling.setLimit(l))
    },
    [dispatch],
  )
  const handlePrev = useCallback(() => {
    dispatch(actions.profiling.prevPage())
  }, [dispatch])
  const handleNext = useCallback(() => {
    dispatch(actions.profiling.nextPage(count))
  }, [dispatch, count])
  const handleMutate = useCallback(() => {
    mutateCount()
    mutate()
  }, [mutate, mutateCount])

  return (
    <Pagination
      skip={skip}
      limit={limit}
      count={count}
      onLimit={handleLimit}
      onPrev={handlePrev}
      onNext={handleNext}
      isValidating={isValidating || isValidatingCount}
      mutate={handleMutate}
    />
  )
}
