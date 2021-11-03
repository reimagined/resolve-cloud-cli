import ProgressBar from 'progress'

class Bar extends ProgressBar {
  constructor(format: string, options: ProgressBar.ProgressBarOptions & { format?: string }) {
    const { format: formatOutput, ...barOptions } = options
    if (formatOutput == null) {
      super(format, barOptions)
    } else {
      super(format, barOptions)
      this.tick = () => {}
    }
  }
}

export default Bar
