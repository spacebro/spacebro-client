import test from 'ava'
import sleep from 'sleep-promise'

import { SpacebroClient } from '../src/spacebro-client'

test('connect', async (t) => {
  const client = new SpacebroClient('spacebro.space', 3333, {
    channelName: 'spacebro-client-test-connect',
    client: {name: 'connect1'},
    verbose: false
  })

  client.on('connect', () => {
    t.pass('Connected')
  })
  await sleep(5000)
})

test('connect - Wrong address', async (t) => {
  const client = new SpacebroClient('a.wrong.address', 12345, {
    channelName: 'spacebro-client-test-connect',
    client: {name: 'connect2'},
    verbose: false
  })

  client.on('connect_error', (err) => {
    t.pass('Connection error')
    t.skip.is(err, 'Cannot find server at address "a.wrong.address:12345"')
  })
  await sleep(5000)
})

test('connect - Wrong port', async (t) => {
  const client = new SpacebroClient('spacebro.space', 12345, {
    channelName: 'spacebro-client-test-connect',
    client: {name: 'connect3'},
    verbose: false
  })

  client.on('connect_error', (err) => {
    t.pass('Connection error')
    t.skip.is(err, 'Cannot connect to server - wrong port')
  })
  await sleep(5000)
})

test.failing('disconnect', async (t) => {
  const client = new SpacebroClient('spacebro.space', 3333, {
    channelName: 'spacebro-client-test-connect',
    client: {name: 'connect4'},
    verbose: false
  })

  t.plan(2)

  client.on('connect', async () => {
    client.on('disconnect', () => t.pass('Disconnected'))
    client.disconnect()

    await sleep(2000)
    await t.throws(() => client.emit('what', () => 'ever'))
  })
  await sleep(5000)
})
