import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { changeLib } from '@/utils/editor'
import { LargeMessage } from '@/components/LargeMessage'
import { NotebookItem } from '@/components/NotebookItem'

export default () => {
  const { database, collectionsMap } = useSelector((state) => state.root)
  useEffect(() => {
    if (!database) {
      return
    }
    changeLib(collectionsMap[database])
  }, [database, collectionsMap])

  if (!database) {
    return <LargeMessage iconName="Back" title="Select Database" />
  }
  return <NotebookItem />
}
