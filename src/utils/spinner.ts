// TODO: check deprecation
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

module.exports = () => {
  let timeout: any = null
  let index = 0

  return {
    spin: () => {
      const next = () => {
        process.stdout.write(`\r${spinnerFrames[index % spinnerFrames.length]}`)
        index++
        timeout = setTimeout(next, 80)
      }
      next()
    },
    stop: () => {
      clearTimeout(timeout)
    },
  }
}
