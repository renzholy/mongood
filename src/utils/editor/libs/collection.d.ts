/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */

class AggregationCursor {
  async explain(): Promise<any>

  async toArray(): Promise<any[]>
}

class Cursor<T> {
  skip(skip: number): Cursor<T>

  limit(limit: number): Cursor<T>

  sort(sorter: object): Cursor<T>

  hint(hint: object | string): Cursor<T>

  project(projection: object): Cursor<T>

  async explain(): Promise<any>

  async toArray(): Promise<T[]>
}

class Collection<T = any> {
  aggregate(
    pipeline: object[],
    options: {
      allowDiskUse?: boolean
      maxTimeMS?: number
      hint?: string | object
    } = {},
  ): AggregationCursor<T>

  find(filter: object = {}): Cursor<T>

  async findOne(filter: object = {}): Promise<T | null>

  async insertOne(
    doc: object,
  ): Promise<{
    insertedCount: number
  }>

  async insertMany(
    docs: object[],
  ): Promise<{
    insertedCount: number
  }>

  async updateOne(
    filter: object,
    update: object,
    options: { upsert?: boolean } = {},
  ): Promise<{
    matchedCount: number
    modifiedCount: number
    upsertedCount: number
    upsertedId?: typeof ObjectId
  }>

  async updateMany(
    filter: object,
    update: object,
    options: { upsert?: boolean } = {},
  ): Promise<{
    matchedCount: number
    modifiedCount: number
    upsertedCount: number
    upsertedId?: typeof ObjectId
  }>

  async deleteOne(
    filter: object,
  ): Promise<{
    deletedCount: number
  }>

  async deleteMany(
    filter: object,
  ): Promise<{
    deletedCount: number
  }>

  async estimatedDocumentCount(): Promise<number>

  async countDocuments(filter: object = {}): Promise<number>

  async listIndexes(): Promise<any[]>
}
