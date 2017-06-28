import test from 'ava'
import sleep from 'sleep-promise'

import client from '../src/spacebro-client'

test.cb.failing('connect - sendback', (t) => {
  client.connect('spacebro.space', 3333, {
    channelName: 'spacebro-client-test-sendback',
    clientName: 'sendback',
    sendback: false,
    verbose: false
  })

  client.on('connect', async () => {
    t.pass('Connected')

    client.on('sendback', () => t.fail('Received own data'))
    client.emit('sendback')
    client.emit('sendback', {})
    client.emit('sendback', 'helloWorld')
    await sleep(200)

    t.end()
  })
})
