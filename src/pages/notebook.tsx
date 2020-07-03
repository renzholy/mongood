import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { DetailsList, SelectionMode, ScrollablePane } from '@fluentui/react'

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
  return (
    <div style={{ position: 'relative', height: 0, flex: 1 }}>
      <ScrollablePane
        styles={{
          root: { maxWidth: '100%' },
          stickyBelow: { display: 'none' },
        }}>
        <DetailsList
          items={[{ in: '' }]}
          selectionMode={SelectionMode.none}
          compact={true}
          isHeaderVisible={false}
          cellStyleProps={{
            cellLeftPadding: 0,
            cellRightPadding: 0,
            cellExtraRightPadding: 0,
          }}
          onRenderItemColumn={(item: {
            in: string
            out?: object
            error?: Error
          }) => <NotebookItem in={item.in} out={item.out} error={item.error} />}
        />
      </ScrollablePane>
    </div>
  )
}
