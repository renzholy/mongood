import React, { useState } from 'react'
import _ from 'lodash'
import { DefaultButton, Stack } from '@fluentui/react'

import { SystemProfile } from '@/components/SystemProfile'
import { CurrentOperation } from '@/components/CurrentOperation'

enum Type {
  CURRENT = 'Current Op',
  PROFILE = 'System Profile',
}

export default () => {
  const [type, setType] = useState(Type.CURRENT)

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
