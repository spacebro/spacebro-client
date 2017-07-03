import test from 'ava'

import client from '../src/spacebro-client'

test('Simple create', async (t) => {
  const myClient = await client.create('spacebro.space', 3333, {
    channelName: 'spacebro-client-test-connect',
    clientName: 'connect1',
    verbose: false
  })

  await new Promise((resolve, reject) => {
    myClient.on('hello', () => {
      t.pass('Message received')
      resolve()
    })
    myClient.emit('hello')
  })
})

test('create - wrong address', async (t) => {
  await t.throws(client.create('a.wrong.address', 12345, {
    channelName: 'spacebro-client-test-connect',
    clientName: 'connect2',
    verbose: false
  }))
})
