import React, { useMemo } from 'react'
import { mapValues } from 'lodash'

import { parse } from '@/utils/ejson'
import { ColorizedData } from './ColorizedData'

export function TableDocument(props: { value: { [key: string]: string } }) {
  const value = useMemo(() => mapValues(props.value, parse), [props.value])
  return <ColorizedData value={value} />
}
