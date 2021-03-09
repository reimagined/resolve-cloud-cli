import log from 'consola'
import Mustache from 'mustache'

const { render } = Mustache
Mustache.escape = (v) => v

export const out = (content: any) => console.log(content)
export const err = (content: any) => console.error(content)
export const logger = log

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
