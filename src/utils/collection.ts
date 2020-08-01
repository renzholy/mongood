/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */

import saferEval from 'safer-eval'
import { Preprocessor } from '@mongosh/browser-runtime-core/lib/interpreter/preprocessor/preprocessor'

import { sandbox } from './ejson'
import { runCommand } from './fetcher'

class Cursor {
  obj: any

  constructor(obj: any = {}) {
    this.obj = obj
  }

  skip(skip: number) {
    this.obj.skip = skip
    return this
  }

  limit(limit: number) {
    this.obj.limit = limit
    return this
  }

  sort(sorter: object) {
    this.obj.sort = sorter
    return this
  }

  hint(hint: object | string) {
    this.obj.hint = hint
    return this
  }

  project(projection: object) {
    this.obj.projection = projection
    return this
  }

  explain() {
    return {
      explain: this.obj,
    }
  }

  toArray() {
    return this.obj
  }
}

class Collection {
  private connection: string

  private database: string

  private collection: string

  constructor(connection: string, database: string, collection: string) {
    this.connection = connection
    this.database = database
    this.collection = collection
  }

  find(filter?: object) {
    return new Cursor({
      find: this.collection,
      filter,
      limit: 10,
    })
  }

  findOne(filter?: object) {
    return {
      find: this.collection,
      filter,
      limit: 1,
    }
  }

  insertOne(doc: object) {
    return {
      insert: this.collection,
      documents: [doc],
    }
  }

  insertMany(docs: object[]) {
    return {
      insert: this.collection,
      documents: docs,
    }
  }

  updateOne(
    filter: object,
    update: object,
    options: { upsert?: boolean } = {},
  ) {
    return {
      update: this.collection,
      updates: [
        {
          q: filter,
          u: update,
          upsert: options.upsert,
          multi: false,
        },
      ],
    }
  }

  updateMany(
    filter: object,
    update: object,
    options: { upsert?: boolean } = {},
  ) {
    return {
      update: this.collection,
      updates: [
        {
          q: filter,
          u: update,
          upsert: options.upsert,
          multi: true,
        },
      ],
    }
  }

  deleteOne(filter: object) {
    return {
      delete: this.collection,
      deletes: [
        {
          q: filter,
          limit: 1,
        },
      ],
    }
  }

  deleteMany(filter: object) {
    return {
      delete: this.collection,
      deletes: [
        {
          q: filter,
          limit: 0,
        },
      ],
    }
  }

  estimatedDocumentCount() {
    return {
      count: this.collection,
    }
  }

  async countDocuments(filter: object = {}): Promise<number> {
    const { n } = await runCommand<{ n: number }>(
      this.connection,
      this.database,
      {
        count: this.collection,
        query: filter,
      },
    )
    return n
  }

  getIndexes() {
    return {
      listIndexes: this.collection,
    }
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
          get(_target, _database) {
            return new Proxy(
              {},
              {
                get(__target, _collection) {
                  return new Collection(
                    connection,
                    _database as string,
                    _collection as string,
                  )
                },
              },
            )
          },
        },
      ),
    }
    const str = preprocessor.preprocess(code)
    console.log(str)
    saferEval(str, context)
  })
}
