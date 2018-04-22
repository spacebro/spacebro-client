import test from 'ava'
import sleep from 'sleep-promise'

import { SpacebroClient } from '../src/spacebro-client'

const SB_TEST_ADDRESS = process.env.SB_TEST_ADDRESS || 'https://yoga.estu.la/'
const SB_TEST_PORT = process.env.SB_TEST_PORT || 0

// There is an issue with socket.io-client when running in node, it replies transport error 503
// instead of reaching socket.io server.
// This does not happen in web.

test.failing('connect https', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: 'spacebro-client-test-connect-https',
    client: {name: 'connect1i-https'},
    verbose: false
  })

  client.on('connect', () => {
    t.pass('Connected')
  })
  await sleep(5000)
})

test.failing('receive ack with connection', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: 'spacebro-client-test-receive-ack-connection-https',
    client: {name: 'connect-connections-https'},
    verbose: false,
    connection: 'connect-connections-https/outMedia => connect-connections-https/inMedia'
  })

  client.on('connect', () => {
    client.emit('outMedia', {
      that: 'message'
    }, function (data) {
      t.is(data, '_pong')
    })
  })

  client.on('inMedia', (data, fn) => {
    fn('_pong')
  })
  await sleep(5000)
})
