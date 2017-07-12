import test from 'ava'
import sleep from 'sleep-promise'

import { SpacebroClient, setDefaultSettings } from '../src/spacebro-client'

const SB_TEST_ADDRESS = process.env.SB_TEST_ADDRESS || 'spacebro.space'
const SB_TEST_PORT = process.env.SB_TEST_PORT || 3333

test('setDefaultSettings', async (t) => {
  setDefaultSettings({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: 'spacebro-client-test-set-default',
    client: {name: 'default-settings'},
    verbose: false
  })

  const client = new SpacebroClient()

  client.on('connect', () => {
    client.emit('hello')
  })
  client.on('hello', (data) => {
    t.pass('Message received')
    t.deepEqual(data, { _from: 'default-settings', _to: null })
  })

  t.deepEqual(
    client.config,
    {
      packers: [],
      unpackers: [],
      sendBack: true,
      multiService: false,
      host: SB_TEST_ADDRESS,
      port: SB_TEST_PORT,
      channelName: 'spacebro-client-test-set-default',
      client: {name: 'default-settings'},
      verbose: false
    }
  )

  await sleep(5000)
})

test('setDefaultSettings - no arg', (t) => {
  const consoleWarn = console.warn
  const warnings = []
  console.warn = (message) => warnings.push(message)

  setDefaultSettings()

  console.warn = consoleWarn
  t.deepEqual(warnings, ['Cannot load standard-settings; did you add it to node_modules?'])
})
