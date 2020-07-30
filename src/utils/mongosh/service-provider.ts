/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */

import {
  ServiceProvider,
  Cursor,
  Document,
  ReplPlatform,
  DatabaseOptions,
  WriteConcern,
  BulkWriteResult,
  CommandOptions,
} from '@mongosh/service-provider-core'

import { runCommand } from '../fetcher'

export class RunCommandServiceProvider implements ServiceProvider {
  platform = ReplPlatform.Browser

  connection: string

  initialDb: string

  constructor(connection: string, initialDb: string) {
    this.connection = connection
    this.initialDb = initialDb
  }

  aggregate(
    database: string,
    collection: string,
    pipeline: Document[],
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Cursor {
    throw new Error('Method not implemented.')
  }

  aggregateDb(
    database: string,
    pipeline: Document[],
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Cursor {
    throw new Error('Method not implemented.')
  }

  count(
    db: string,
    coll: string,
    query?: Document | undefined,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  countDocuments(
    database: string,
    collection: string,
    filter?: Document | undefined,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    return runCommand(
      this.connection,
      database,
      {
        count: collection,
        filter,
        // options,
        // dbOptions,
      },
      { canonical: true },
    )
  }

  distinct(
    database: string,
    collection: string,
    fieldName: string,
    filter?: Document | undefined,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  estimatedDocumentCount(
    database: string,
    collection: string,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  find(
    database: string,
    collection: string,
    filter?: Document | undefined,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Cursor {
    throw new Error('Method not implemented.')
  }

  getTopology() {
    throw new Error('Method not implemented.')
  }

  isCapped(
    database: string,
    collection: string,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  getIndexes(
    database: string,
    collection: string,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  listCollections(
    database: string,
    filter?: Document | undefined,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  stats(
    database: string,
    collection: string,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  runCommand(
    db: string,
    spec: Document,
    options?: CommandOptions | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  dropDatabase(
    database: string,
    writeConcern?: WriteConcern | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  bulkWrite(
    database: string,
    collection: string,
    requests: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<BulkWriteResult> {
    throw new Error('Method not implemented.')
  }

  deleteMany(
    database: string,
    collection: string,
    filter: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  deleteOne(
    database: string,
    collection: string,
    filter: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  findOneAndDelete(
    database: string,
    collection: string,
    filter: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  findOneAndReplace(
    database: string,
    collection: string,
    filter: Document,
    replacement: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  findOneAndUpdate(
    database: string,
    collection: string,
    filter: Document,
    update: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  insertMany(
    database: string,
    collection: string,
    docs: Document[],
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  insertOne(
    database: string,
    collection: string,
    doc: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  replaceOne(
    database: string,
    collection: string,
    filter: Document,
    replacement: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  updateMany(
    database: string,
    collection: string,
    filter: Document,
    update: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  findAndModify(
    database: string,
    collection: string,
    query: Document,
    sort: any[] | Document,
    update: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ) {
    throw new Error('Method not implemented.')
  }

  updateOne(
    database: string,
    collection: string,
    filter: Document,
    update: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  save(
    database: string,
    collection: string,
    doc: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  remove(
    database: string,
    collection: string,
    query: Document,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  convertToCapped(
    database: string,
    collection: string,
    size: number,
    options?: CommandOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  createIndexes(
    database: string,
    collection: string,
    indexSpecs: Document[],
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  dropIndexes(
    database: string,
    collection: string,
    indexes: string | Document | Document[] | string[],
    commandOptions?: CommandOptions | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  reIndex(
    database: string,
    collection: string,
    options?: CommandOptions | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  dropCollection(
    database: string,
    collection: string,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  renameCollection(
    database: string,
    oldName: string,
    newName: string,
    options?: Document | undefined,
    dbOptions?: DatabaseOptions | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  close(boolean: any): Promise<void> {
    throw new Error('Method not implemented.')
  }

  buildInfo(): Promise<any> {
    throw new Error('Method not implemented.')
  }

  getCmdLineOpts(): Promise<any> {
    throw new Error('Method not implemented.')
  }

  listDatabases(database: string): Promise<any> {
    throw new Error('Method not implemented.')
  }

  getNewConnection(uri: string, options: any): Promise<any> {
    throw new Error('Method not implemented.')
  }

  getConnectionInfo(): Promise<any> {
    throw new Error('Method not implemented.')
  }
}
