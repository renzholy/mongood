export type ServerStats = {
  host: string
  uptimeMillis: number
  version: string
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

export type ExecStats = {
  stage: string
  inputStage?: ExecStats
  executionTimeMillisEstimate: number
  nReturned: number
  docsExamined?: number
  keysExamined?: number
  memUsage?: number
}

export type SystemProfileDoc = {
  ns: string
  op: string
  execStats?: ExecStats
  millis: number
  client: string
  ts: number
  nreturned: number
}
