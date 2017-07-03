import test from 'ava'
import sleep from 'sleep-promise'

import client from '../src/spacebro-client'

function connect (name) {
  client.connect('spacebro.space', 3333, {
    channelName: `spacebro-client-test-${name}`,
    clientName: name,
    verbose: false
  })
}

test.afterEach.always((t) => {
  client.disconnect()
})

test.serial.cb('emit/on - after connect', (t) => {
  client.on('connect', () => {
    client.emit('hello')
  })
  client.on('hello', (data) => {
    t.pass('Message received')
    t.deepEqual(data, { _from: 'emit-on-after-connect', _to: null })
    t.end()
  })
  connect('emit-on-after-connect')
})

test.serial.cb('emit/on - no data', (t) => {
  connect('emit-on-no-data')

  client.on('connect', () => {
    client.emit('hello')
  })
  client.on('hello', (data) => {
    t.pass('Message received')
    t.deepEqual(data, { _from: 'emit-on-no-data', _to: null })
    t.end()
  })
})

test.serial.cb('emit/on - with string', (t) => {
  connect('emit-on-with-data')

  client.on('connect', () => {
    client.emit('hello', 'abcd')
  })
  client.on('hello', (data) => {
    t.pass('Message received')
    t.deepEqual(data, 'abcd')
    t.end()
  })
})

test.serial.failing('Double on', async (t) => {
  connect('double-on')

  t.plan(2)

  client.on('connect', () => {
    client.emit('hello')
  })
  client.on('hello', () => t.pass('Message received'))
  client.on('hello', () => t.pass('Message received again'))

  await sleep(200)
})

test.serial('once', async (t) => {
  connect('once')

  t.plan(1)

  client.on('connect', () => {
    client.emit('hello')
    client.emit('hello')
  })
  client.once('hello', () => t.pass('Message received'))

  await sleep(200)
})

test.serial.cb('off', (t) => {
  connect('once')

  t.plan(1)

  client.on('connect', async () => {
    client.emit('hello')
    await sleep(200)
    client.off('hello')
    client.emit('hello')
    await sleep(200)
    t.end()
  })
  client.on('hello', () => t.pass('Message received'))
})
