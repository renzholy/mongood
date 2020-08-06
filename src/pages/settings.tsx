import { TextField } from '@fluentui/react'
import React, { useState } from 'react'

import {
  STATIC_MAP_URL_TEMPLATE_DEFAULT,
  STATIC_MAP_URL_TEMPLATE_KEY,
} from '@/utils/map'

export default () => {
  const [staticMapUrlTemplate, setStaticMapUrlTemplate] = useState<
    string | undefined
  >(
    localStorage.getItem(STATIC_MAP_URL_TEMPLATE_KEY) ||
      STATIC_MAP_URL_TEMPLATE_DEFAULT,
  )

  return (
    <div style={{ margin: 20 }}>
      <TextField
        label="Static map url template:"
        description="Supported parameters: {{longitude}}, {{latitude}}, {{width}} and {{height}}"
        value={staticMapUrlTemplate}
        onBlur={() => {
          localStorage.setItem(
            STATIC_MAP_URL_TEMPLATE_KEY,
            staticMapUrlTemplate || STATIC_MAP_URL_TEMPLATE_DEFAULT,
          )
        }}
        onChange={(_ev, newValue) => {
          setStaticMapUrlTemplate(newValue)
        }}
      />
    </div>
  )
}
