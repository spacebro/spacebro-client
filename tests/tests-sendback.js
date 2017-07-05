import test from 'ava'
import sleep from 'sleep-promise'

import client from '../src/spacebro-client'

test.failing('connect - sendback', async (t) => {
  client.connect('spacebro.space', 3333, {
    channelName: 'spacebro-client-test-sendback',
    clientName: 'sendback',
    sendback: false,
    verbose: false
  })

  client.on('connect', () => {
    t.pass('Connected')

    client.on('sendback', () => t.fail('Received own data'))
    client.emit('sendback')
    client.emit('sendback', {})
    client.emit('sendback', 'helloWorld')
  })
  await sleep(500)
})
