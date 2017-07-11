import test from 'ava'

import { _dontGetSettings } from '../src/getSettings'
import { SpacebroClient } from '../src/spacebro-client'

test('connect - Without standard-settings', (t) => {
  const consoleWarn = console.warn
  const warnings = []
  console.warn = (message) => warnings.push(message)

  _dontGetSettings()
  /* eslint-disable no-new */
  new SpacebroClient()

  console.warn = consoleWarn
  t.deepEqual(warnings, [
    'SpacebroClient instance constructed without options; and service.spacebro not found in standard-settings',
    'Cannot connect without host address and port from standard-settings'
  ])
})
