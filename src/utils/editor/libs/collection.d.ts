/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */

class Cursor {
  limit(limit: number = 100): Cursor

  toArray(): void
}

class Collection {
  find(filter: object = {}): Cursor
}
