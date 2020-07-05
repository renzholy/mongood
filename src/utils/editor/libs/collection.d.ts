/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */

class Cursor {
  skip(skip: number = 0): Cursor
  limit(limit: number = 10): Cursor
  sort(sorter: object): Cursor
  hint(hint: object | string): Cursor
  project(projection: object): Cursor
  explain(): void
  toArray(): void
}

class Collection {
  find(filter: object = {}): Cursor
}
