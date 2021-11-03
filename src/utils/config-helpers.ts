export function get(object: any, deepKey: string) {
  if (deepKey === '') {
    return object
  }
  const selector = deepKey.split('.')
  return selector.reduce((xs, x) => (xs != null && xs[x] != null ? xs[x] : null), object)
}

export function set(object: any, deepKey: string, value: any) {
  const selectorFull = deepKey.split('.')
  const selector = selectorFull.slice(0, -1)
  const lastKey = selectorFull.slice(-1)[0]
  const obj = selector.reduce((xs, x) => {
    if (xs != null) {
      if (xs[x] === undefined) {
        xs[x] = {}
      }
      return xs[x] != null ? xs[x] : null
    }
    return null
  }, object)
  if (obj != null && lastKey != null) {
    obj[lastKey] = value
  }
}

export function unset(object: any, deepKey: string) {
  const selectorFull = deepKey.split('.')
  const selector = selectorFull.slice(0, -1)
  const lastKey = selectorFull.slice(-1)[0]
  const obj = get(object, selector.join('.'))
  if (obj != null && lastKey != null) {
    delete obj[lastKey]
  }
}
