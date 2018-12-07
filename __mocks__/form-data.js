function FormData(options, data) {
  this.options = options
  this.data = data || {}
}

FormData.prototype.append = jest.fn(function append(name, value) {
  this.data[name] = value
})

FormData.prototype.getBoundary = jest.fn(() => 'data-boundary')

module.exports = FormData
