'use strict'

import isNode from './is-node'
import chalk from 'chalk'

const base = 'spacebro-client -'
const prefix = {
  log: base,
  info: isNode ? chalk.blue(base) : base,
  warn: isNode ? chalk.yellow(base) : base,
  error: isNode ? chalk.red(base) : base
}
// chalk does not seem to work here.
// This is not important but one should take a look at some point

class Logger {
  constructor (verbose) {
    this.verbose = verbose
  }

  log (...args) {
    this.verbose && console.log(prefix.log, ...args)
  }

  info (...args) {
    this.verbose && console.log(prefix.info, ...args)
  }

  warn (...args) {
    this.verbose && console.log(prefix.warn, ...args)
  }

  error (...args) {
    this.verbose && console.log(prefix.error, ...args)
  }
}

export default Logger
