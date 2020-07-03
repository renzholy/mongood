export type MongoData =
  | string
  | number
  | boolean
  | undefined
  | null
  | { $oid: string }
  | {
      id: {
        '0': number
        '1': number
        '2': number
        '3': number
        '4': number
        '5': number
        '6': number
        '7': number
        '8': number
        '9': number
        '10': number
        '11': number
      }
    }
  | { $date: { $numberLong: string } }
  | { $numberDecimal: string }
  | { $numberDouble: string }
  | { $numberInt: string }
  | { $numberLong: string }
  | { $regularExpression: { pattern: string; options: string } }
  | { $timestamp: { t: number; i: number } }
  | { $binary: { base64: string; subType: string } }
  | object[]
  | object

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
  TABLE = 'TABLE',
  DOCUMENT = 'DOCUMENT',
}

export type ExecStats = {
  stage: string
  inputStage?: ExecStats
  inputStages?: ExecStats[]
  executionTimeMillisEstimate: number
  nReturned: number
  nMatched?: number
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
  ts: Date
  errMsg?: string
  nreturned?: number
  docsExamined?: number
  keysExamined?: number
  originatingCommand?: MongoData
  command: MongoData
  locks: lockStats
}

export type Operation = {
  opid: number
  op:
    | 'none'
    | 'update'
    | 'insert'
    | 'query'
    | 'command'
    | 'getmore'
    | 'remove'
    | 'killcursors'
  ns?: string
  active: boolean
  microsecs_running?: number
  desc: string
  planSummary: string
  originatingCommand?: MongoData
  command: MongoData
  lockStats: MongoData
  clientMetadata?: {
    driver?: {
      name?: string
      version?: string
    }
  }
  client?: string
  numYields: number
}
