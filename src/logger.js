'use strict'

import isNode from './is-node'
import chalk from 'chalk'

let verbose = true
const base = 'spacebro-client -'
const prefix = {
  log: base,
  info: isNode ? chalk.blue(base) : base,
  warn: isNode ? chalk.yellow(base) : base,
  error: isNode ? chalk.red(base) : base
}
// chalk does not seem to work here.
// This is not important but one should take a look at some point

function setup (_verbose) {
  verbose = _verbose
}

function log (...args) {
  verbose && console.log(prefix.log, ...args)
}

function info (...args) {
  verbose && console.log(prefix.info, ...args)
}

function warn (...args) {
  verbose && console.log(prefix.warn, ...args)
}

function error (...args) {
  verbose && console.log(prefix.error, ...args)
}

export default { setup, log, warn, info, error }