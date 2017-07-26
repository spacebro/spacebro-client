import test from 'ava'
import sleep from 'sleep-promise'
import util from 'util'

import { SpacebroClient } from '../src/spacebro-client'

const SB_TEST_ADDRESS = process.env.SB_TEST_ADDRESS || 'spacebro.space'
const SB_TEST_PORT = process.env.SB_TEST_PORT || 3333

function connectSendback (name) {
  return new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: `spacebro-client-test-${name}`,
    client: {name: name},
    sendBack: false,
    verbose: false
  })
}

function inspect (obj) {
  return util.inspect(obj, {showHidden: false, depth: null})
}

test('connect - Sendback with object', async (t) => {
  const client = connectSendback('sendBack-object')

  t.plan(0)

  client.on('sendBack', (data) => t.fail(`Received own data: ${inspect(data)}`))
  client.on('connect', () => {
    client.emit('sendBack', {})
  })
  await sleep(5000)
})

test('connect - Sendback with no data', async (t) => {
  const client = connectSendback('sendBack-no-data')

  t.plan(0)

  client.on('sendBack', (data) => t.fail(`Received own data: ${inspect(data)}`))
  client.on('connect', () => {
    client.emit('sendBack')
  })
  await sleep(5000)
})

test('connect - Sendback with string', async (t) => {
  const client = connectSendback('sendBack-string')

  t.plan(0)

  client.on('sendBack', (data) => t.fail(`Received own data: ${inspect(data)}`))
  client.on('connect', () => {
    client.emit('sendBack', 'helloWorld')
  })
  await sleep(5000)
})

test('connect - Sendback with Number', async (t) => {
  const client = connectSendback('sendBack-number')

  t.plan(0)

  client.on('sendBack', (data) => t.fail(`Received own data: ${inspect(data)}`))
  client.on('connect', () => {
    client.emit('sendBack', 42)
  })
  await sleep(5000)
})

test('connect - Sendback with Array', async (t) => {
  const client = connectSendback('sendBack-array')

  t.plan(0)

  client.on('sendBack', (data) => t.fail(`Received own data: ${inspect(data)}`))
  client.on('connect', () => {
    client.emit('sendBack', [1, 2, 3])
  })
  await sleep(5000)
})
