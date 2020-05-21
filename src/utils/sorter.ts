/* eslint-disable no-nested-ternary */

import _ from 'lodash'

function checkSort(
  index: { [key: string]: 1 | -1 | 'text' },
  sorter: { [key: string]: 1 | -1 | undefined },
): boolean {
  // check if sorter keys are continuous
  const values = Object.values(sorter)
  if (
    values.some((v, i) => {
      return v === undefined && i > 0 && i < values.length - 1
    })
  ) {
    return false
  }

  // check if sorter keys are in (reverse) order
  const size = _.size(_.omitBy(sorter, _.isNil))
  const checkSum = _.reduce(
    sorter,
    (prev, curr, key) => {
      return (
        prev +
        (curr === undefined || index[key] === 'text'
          ? 0
          : (index[key] as 1 | -1) * curr)
      )
    },
    0,
  )
  return checkSum === size || checkSum === -size
}

export function nextSorter(
  currentIndex: number,
  index: { [key: string]: 1 | -1 | 'text' },
  sorter: { [key: string]: 1 | -1 | undefined },
): { [key: string]: 1 | -1 | undefined } {
  const keys = Object.keys(index)
  const key = keys[currentIndex]
  let newSorter: { [key: string]: 1 | -1 | undefined } = {}
  // first sorter switches bewteen 3 states: [1, -1, undefined]
  if (currentIndex === 0 || sorter[keys[currentIndex - 1]] === undefined) {
    newSorter = {
      ...sorter,
      [key]:
        index[key] === 'text'
          ? undefined
          : sorter[key] === undefined
          ? 1
          : sorter[key] === 1
          ? -1
          : undefined,
    }
    // tail sorter switches bewteen 2 states: [1 or -1, undefined]
  } else if (index[keys[currentIndex - 1]] !== 'text') {
    const isReverseOrder =
      (index[keys[currentIndex - 1]] as 1 | -1) +
        sorter[keys[currentIndex - 1]]! ===
      0
    if (isReverseOrder) {
      newSorter = {
        ...sorter,
        [key]:
          index[key] === 'text'
            ? undefined
            : sorter[key] === undefined
            ? (-index[key] as 1 | -1)
            : undefined,
      }
    } else {
      newSorter = {
        ...sorter,
        [key]:
          index[key] === 'text'
            ? undefined
            : sorter[key] === undefined
            ? (index[key] as 1 | -1)
            : undefined,
      }
    }
  }
  if (!checkSort(index, newSorter)) {
    return {}
  }
  return newSorter
}
