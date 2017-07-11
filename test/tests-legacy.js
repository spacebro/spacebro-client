import test from 'ava'
import sleep from 'sleep-promise'

import sbClient from '../src/spacebro-client'

test('connect - Legacy version', async (t) => {
  const consoleWarn = console.warn
  const warnings = []
  console.warn = (message) => warnings.push(message)

  sbClient.connect('spacebro.space', 3333, {
    channelName: 'spacebro-client-test-legacy-connect',
    clientName: 'connect1',
    verbose: false
  })

  sbClient.on('connect', () => {
    t.pass('Connected')
  })
  await sleep(5000)
  sbClient.disconnect()

  t.deepEqual(warnings, [
    'DEPRECATED: clientName is deprecated, please use `client: {name: \'connect1\'}` instead'
  ])
  console.warn = consoleWarn
})

test.serial('emit / on - Before connect (legacy version)', async (t) => {
  const consoleWarn = console.warn
  const warnings = []
  console.warn = (message) => warnings.push(message)

  sbClient.on('connect', () => {
    sbClient.emit('hello')
  })
  sbClient.on('hello', (data) => {
    t.pass('Message received')
    t.deepEqual(data, { _from: 'emit-on-before-connect', _to: null })
  })
  sbClient.connect('spacebro.space', 3333, {
    channelName: 'spacebro-client-test-emit-on-before-connect',
    clientName: 'emit-on-before-connect',
    verbose: false
  })
  await sleep(5000)
  sbClient.disconnect()

  t.deepEqual(warnings, [
    'DEPRECATED: clientName is deprecated, please use `client: {name: \'emit-on-before-connect\'}` instead'
  ])
  console.warn = consoleWarn
})
