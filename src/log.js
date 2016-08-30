'use strict'

import config from './config'

// = Helpers ===
function log (...args) {
  if (!config.verbose) {
    return
  } else {
    console.log('SpaceBro -', ...args)  
  }
}

export default log