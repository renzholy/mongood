import React, { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  DetailsList,
  SelectionMode,
  IRenderFunction,
  IDetailsRowProps,
  getTheme,
} from '@fluentui/react'
import useAsyncEffect from 'use-async-effect'
import { changeLib } from 'utils/editor'
import { NotebookItem } from 'components/notebook-item'
import { actions } from 'stores'

export default function Notebook() {
  const connection = useSelector((state) => state.root.connection)
  const notebooks = useSelector((state) => state.notebook.notebooks)
  const collectionsMap = useSelector((state) => state.root.collectionsMap)
  useAsyncEffect(
    () => changeLib(collectionsMap),
    (disposable) => {
      disposable?.dispose()
    },
    [collectionsMap],
  )
  const theme = getTheme()
  const handleRenderRow = useCallback<IRenderFunction<IDetailsRowProps>>(
    (_props, defaultRender) =>
      defaultRender?.({
        ..._props!,
        styles: {
          ..._props?.styles,
          cell: {
            paddingTop: 0,
            paddingBottom: 0,
            backgroundColor: theme.palette.neutralLighter,
            borderBottom: `1px solid ${theme.palette.neutralLight}`,
          },
        },
      }) || null,
    [theme],
  )
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.notebook.clearNotebook())
  }, [connection, dispatch])

  return (
    <div
      style={{
        overflowY: 'scroll',
        backgroundColor: theme.palette.neutralLighter,
      }}>
      <DetailsList
        styles={{
          contentWrapper: notebooks.length ? undefined : { height: 0 },
        }}
        items={notebooks}
        selectionMode={SelectionMode.none}
        compact={true}
        isHeaderVisible={false}
        columns={[
          {
            key: '',
            name: 'Notebooks',
            minWidth: 0,
          },
        ]}
        cellStyleProps={{
          cellLeftPadding: 0,
          cellRightPadding: 0,
          cellExtraRightPadding: 0,
        }}
        onRenderRow={handleRenderRow}
        onRenderItemColumn={NotebookItem}
        onRenderDetailsFooter={() => (
          <div style={{ marginBottom: 'calc(100vh - 130px - 32px - 44px)' }}>
            <NotebookItem />
          </div>
        )}
      />
    </div>
  )
}
