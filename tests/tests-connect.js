import test from 'ava'
import sleep from 'sleep-promise'

import sbClient, { SpacebroClient } from '../src/spacebro-client'

test('Simple connect', async (t) => {
  sbClient.connect('spacebro.space', 3333, {
    channelName: 'spacebro-client-test-connect',
    clientName: 'connect1',
    verbose: false
  })

  sbClient.on('connect', () => {
    t.pass('Connected')
  })
  await sleep(500)
  sbClient.disconnect()
})

test('connect - wrong address', async (t) => {
  const client = new SpacebroClient('a.wrong.address', 12345, {
    channelName: 'spacebro-client-test-connect',
    clientName: 'connect2',
    verbose: false
  })

  client.on('connect_error', (err) => {
    t.pass('Connection error')
    t.skip.is(err, 'Cannot find server at address "a.wrong.address:12345"')
  })
  await sleep(500)
})

test('connect - wrong port', async (t) => {
  const client = new SpacebroClient('spacebro.space', 12345, {
    channelName: 'spacebro-client-test-connect',
    clientName: 'connect3',
    verbose: false
  })

  client.on('connect_error', (err) => {
    t.pass('Connection error')
    t.skip.is(err, 'Cannot connect to server - wrong port')
  })
  await sleep(500)
})

test.failing('disconnect', async (t) => {
  const client = new SpacebroClient('spacebro.space', 3333, {
    channelName: 'spacebro-client-test-connect',
    clientName: 'connect4',
    verbose: false
  })

  t.plan(2)

  client.on('connect', async () => {
    client.on('disconnect', () => t.pass('Disconnected'))
    client.disconnect()

    await sleep(200)
    await t.throws(() => client.emit('what', () => 'ever'))
  })
  await sleep(500)
})
