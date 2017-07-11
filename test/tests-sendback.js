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

test('connect - Sendback', async (t) => {
  const client = connectSendback('sendBack')

  t.plan(0)

  client.on('sendBack', (data) => t.fail(`Received own data: ${inspect(data)}`))
  client.on('connect', () => {
    client.emit('sendBack', {})
  })
  await sleep(5000)
})

test.failing('connect - Sendback with special data', async (t) => {
  const client = connectSendback('sendBack-special-data')

  t.plan(0)

  client.on('sendBack', (data) => t.fail(`Received own data: ${inspect(data)}`))
  client.on('connect', () => {
    client.emit('sendBack')
    client.emit('sendBack', 'helloWorld')
  })
  await sleep(5000)
})
