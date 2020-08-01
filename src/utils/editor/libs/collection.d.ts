/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */

class Cursor {
  skip(skip: number): Cursor
  limit(limit: number): Cursor
  sort(sorter: object): Cursor
  hint(hint: object | string): Cursor
  project(projection: object): Cursor
  explain(): void
  toArray(): void
}

class Collection {
  find(filter: object = {}): Cursor
  findOne(filter: object = {}): void
  insertOne(doc: object): void
  insertMany(docs: object[])
  updateOne(
    filter: object,
    update: object,
    options: { upsert?: boolean } = {},
  ): void
  updateMany(
    filter: object,
    update: object,
    options: { upsert?: boolean } = {},
  ): void
  deleteOne(filter: object): void
  deleteMany(filter: object): void
  estimatedDocumentCount(): void
  countDocuments(filter: object = {}): Promise<number>
  getIndexes(): void
}
