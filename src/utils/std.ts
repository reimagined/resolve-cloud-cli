import log, { Consola } from 'consola'
import Mustache from 'mustache'
import dateFormat from 'dateformat'
import * as utils from 'util'

const { render } = Mustache
Mustache.escape = (v) => v

export const out = (content: any) => console.log(content)
export const err = (content: any) => console.error(content)

// eslint-disable-next-line import/no-mutable-exports
export let logger = log

export const disableLogger = () => {
  const emptyFunction = () => {}

  logger = {
    fatal: log.fatal,
    error: log.error,
    warn: emptyFunction,
    log: emptyFunction,
    info: emptyFunction,
    start: emptyFunction,
    success: emptyFunction,
    ready: emptyFunction,
    debug: emptyFunction,
    trace: emptyFunction,
  } as unknown as Consola
}

export const enableLogger = () => {
  logger = log
}

// Just a proposal! --format={{ json }} dumps result as JSON with all the context
const createView = (view: any) => ({
  ...view,
  json: function thisToJSON() {
    return JSON.stringify(this)
  },
})

export const renderByTemplate = (template: string | undefined, view: any): boolean => {
  if (template != null && template?.length > 0) {
    const result = render(template, createView(view))
    if (result.trim().length === 0) {
      throw new Error(`Formatting failed: ${template}`)
    }
    out(result)
    return true
  }
  return false
}

export const formatEvent = (event: Record<string, any> | null) => {
  try {
    return event
      ? `${event.type !== 'Init' ? dateFormat(new Date(event.timestamp), 'm/d/yy HH:MM:ss') : ''} ${
          event.type
        }`
      : 'N\\A'
  } catch (error) {
    setImmediate(() => logger.trace('Bad event:', utils.inspect(event, undefined, null)))
    return `${error}`
  }
}
