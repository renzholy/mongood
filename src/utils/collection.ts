/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */

import saferEval from 'safer-eval'
import { Preprocessor } from '@mongosh/browser-runtime-core/lib/interpreter/preprocessor/preprocessor'

import { sandbox } from './ejson'
import { runCommand } from './fetcher'

function Cursor(obj: any = {}) {
  return {
    skip(skip: number) {
      obj.skip = skip
      return this
    },
    limit(limit: number) {
      obj.limit = limit
      return this
    },
    sort(sorter: object) {
      obj.sort = sorter
      return this
    },
    hint(hint: object | string) {
      obj.hint = hint
      return this
    },
    project(projection: object) {
      obj.projection = projection
      return this
    },
    explain() {
      return {
        explain: obj,
      }
    },
    toArray() {
      return obj
    },
  }
}

function Collection(connection: string, database: string, collection: string) {
  return {
    find(filter?: object) {
      return Cursor({
        find: collection,
        filter,
        limit: 10,
      })
    },
    findOne(filter?: object) {
      return {
        find: collection,
        filter,
        limit: 1,
      }
    },
    insertOne(doc: object) {
      return {
        insert: collection,
        documents: [doc],
      }
    },
    insertMany(docs: object[]) {
      return {
        insert: collection,
        documents: docs,
      }
    },
    updateOne(
      filter: object,
      update: object,
      options: { upsert?: boolean } = {},
    ) {
      return {
        update: collection,
        updates: [
          {
            q: filter,
            u: update,
            upsert: options.upsert,
            multi: false,
          },
        ],
      }
    },
    updateMany(
      filter: object,
      update: object,
      options: { upsert?: boolean } = {},
    ) {
      return {
        update: collection,
        updates: [
          {
            q: filter,
            u: update,
            upsert: options.upsert,
            multi: true,
          },
        ],
      }
    },
    deleteOne(filter: object) {
      return {
        delete: collection,
        deletes: [
          {
            q: filter,
            limit: 1,
          },
        ],
      }
    },
    deleteMany(filter: object) {
      return {
        delete: collection,
        deletes: [
          {
            q: filter,
            limit: 0,
          },
        ],
      }
    },
    estimatedDocumentCount() {
      return {
        count: collection,
      }
    },
    async countDocuments(filter: object = {}): Promise<number> {
      return runCommand(connection, database, {
        count: collection,
        query: filter,
      })
    },
    getIndexes() {
      return {
        listIndexes: collection,
      }
    },
  }
}

const preprocessor = new Preprocessor({
  lastExpressionCallbackFunctionName:
    '__LAST_EXPRESSION_CALLBACK_FUNCTION_NAME__',
  lexicalContextStoreVariableName: '__LEXICAL_CONTEXT_STORE_VARIABLE_NAME__',
})

export async function evalCommand(
  connection: string,
  database: string,
  code: string,
): Promise<object> {
  return new Promise((resolve) => {
    const context = {
      ...sandbox,
      __LEXICAL_CONTEXT_STORE_VARIABLE_NAME__: {},
      __LAST_EXPRESSION_CALLBACK_FUNCTION_NAME__: resolve,
      db: new Proxy(
        {},
        {
          get(_target, name) {
            return Collection(connection, database, name as string)
          },
        },
      ),
    }
    saferEval(preprocessor.preprocess(code), context)
  })
}
