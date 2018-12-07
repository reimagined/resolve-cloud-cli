/* eslint-disable no-underscore-dangle */
const commander = jest.genMockFromModule('commander')

const { command, option, description, action } = commander

const bind = () => {
  command.mockReturnValue(commander)
  option.mockReturnValue(commander)
  description.mockReturnValue(commander)
  action.mockReturnValue(commander)
}

commander.__clearMocks = () => {
  command.mockClear()
  option.mockClear()
  description.mockClear()
  action.mockClear()
  bind()
}

bind()

module.exports = commander
