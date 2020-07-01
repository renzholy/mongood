import type { MongoData } from './utils/mongo-shell-data'

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
  command: MongoData
  active: boolean
  microsecs_running?: number
  desc: string
  planSummary: string
  originatingCommand: MongoData
  lockStats: object
  client: string
  numYields: number
}
