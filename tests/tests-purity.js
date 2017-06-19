import test from 'ava'
import sleep from 'sleep-promise'

import spacebroClient from '../src/spacebro-client.js'

test.failing.serial('clientName', async t => {
  spacebroClient.connect('spacebro.space', 3333, {
    clientName: 'client1',
    channelName: 'channelTest',
    verbose: false,
    sendBack: false
  })

  spacebroClient.connect('spacebro.space', 3333, {
    clientName: 'client2',
    channelName: 'channelTest',
    verbose: false,
    sendBack: false
  })

  await sleep(200) // waits 200ms for connection to be estalished

  const clients = []

  spacebroClient.on('testMessage', (data) => {
    clients.push(data._from)
  })
  spacebroClient.emit('testMessage')

  await sleep(200) // waits 200ms for messages to be sent

  t.deepEqual(clients, ['client1', 'client2'])
})
