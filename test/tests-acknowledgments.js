import test from 'ava'
import sleep from 'sleep-promise'

import { SpacebroClient } from '../src/spacebro-client'

const SB_TEST_ADDRESS = process.env.SB_TEST_ADDRESS || 'spacebro.space'
const SB_TEST_PORT = process.env.SB_TEST_PORT || 3333

test('receive ack with connection', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: 'spacebro-client-test-receive-ack-connection',
    client: {name: 'connect-connections'},
    verbose: false,
    connection: 'connect-connections/outMedia => connect-connections/inMedia'
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
