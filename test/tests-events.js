import test from 'ava'
import sleep from 'sleep-promise'

import { SpacebroClient } from '../src/spacebro-client'

function connect (name) {
  return new SpacebroClient('spacebro.space', 3333, {
    channelName: `spacebro-client-test-${name}`,
    clientName: name,
    verbose: false
  })
}

test('emit / on - No data', async (t) => {
  const client = connect('emit-on-no-data')

  client.on('connect', () => {
    client.emit('hello')
  })
  client.on('hello', (data) => {
    t.pass('Message received')
    t.deepEqual(data, { _from: 'emit-on-no-data', _to: null })
  })
  await sleep(5000)
})

test('emit / on - With string', async (t) => {
  const client = connect('emit-on-with-string')

  client.on('connect', () => {
    client.emit('hello', 'abcd')
  })
  client.on('hello', (data) => {
    t.pass('Message received')
    t.deepEqual(data, 'abcd')
  })
  await sleep(5000)
})

test.failing('on - Twice with same event name', async (t) => {
  const client = connect('double-on')

  t.plan(2)

  client.on('connect', () => {
    client.emit('hello')
  })
  client.on('hello', () => t.pass('Message received'))
  client.on('hello', () => t.pass('Message received again'))

  await sleep(5000)
})

test('once', async (t) => {
  const client = connect('once')

  t.plan(1)

  client.on('connect', () => {
    client.emit('hello')
    client.emit('hello')
  })
  client.once('hello', () => t.pass('Message received'))

  await sleep(5000)
})

test.failing('on - Wildcard', async (t) => {
  const client = connect('emit-on-wildcard')

  client.on('connect', () => {
    client.emit('hello')
  })
  client.on('*', (data) => {
    t.pass('Message received')
  })
  await sleep(5000)
})

test('off', async (t) => {
  const client = connect('off')

  t.plan(1)

  client.on('connect', async () => {
    client.emit('hello')
    await sleep(5000)
    client.off('hello')
    client.emit('hello')
  })
  client.on('hello', () => t.pass('Message received'))
  await sleep(5000)
})
