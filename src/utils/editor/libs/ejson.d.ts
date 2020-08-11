/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @param {string} id Must be a 24 byte hex string.
 */
function ObjectId(
  id: string,
): {
  $oid: string
}

/**
 * @param {string} date An ISO-8601 date string
 */
function ISODate(
  date?: string,
): {
  $date: {
    $numberLong: string
  }
}

/**
 * @param {number|string} date
 */
function Date(
  date?: number | string,
): {
  $date: {
    $numberLong: string
  }
}

/**
 * @param {string} A high-precision decimal as string.
 */
function NumberDecimal(
  num: string | number,
): {
  $numberDecimal: string
}

/**
 * @param {string} num A long number string
 */
function NumberLong(
  num: string,
): {
  $numberLong: string
}

/**
 * @param {string} num A int number string
 */
function NumberInt(
  num: string,
): {
  $numberInt: string
}

/**
 * @param {number} t A positive integer for the seconds since epoch.
 * @param {number} i A positive integer for the increment.
 */
function Timestamp(
  t: number,
  i: number,
): {
  $timestamp: {
    t: number
    i: number
  }
}

/**
 * @param {number} subType BSON binary subtype. See the extended bson documentation http://bsonspec.org/spec.html for subtypes available.
 * @param {string} base64 Base64 encoded (with padding as “=”) payload string.
 */
function BinData(
  subType: number,
  base64: string,
): {
  $binary: {
    base64: string
    subType: string
  }
}

/**
 *
 * The MinKey BSON data type compares lower than all other types.
 */
function MinKey(): {
  $minKey: 1
} {
  return {
    $minKey: 1,
  }
}

/**
 * The MaxKey BSON data type compares higher than all other types.
 */
function MaxKey(): {
  $maxKey: 1
} {
  return {
    $maxKey: 1,
  }
}

const SubType = {
  Generic: 0x0,
  Function: 0x1,
  Binary_old: 0x2,
  UUID_old: 0x3,
  UUID: 0x4,
  MD5: 0x5,
  Encrypted: 0x6,
  UserDefined: 0x80,
}
