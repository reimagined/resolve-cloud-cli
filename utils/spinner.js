// TODO: check deprecation
const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

module.exports = () => {
  let timeout = null
  let index = 0

  return {
    spin: () => {
      const next = () => {
        process.stdout.write(`\r${frames[index % frames.length]}`)
        index++
        timeout = setTimeout(next, 80)
      }
      next()
    },
    stop: () => {
      clearTimeout(timeout)
    }
  }
}
