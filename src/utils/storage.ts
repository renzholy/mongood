import { DisplayMode } from '@/types'

enum StorageType {
  STRING,
  NUMBER,
  JSON,
}

function getItem<T>(
  type: StorageType,
  key: string,
): string | number | T | undefined {
  const item = localStorage.getItem(key)
  switch (type) {
    case StorageType.STRING: {
      return item || undefined
    }
    case StorageType.NUMBER: {
      try {
        return item === null ? undefined : parseInt(item, 10)
      } catch {
        return undefined
      }
    }
    case StorageType.JSON: {
      try {
        return item === null ? undefined : JSON.parse(item)
      } catch {
        return undefined
      }
    }
    default: {
      return undefined
    }
  }
}

function setItem<T>(
  type: StorageType,
  key: string,
): (value?: T | number | string) => void {
  return (value) => {
    if (value === undefined) {
      localStorage.removeItem(key)
      return
    }
    switch (type) {
      case StorageType.STRING: {
        localStorage.setItem(key, value as string)
        break
      }
      case StorageType.NUMBER: {
        localStorage.setItem(key, (value as number).toString())
        break
      }
      case StorageType.JSON: {
        localStorage.setItem(key, JSON.stringify(value))
        break
      }
      default: {
        // do nothing
      }
    }
  }
}

function genGetSet(
  type: StorageType.STRING,
  key: string,
  defaultValue: string,
): { get: string; set: (value?: string) => void }
function genGetSet(
  type: StorageType.STRING,
  key: string,
): { get: string | undefined; set: (value?: string) => void }
function genGetSet<T extends string>(
  type: StorageType.STRING,
  key: string,
  defaultValue: T,
): { get: T; set: (value?: T) => void }
function genGetSet<T extends string>(
  type: StorageType.STRING,
  key: string,
): { get: T | undefined; set: (value?: T) => void }
function genGetSet(
  type: StorageType.NUMBER,
  key: string,
  defaultValue: number,
): { get: number; set: (value?: number) => void }
function genGetSet(
  type: StorageType.NUMBER,
  key: string,
): { get: number | undefined; set: (value?: number) => void }
function genGetSet<T>(
  type: StorageType.JSON,
  key: string,
  defaultValue: T,
): { get: T; set: (value?: T) => void }
function genGetSet<T>(
  type: StorageType.JSON,
  key: string,
): { get: T | undefined; set: (value?: T) => void }
function genGetSet(type: StorageType, key: string, defaultValue?: any) {
  return {
    get: getItem(type, key) || defaultValue,
    set: setItem(type, key),
  }
}

export const storage = {
  connection: genGetSet(StorageType.STRING, 'connection'),

  selfAddedConnections: genGetSet<string[]>(
    StorageType.JSON,
    'connections',
    [],
  ),

  displayMode: genGetSet<DisplayMode>(
    StorageType.STRING,
    'displayMode',
    DisplayMode.TABLE,
  ),

  limit: genGetSet(StorageType.NUMBER, 'limit', 25),

  tabSize: genGetSet(StorageType.NUMBER, 'settings.tabSize', 2),

  timezoneOffset: genGetSet(StorageType.NUMBER, 'settings.timezoneOffset', 0),

  /**
   * @see https://tech.yandex.com/maps/staticapi/doc/1.x/dg/concepts/input_params-docpage/
   */
  staticMapUrlTemplate: genGetSet(
    StorageType.STRING,
    'settings.staticMapUrlTemplate',
    'https://static-maps.yandex.ru/1.x/?lang=en_US&ll={{longitude}},{{latitude}}&size={{width}},{{height}}&z=8&l=map&pt={{longitude}},{{latitude}},round',
  ),
}
