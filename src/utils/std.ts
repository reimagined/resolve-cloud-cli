import log, { Consola } from 'consola'
import Mustache from 'mustache'

const { render } = Mustache
Mustache.escape = (v) => v

export const out = (content: any) => console.log(content)
export const err = (content: any) => console.error(content)

// eslint-disable-next-line import/no-mutable-exports
export let logger = log

export const disableLogger = () => {
  const emptyFunction = () => {}

  logger = ({
    fatal: emptyFunction,
    error: emptyFunction,
    warn: emptyFunction,
    log: emptyFunction,
    info: emptyFunction,
    start: emptyFunction,
    success: emptyFunction,
    ready: emptyFunction,
    debug: emptyFunction,
    trace: emptyFunction,
  } as unknown) as Consola
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
