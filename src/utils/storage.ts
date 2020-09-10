import { DisplayMode } from '@/types'

enum StorageType {
  STRING,
  NUMBER,
  JSON,
}

function getItem<T extends string>(
  type: StorageType.STRING,
  key: string,
): T | undefined
function getItem(type: StorageType.NUMBER, key: string): number | undefined
function getItem<T>(type: StorageType.JSON, key: string): T | undefined
function getItem(type: StorageType, key: string) {
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

function setItem<T extends string>(
  type: StorageType.STRING,
  key: string,
): (value?: T) => void
function setItem(
  type: StorageType.NUMBER,
  key: string,
): (value?: number) => void
function setItem<T>(type: StorageType.JSON, key: string): (value?: T) => void
function setItem(type: StorageType, key: string): (value?: any) => void {
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

export const storage = {
  connection: getItem(StorageType.STRING, 'connection'),
  setConnection: setItem(StorageType.STRING, 'connection'),

  selfAddedConnections:
    getItem<string[]>(StorageType.JSON, 'connections') || [],
  setSelfAddedConnections: setItem<string[]>(StorageType.JSON, 'connections'),

  displayMode:
    getItem<DisplayMode>(StorageType.STRING, 'displayMode') ||
    DisplayMode.TABLE,
  setDisplayMode: setItem<DisplayMode>(StorageType.STRING, 'displayMode'),

  limit: getItem(StorageType.NUMBER, 'limit') || 25,
  setLimit: setItem(StorageType.NUMBER, 'limit'),

  tabSize: getItem(StorageType.NUMBER, 'settings.tabSize') || 2,
  setTabSize: setItem(StorageType.NUMBER, 'settings.tabSize'),

  timezoneOffset: getItem(StorageType.NUMBER, 'settings.timezoneOffset') || 0,
  setTimezoneOffset: setItem(StorageType.NUMBER, 'settings.timezoneOffset'),

  /**
   * @see https://tech.yandex.com/maps/staticapi/doc/1.x/dg/concepts/input_params-docpage/
   */
  staticMapUrlTemplate:
    getItem(StorageType.STRING, 'settings.staticMapUrlTemplate') ||
    'https://static-maps.yandex.ru/1.x/?lang=en_US&ll={{longitude}},{{latitude}}&size={{width}},{{height}}&z=8&l=map&pt={{longitude}},{{latitude}},round',
  setStaticMapUrlTemplate: setItem(
    StorageType.STRING,
    'settings.staticMapUrlTemplate',
  ),
}
