/* eslint-disable prefer-arrow-callback */
const FormData = jest.fn(function constructor() {})

FormData.prototype.append = jest.fn()
FormData.prototype.getBoundary = jest.fn()

module.exports = FormData
