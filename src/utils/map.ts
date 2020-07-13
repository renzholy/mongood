import { EJSON } from 'bson'
import _ from 'lodash'

import { MongoData } from '@/types'

/**
 * @see https://docs.mongodb.com/manual/core/2dsphere/#dsphere-data-restrictions
 */
export function getLocation(
  data: MongoData,
  index2dsphere: string,
):
  | {
      longitude: number
      latitude: number
    }
  | undefined {
  const path = index2dsphere.split('.')
  path.shift()
  const v = path.length ? _.get(data, path.join('.')) : data
  if (!v) {
    return undefined
  }
  const value = EJSON.parse(JSON.stringify(v)) as any
  if (Array.isArray(value)) {
    return {
      longitude: value[0],
      latitude: value[1],
    }
  }
  if (value.type === 'Point' && Array.isArray(value.coordinates)) {
    return {
      longitude: value.coordinates[0],
      latitude: value.coordinates[1],
    }
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    return {
      longitude: value[keys[0]],
      latitude: value[keys[1]],
    }
  }
  return undefined
}

/**
 * @see https://tech.yandex.com/maps/staticapi/doc/1.x/dg/concepts/input_params-docpage/
 */
export function getMap({
  longitude,
  latitude,
  width,
  height,
}: {
  longitude: number
  latitude: number
  width: number
  height: number
}) {
  return `https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${longitude},${latitude}&size=${width},${height}&z=10&l=map&pt=${longitude},${latitude},round`
}
