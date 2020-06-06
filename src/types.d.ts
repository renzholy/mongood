export type ServerStats = {
  host: string
  uptimeMillis: number
  repl?: {
    setName: string
    hosts: string[]
    primary: string
  }
  connections: {
    available: number
    current: number
    totalCreated: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    numRequests: number
  }
  opcounters: {
    insert: number
    query: number
    update: number
    delete: number
    getmore: number
    command: number
  }
  opcountersRepl?: {
    insert: number
    query: number
    update: number
    delete: number
    getmore: number
    command: number
  }
}

export type DbStats = {
  avgObjSize: number
  collections: number
  dataSize: number
  db: string
  indexSize: number
  indexes: number
  fsUsedSize: number
  fsTotalSize: number
  objects: number
  storageSize: number
  views: number
}

export enum DisplayMode {
  TABLE,
  DOCUMENT,
}
