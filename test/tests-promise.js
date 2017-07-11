import test from 'ava'
import sleep from 'sleep-promise'

import client from '../src/spacebro-client'

test('create', async (t) => {
  const myClient = await client.create({
    host: 'spacebro.space',
    port: 3333,
    channelName: 'spacebro-client-test-create',
    client: {name: 'connect1'},
    verbose: false
  })

  myClient.on('hello', () => {
    t.pass('Message received')
  })
  myClient.emit('hello')
  await sleep(5000)
})

test('create - Wrong address', async (t) => {
  await t.throws(client.create({
    host: 'a.wrong.address',
    port: 12345,
    channelName: 'spacebro-client-test-wrong-create',
    client: {name: 'connect2'},
    verbose: false
  }))
})
