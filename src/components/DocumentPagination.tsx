import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { actions } from '@/stores'
import { useCommandCount } from '@/hooks/use-command'
import { Pagination } from './Pagination'

export function DocumentPagination() {
  const skip = useSelector((state) => state.docs.skip)
  const limit = useSelector((state) => state.docs.limit)
  const { data } = useCommandCount()
  const dispatch = useDispatch()
  const count = data?.n || 0
  const handleLimit = useCallback(
    (l: number) => {
      dispatch(actions.docs.setLimit(l))
    },
    [dispatch],
  )
  const handlePrev = useCallback(() => {
    dispatch(actions.docs.prevPage())
  }, [dispatch])
  const handleNext = useCallback(() => {
    dispatch(actions.docs.nextPage(count))
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
