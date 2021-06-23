import { EJSON } from 'bson'
import type { MongoData } from 'types'
import { storage } from './storage'

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

export function getMap(
  width: number,
  height: number,
  longitude: number,
  latitude: number,
): string | undefined {
  return storage.staticMapUrlTemplate.get
    .replace(/\{\{longitude\}\}/g, longitude.toString())
    .replace(/\{\{latitude\}\}/g, latitude.toString())
    .replace(/\{\{width\}\}/g, width.toString())
    .replace(/\{\{height\}\}/g, height.toString())
}
