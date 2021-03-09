/* eslint-disable prefer-arrow-callback */
const FormData = jest.fn(function constructor() {})

FormData.prototype.append = jest.fn()
FormData.prototype.getBoundary = jest.fn()
FormData.prototype.getLength = jest.fn((cb) => cb(null, 333))

module.exports = FormData
