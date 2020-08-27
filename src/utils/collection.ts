/* eslint-disable max-classes-per-file */
/**
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/mongodb/index.d.ts
 */

import saferEval from 'safer-eval'
import { Preprocessor } from '@mongosh/browser-runtime-core/lib/interpreter/preprocessor/preprocessor'
import { EJSON } from 'bson'
import { omitBy, isNil } from 'lodash'

import { MongoData } from '@/types'
import { sandbox } from './ejson'
import { runCommand } from './fetcher'

class AggregationCursor {
  #connection: string

  #database: string

  #obj: any

  constructor(connection: string, database: string, obj: any = {}) {
    this.#connection = connection
    this.#database = database
    this.#obj = obj
  }

  async explain(): Promise<any> {
    return runCommand(
      this.#connection,
      this.#database,
      {
        explain: this.#obj,
      },
      { canonical: true },
    )
  }

  async toArray(): Promise<any[]> {
    const {
      cursor: { firstBatch },
    } = await runCommand(this.#connection, this.#database, this.#obj, {
      canonical: true,
    })
    return firstBatch
  }
}

class Cursor<T> {
  #connection: string

  #database: string

  #obj: any

  constructor(connection: string, database: string, obj: any = {}) {
    this.#connection = connection
    this.#database = database
    this.#obj = obj
  }

  skip(skip: number) {
    this.#obj.skip = skip
    return this
  }

  limit(limit: number) {
    this.#obj.limit = limit
    return this
  }

  sort(sorter: object) {
    this.#obj.sort = sorter
    return this
  }

  hint(hint: object | string) {
    this.#obj.hint = hint
    return this
  }

  project(projection: object) {
    this.#obj.projection = projection
    return this
  }

  async explain(): Promise<any> {
    return runCommand(
      this.#connection,
      this.#database,
      {
        explain: this.#obj,
      },
      { canonical: true },
    )
  }

  async toArray(): Promise<T[]> {
    const {
      cursor: { firstBatch },
    } = await runCommand(this.#connection, this.#database, this.#obj, {
      canonical: true,
    })
    return firstBatch
  }
}

class Collection<T> {
  #connection: string

  #database: string

  #collection: string

  constructor(connection: string, database: string, collection: string) {
    this.#connection = connection
    this.#database = database
    this.#collection = collection
  }

  aggregate(
    pipeline: object[],
    options: {
      batchSize?: number
      allowDiskUse?: boolean
      maxTimeMS?: number
      hint?: string | object
    } = {},
  ): AggregationCursor {
    return new AggregationCursor(this.#connection, this.#database, {
      aggregate: this.#collection,
      pipeline,
      cursor: options.batchSize ? { batchSize: options.batchSize } : {},
      allowDiskUse: options.allowDiskUse,
      maxTimeMS: options.maxTimeMS,
      hint: options.hint,
    })
  }

  find(filter?: object): Cursor<T> {
    return new Cursor<T>(this.#connection, this.#database, {
      find: this.#collection,
      filter,
    })
  }

  async findOne(filter?: object): Promise<T | null> {
    const {
      cursor: { firstBatch },
    } = await runCommand(
      this.#connection,
      this.#database,
      {
        find: this.#collection,
        filter,
        limit: 1,
      },
      { canonical: true },
    )
    return firstBatch?.[0] || null
  }

  async insertOne(
    doc: object,
  ): Promise<{
    insertedCount: number
  }> {
    const { n } = await runCommand<{ n: number }>(
      this.#connection,
      this.#database,
      {
        insert: this.#collection,
        documents: [doc],
      },
    )
    return {
      insertedCount: n,
    }
  }

  async insertMany(
    docs: object[],
  ): Promise<{
    insertedCount: number
  }> {
    const { n } = await runCommand<{ n: number }>(
      this.#connection,
      this.#database,
      {
        insert: this.#collection,
        documents: docs,
      },
    )
    return {
      insertedCount: n,
    }
  }

  async updateOne(
    filter: object,
    update: object,
    options: { upsert?: boolean } = {},
  ): Promise<{
    matchedCount: number
    modifiedCount: number
    upsertedCount: number
    upsertedId?: MongoData
  }> {
    const { upserted, ...rest } = await runCommand<{
      n: MongoData
      nModified: MongoData
      upserted?: { _id: MongoData }[]
    }>(
      this.#connection,
      this.#database,
      {
        update: this.#collection,
        updates: [
          {
            q: filter,
            u: update,
            upsert: options.upsert,
            multi: false,
          },
        ],
      },
      { canonical: true },
    )
    const { n, nModified } = EJSON.parse(JSON.stringify(rest)) as {
      n: number
      nModified: number
    }
    return omitBy(
      {
        matchedCount: n,
        modifiedCount: nModified,
        upsertedCount: upserted?.length || 0,
        upsertedId: upserted?.[0]._id,
      },
      isNil,
    ) as {
      matchedCount: number
      modifiedCount: number
      upsertedCount: number
      upsertedId?: MongoData
    }
  }

  async updateMany(
    filter: object,
    update: object,
    options: { upsert?: boolean } = {},
  ): Promise<{
    matchedCount: number
    modifiedCount: number
    upsertedCount: number
    upsertedId?: MongoData
  }> {
    const { upserted, ...rest } = await runCommand<{
      n: MongoData
      nModified: MongoData
      upserted?: { _id: MongoData }[]
    }>(
      this.#connection,
      this.#database,
      {
        update: this.#collection,
        updates: [
          {
            q: filter,
            u: update,
            upsert: options.upsert,
            multi: true,
          },
        ],
      },
      { canonical: true },
    )
    const { n, nModified } = EJSON.parse(JSON.stringify(rest)) as {
      n: number
      nModified: number
    }
    return omitBy(
      {
        matchedCount: n,
        modifiedCount: nModified,
        upsertedCount: upserted?.length || 0,
        upsertedId: upserted?.[0]?._id,
      },
      isNil,
    ) as {
      matchedCount: number
      modifiedCount: number
      upsertedCount: number
      upsertedId?: MongoData
    }
  }

  async deleteOne(
    filter: object,
  ): Promise<{
    deletedCount: number
  }> {
    const { n } = await runCommand(this.#connection, this.#database, {
      delete: this.#collection,
      deletes: [
        {
          q: filter,
          limit: 1,
        },
      ],
    })
    return { deletedCount: n }
  }

  async deleteMany(
    filter: object,
  ): Promise<{
    deletedCount: number
  }> {
    const { n } = await runCommand(this.#connection, this.#database, {
      delete: this.#collection,
      deletes: [
        {
          q: filter,
          limit: 0,
        },
      ],
    })
    return {
      deletedCount: n,
    }
  }

  async estimatedDocumentCount(): Promise<number> {
    const { n } = await runCommand<{ n: number }>(
      this.#connection,
      this.#database,
      {
        count: this.#collection,
      },
    )
    return n
  }

  async countDocuments(filter: object = {}): Promise<number> {
    const { n } = await runCommand<{ n: number }>(
      this.#connection,
      this.#database,
      {
        count: this.#collection,
        query: filter,
      },
    )
    return n
  }

  async listIndexes(): Promise<any[]> {
    const {
      cursor: { firstBatch },
    } = await runCommand(this.#connection, this.#database, {
      listIndexes: this.#collection,
    })
    return firstBatch
  }
}

class Database {
  #connection: string

  #database: string

  constructor(connection: string, database: string) {
    this.#connection = connection
    this.#database = database
  }

  async createCollection(
    name: string,
    options: {
      capped?: boolean
      autoIndexId?: boolean
      size?: number
      max?: number
      storageEngine?: object
      validator?: object
      validationLevel?: 'off' | 'strict' | 'moderate'
      validationAction?: 'error' | 'warn'
      indexOptionDefaults?: object
      viewOn?: string
      pipeline?: any[]
    } = {},
  ): Promise<Collection<any>> {
    await runCommand(this.#connection, this.#database, {
      create: name,
      ...options,
    })
    return new Collection(this.#connection, this.#database, name)
  }

  async dropDatabase(): Promise<void> {
    await runCommand(this.#connection, this.#database, {
      dropDatabase: 1,
    })
  }

  async dropCollection(name: string): Promise<void> {
    await runCommand(this.#connection, this.#database, {
      drop: name,
    })
  }

  async renameCollection(
    fromCollection: string,
    toCollection: string,
    options: { dropTarget?: boolean } = {},
  ): Promise<void> {
    await runCommand(this.#connection, this.#database, {
      renameCollection: fromCollection,
      to: toCollection,
      dropTarget: options.dropTarget,
    })
  }
}

export async function evalCommand(
  connection: string,
  code: string,
): Promise<object> {
  const preprocessor = new Preprocessor({
    lastExpressionCallbackFunctionName:
      '__LAST_EXPRESSION_CALLBACK_FUNCTION_NAME__',
    lexicalContextStoreVariableName: '__LEXICAL_CONTEXT_STORE_VARIABLE_NAME__',
  })
  return new Promise((resolve) => {
    const context = {
      ...sandbox,
      __LEXICAL_CONTEXT_STORE_VARIABLE_NAME__: {},
      __LAST_EXPRESSION_CALLBACK_FUNCTION_NAME__: resolve,
      db: new Proxy(
        {},
        {
          get(_target, _database: string) {
            return new Proxy(new Database(connection, _database), {
              get(__target, _collection: string) {
                return _collection in __target
                  ? __target[_collection as keyof typeof __target]
                  : new Collection(connection, _database, _collection)
              },
            })
          },
        },
      ),
    }
    saferEval(preprocessor.preprocess(code), context)
  })
}
