import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import _ from 'lodash'
import { DefaultButton, Stack } from '@fluentui/react'

import { actions } from '@/stores'
import { SystemProfile } from '@/components/SystemProfile'
import { CurrentOperation } from '@/components/CurrentOperation'

enum Type {
  CURRENT = 'Current Op',
  PROFILE = 'System Profile',
}

export default () => {
  const { collection } = useSelector((state) => state.root)
  const [type, setType] = useState(Type.CURRENT)
  const dispatch = useDispatch()
  useEffect(() => {
    if (type === Type.PROFILE) {
      dispatch(actions.root.setCollection('system.profile'))
    }
  }, [type])
  useEffect(() => {
    setType(collection === 'system.profile' ? Type.PROFILE : Type.CURRENT)
  }, [collection])

  return (
    <>
      <Stack
        wrap={true}
        horizontal={true}
        tokens={{ childrenGap: 10, padding: 10 }}
        styles={{
          root: {
            marginBottom: -10,
            justifyContent: 'space-between',
          },
        }}>
        {_.map(Type, (v, k: Type) => (
          <DefaultButton
            key={k}
            text={v}
            primary={type === v}
            onClick={() => {
              setType(v)
            }}
          />
        ))}
      </Stack>
      {type === Type.CURRENT ? <CurrentOperation /> : null}
      {type === Type.PROFILE ? <SystemProfile /> : null}
    </>
  )
}
