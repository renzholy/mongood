import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { actions } from 'stores'
import ProfilingControlStack from 'components/profiling-control-stack'
import ProfilingList from 'components/profiling-list'
import ProfilingSummary from 'components/profiling-summary'
import ProfilingBottomStack from 'components/profiling-bottom-stack'
import Divider from 'components/pure/divider'
import useRouterQuery from 'hooks/use-router-query'

export default function Profiling() {
  const [{ database, collection }] = useRouterQuery()
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(
      actions.profiling.setFilter(
        collection && collection !== 'system.profile'
          ? {
              ns: `${database}.${collection}`,
            }
          : {},
      ),
    )
  }, [database, collection, dispatch])
  useEffect(() => {
    dispatch(actions.profiling.resetPage())
  }, [database, collection, dispatch])

  if (!database || !collection) {
    return <ProfilingSummary />
  }
  return (
    <>
      <ProfilingControlStack />
      <Divider />
      <ProfilingList />
      <Divider />
      <ProfilingBottomStack />
    </>
  )
}
