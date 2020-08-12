import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { actions } from '@/stores'
import { useCommandSystemProfileCount } from '@/hooks/use-command'
import { Pagination } from './Pagination'

export function ProfilingPagination() {
  const skip = useSelector((state) => state.profiling.skip)
  const limit = useSelector((state) => state.profiling.limit)
  const { data } = useCommandSystemProfileCount()
  const dispatch = useDispatch()
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

  return (
    <Pagination
      skip={skip}
      limit={limit}
      count={count}
      onLimit={handleLimit}
      onPrev={handlePrev}
      onNext={handleNext}
    />
  )
}
