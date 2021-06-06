/* eslint-disable react/no-danger */

import { useMemo, memo } from 'react'

import { stringify } from '@/utils/ejson'
import { useColorize } from '@/hooks/use-colorize'
import { MongoData } from '@/types'
import { getMap, getLocation } from '@/utils/map'
import { MongoDataHoverCard } from './MongoDataHoverCard'

export const DocumentCell = memo(
  (props: {
    value: MongoData
    subStringLength?: number
    index2dsphere?: MongoData
  }) => {
    const str = useMemo(
      () => stringify(props.value).substr(0, props.subStringLength),
      [props.value, props.subStringLength],
    )
    const html = useColorize(str)

    const location = useMemo(
      () => getLocation(props.index2dsphere),
      [props.index2dsphere],
    )
    const mapSrc = location ? getMap(500, 250, ...location) : undefined

    return str.length > 36 || props.index2dsphere ? (
      <MongoDataHoverCard
        value={props.value}
        header={
          mapSrc ? (
            <img
              src={mapSrc}
              alt="map"
              width={500}
              height={250}
              style={{ marginBottom: 10 }}
            />
          ) : null
        }>
        <span
          style={{ verticalAlign: 'middle' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </MongoDataHoverCard>
    ) : (
      <span
        style={{ verticalAlign: 'middle' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  },
  (prevProps, nextProps) =>
    prevProps.value === nextProps.value &&
    prevProps.subStringLength === nextProps.subStringLength &&
    prevProps.index2dsphere === nextProps.index2dsphere,
)
