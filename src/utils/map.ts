import { EJSON } from 'bson'

import { MongoData } from '@/types'

/**
 * @see https://docs.mongodb.com/manual/core/2dsphere/#dsphere-data-restrictions
 */
export function getLocation(data?: MongoData): [number, number] | undefined {
  if (!data) {
    return undefined
  }
  const value = EJSON.parse(JSON.stringify(data)) as
    | [number, number]
    | { type: 'Point'; coordinates: [number, number] }
    | { [key: string]: number }
  if (Array.isArray(value)) {
    return value
  }
  if (
    'type' in value &&
    value.type === 'Point' &&
    Array.isArray(value.coordinates)
  ) {
    return value.coordinates
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    return [
      value[keys[0] as keyof typeof value] as number,
      value[keys[1] as keyof typeof value] as number,
    ]
  }
  return undefined
}

/**
 * @see https://tech.yandex.com/maps/staticapi/doc/1.x/dg/concepts/input_params-docpage/
 */
export function getMap(
  {
    width,
    height,
  }: {
    width: number
    height: number
  },
  longitude: number,
  latitude: number,
) {
  return `https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${longitude},${latitude}&size=${width},${height}&z=8&l=map&pt=${longitude},${latitude},round`
}
