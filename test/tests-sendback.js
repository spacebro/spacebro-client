import test from 'ava'
import sleep from 'sleep-promise'
import util from 'util'

import { SpacebroClient } from '../src/spacebro-client'

function connectSendback (name) {
  return new SpacebroClient({
    host: 'spacebro.space',
    port: 3333,
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

test.failing('connect - Sendback with string', async (t) => {
  const client = connectSendback('sendBack-string')

  t.plan(0)

  client.on('sendBack', (data) => t.fail(`Received own data: ${inspect(data)}`))
  client.on('connect', () => {
    client.emit('sendBack', 'helloWorld')
  })
  await sleep(5000)
})

test.failing('connect - Sendback with Number', async (t) => {
  const client = connectSendback('sendBack-number')

  t.plan(0)

  client.on('sendBack', (data) => t.fail(`Received own data: ${inspect(data)}`))
  client.on('connect', () => {
    client.emit('sendBack', 42)
  })
  await sleep(5000)
})

test.failing('connect - Sendback with Array', async (t) => {
  const client = connectSendback('sendBack-array')

  t.plan(0)

  client.on('sendBack', (data) => t.fail(`Received own data: ${inspect(data)}`))
  client.on('connect', () => {
    client.emit('sendBack', [1, 2, 3])
  })
  await sleep(5000)
})
