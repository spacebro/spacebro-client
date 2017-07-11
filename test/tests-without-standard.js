import test from 'ava'

import { SpacebroClient } from '../src/spacebro-client'

test('connect - Without standard-settings', (t) => {
  const consoleWarn = console.warn
  const warnings = []
  console.warn = (message) => warnings.push(message)

  /* eslint-disable no-new */
  new SpacebroClient()

  console.warn = consoleWarn
  t.deepEqual(warnings, [
    'SpacebroClient instance constructed without options; and standard-settings was not loaded',
    'Cannot connect without host address and port from standard-settings'
  ])
})
