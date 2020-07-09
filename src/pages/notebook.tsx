import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DetailsList, SelectionMode, ScrollablePane } from '@fluentui/react'

import { changeLib } from '@/utils/editor'
import { LargeMessage } from '@/components/LargeMessage'
import { NotebookItem } from '@/components/NotebookItem'
import { actions } from '@/stores'

export default () => {
  const notebooks = useSelector((state) => state.notebook.notebooks)
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collectionsMap = useSelector((state) => state.root.collectionsMap)
  useEffect(() => {
    if (!database) {
      return
    }
    changeLib(collectionsMap[database])
  }, [database, collectionsMap])
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.notebook.clearNotebooks())
  }, [connection, database])

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
          items={[...notebooks, { index: Infinity, in: '' }]}
          selectionMode={SelectionMode.none}
          compact={true}
          isHeaderVisible={false}
          columns={[
            {
              key: '',
              name: 'Notebooks',
              minWidth: 0,
              isMultiline: true,
            },
          ]}
          cellStyleProps={{
            cellLeftPadding: 0,
            cellRightPadding: 0,
            cellExtraRightPadding: 0,
          }}
          onRenderItemColumn={(item: {
            index: number
            in: string
            out?: object
            error?: string
          }) => (
            <NotebookItem
              in={item.in}
              out={item.out}
              error={item.error}
              onNext={(notebook) => {
                if (notebook.in && (notebook.out || notebook.error)) {
                  if (item.out || item.error) {
                    dispatch(
                      actions.notebook.updateNotebook({
                        ...notebook,
                        index: item.index,
                      }),
                    )
                  } else {
                    dispatch(actions.notebook.appendNotebook(notebook))
                  }
                }
              }}
            />
          )}
        />
      </ScrollablePane>
    </div>
  )
}
