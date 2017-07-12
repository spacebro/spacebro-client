import test from 'ava'
import sleep from 'sleep-promise'

import { SpacebroClient } from '../src/spacebro-client'

const SB_TEST_ADDRESS = process.env.SB_TEST_ADDRESS || 'spacebro.space'
const SB_TEST_PORT = process.env.SB_TEST_PORT || 3333

test('connect', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: 'spacebro-client-test-connect',
    client: {name: 'connect1'},
    verbose: false
  })

  client.on('connect', () => {
    t.pass('Connected')
  })
  await sleep(5000)
})

test('connect - Wrong address', async (t) => {
  const client = new SpacebroClient({
    host: 'a.wrong.address',
    port: 12345,
    channelName: 'spacebro-client-test-connect',
    client: {name: 'connect2'},
    verbose: false
  })

  client.on('connect_error', (err) => {
    t.pass('Connection error')
    t.skip.is(err, 'Cannot find server at address "a.wrong.address:12345"')
  })
  await sleep(5000)
})

test('connect - Wrong port', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: 12345,
    channelName: 'spacebro-client-test-connect',
    client: {name: 'connect3'},
    verbose: false
  })

  client.on('connect_error', (err) => {
    t.pass('Connection error')
    t.skip.is(err, 'Cannot connect to server - wrong port')
  })
  await sleep(5000)
})

test('connect - Delayed', async (t) => {
  const client = new SpacebroClient({
    host: 'whatever',
    port: 12345,
    channelName: 'spacebro-client-test-connect-delayed',
    client: {name: 'connect'},
    verbose: false
  }, false)

  client.connect(SB_TEST_ADDRESS, SB_TEST_PORT)
  client.on('connect', () => {
    t.pass('Connected')
  })
  await sleep(5000)
})

test('connect - Without host', (t) => {
  const consoleWarn = console.warn
  const warnings = []
  console.warn = (message) => warnings.push(message)

  /* eslint-disable no-new */
  new SpacebroClient({
    port: 12345,
    verbose: false
  })

  console.warn = consoleWarn
  t.deepEqual(warnings, ['Cannot connect without host address and port'])
})

test('connect - Without port', (t) => {
  const consoleWarn = console.warn
  const warnings = []
  console.warn = (message) => warnings.push(message)

  /* eslint-disable no-new */
  new SpacebroClient({
    host: SB_TEST_ADDRESS,
    verbose: false
  })

  console.warn = consoleWarn
  t.deepEqual(warnings, ['Cannot connect without host address and port'])
})

test.serial('disconnect', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: 'spacebro-client-test-disconnect',
    client: {name: 'connect4'},
    verbose: false
  })

  t.plan(2)

  client.on('connect', async () => {
    const consoleError = console.error
    const errors = []

    console.error = (err) => {
      errors.push(err)
    }

    client.on('disconnect', () => t.pass('Disconnected'))
    client.disconnect()
    client.emit('what', () => 'ever')

    t.deepEqual(errors, [
      'Error: "connect4" is disconnected and cannot emit "what"'
    ])
    console.error = consoleError
  })
  await sleep(5000)
})
