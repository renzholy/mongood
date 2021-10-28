import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from 'stores'
import { useCommandCount, useCommandFind } from 'hooks/use-command'
import Pagination from './pure/pagination'

export default function DocumentPagination() {
  const skip = useSelector((state) => state.docs.skip)
  const limit = useSelector((state) => state.docs.limit)
  const {
    data,
    isValidating: isValidatingCount,
    mutate: mutateCount,
  } = useCommandCount()
  const { isValidating, mutate } = useCommandFind()
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
